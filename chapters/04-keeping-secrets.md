# Chapter 4: Keeping Secrets

I wanted credentials out of Git. That sounds like a small requirement until several applications need them, deployments need to refresh them, and I need a way to change one without hunting through copies of a config file.

Vault became part of Eldertree because I wanted a place to manage those values deliberately. It also gave me another service to operate. Moving a credential out of a manifest doesn't remove the work; it changes where that work lives.

## Picking Vault

I wanted the boring, correct answer, not a clever one. Environment variables scattered through manifests, encrypted files checked into Git, a password manager I'd copy-paste from — none of those survive contact with more than one app and more than one bad night. What I needed was something that kept secrets encrypted at rest, handed them out to code instead of to me, could scope each app to only its own paths, synced into Kubernetes on its own, and didn't fall over when a node did.

That's HashiCorp Vault's entire job, so Vault it was.

The first dev-mode configuration went into Git on November 7, 2025. It was a way to check the shape of the setup before making it durable: secrets in Vault, the External Secrets Operator syncing them into Kubernetes, applications reading the resulting Secrets. That commit dates the configuration, not the exact moment every piece became healthy.

## Dev mode lies to you, politely

Dev mode is comfortable right up until the pod restarts and everything you stored is gone. Fine for a demo, useless for anything I actually wanted to depend on.

On November 15 I committed the production-mode configuration: persistent storage instead of a disposable dev server. Initialization, unseal keys, and policies became part of operating it. That's also where Vault stops being convenient. Production Vault *seals* itself whenever it restarts — the encryption keys get locked away, and it refuses to decrypt anything until you unseal it with a quorum of keys (3 of 5, the way I set it up). Vault encrypts its stored data, which is part of what I wanted. Protecting the unseal material and backups matters too; encrypted storage is one part of the security design.

The catch is that a Raspberry Pi reboots more than you'd expect — power blips, kernel updates, the occasional Tuesday — and every reboot leaves Vault sealed. Sealed Vault means External Secrets cannot refresh credentials from it. Existing Kubernetes Secrets do not disappear just because Vault is unavailable, but new synchronization and rotations can fail. I wrote `scripts/operations/unseal-vault.sh`, which uses the configured unseal material to unseal the Vault pods for me. It is scripted unsealing, not a Vault auto-unseal configuration backed by a separate seal provider. That distinction matters when I am deciding which failure it actually handles.

## A source of truth for secrets

The part of Vault I ended up appreciating most is having one place to manage a credential. Project paths and policies give me tools to scope access, but writing a policy is not the same as proving every application and integration uses the boundary I intended.

In this setup, Vault is the source of truth and External Secrets does the synchronization. The operator reads the configured values and creates Kubernetes Secrets; applications consume those through Secret references, including environment-variable injection where configured. They do not all log in to Vault with their own Kubernetes ServiceAccounts.

That took some care to explain honestly. Keeping the authoritative value in Vault, deciding what the operator can read, and deciding what a workload can consume are separate parts of the design. A per-project policy name is not enough to claim that any compromise would stop at one app.

## Making Vault less fragile

By January the cluster had grown to a three-node control plane with embedded etcd. Vault was still one pod on one node, married to a local PersistentVolume. Control-plane replication did not solve that separate dependency. Lose that node and Vault went with it. Existing applications could keep using credentials already synchronized to Kubernetes, but secret refreshes and new setup depended on getting Vault back. That was a dependency I wanted to make less fragile.

The January 13, 2026 change configured HA with Raft integrated storage: three pods, one per node, one leader and two standbys replicating over Raft. With a healthy quorum and working networking, the surviving members can elect a leader after one node fails. That protects Vault's availability; it does not guarantee that every application, database, or network path survives the same failure.

Getting there was a careful little dance. Back up every secret (`scripts/operations/backup-vault-secrets.sh`), flip the HelmRelease to HA, delete the old StatefulSet whose PVC was pinned to node-1, initialize the new Raft cluster, restore from backup, and hand External Secrets its new token. The migration needed a recovery plan as well as a Helm change. Three Raft members gave me a better foundation, but I should not turn the configuration into a measured recovery time or a promise of invisible failover. That needs a recorded test of the failure I actually care about.

## Getting in without opening the door

Secrets are one half of the story. The other half is reaching the cluster from outside without turning my home router into an attack surface. I settled on two layers: Tailscale for me, Cloudflare Tunnel for the public.

### Tailscale

I'd run plain WireGuard before. It's genuinely good — fast, clean protocol — but the setup is all ceremony: generate keys, trade public keys, hand-edit routing tables and firewall rules, copy configs onto every device. Do it once and it's fine. Do it for a homelab you hit from a laptop, a phone, and whatever else is in reach, and it wears thin fast.

Tailscale uses WireGuard with coordination and peer discovery around it. In the January setup, I ran the nodes as subnet routers and advertised these networks:

- `192.168.2.0/24` — the home LAN and node management IPs
- `10.42.0.0/16` — the Kubernetes pod network
- `10.43.0.0/16` — the service network

From a device on my tailnet with the appropriate access, I can SSH to a node, reach internal services, or run `kubectl` without forwarding an inbound port on my home router. The VPN credentials are managed through Vault too, rather than copied into committed configuration.

It wasn't free, though. The nodes were both advertising subnets and accepting routes advertised by peers. Those are separate settings. Accepted Tailscale routes in policy routing table 52 overlapped the networks k3s needed for cross-node pod traffic, and that path started intercepting traffic that should have stayed on the cluster network. Things broke in the confusing, intermittent way networking always breaks. The fix was narrow: pull the `10.42.0.0/16` and `10.43.0.0/16` routes back out of table 52, and add a small systemd unit to do it again on every boot so it sticks. That was the recorded workaround. Later configuration kept the cluster CIDRs out of the advertised routes and disabled route acceptance on those nodes. [Chapter 9](https://github.com/raolivei/pi-fleet-blog/pull/26) covers the difference.

### Cloudflare Tunnel

A few things need to be reachable by the public — SwimTO, the Pitanga site, Northway Signal — and none of that is worth opening a port on my router for. Cloudflare Tunnel sidesteps the question entirely: the cluster dials *out* to Cloudflare's edge and holds the connection open, and Cloudflare sends the request down that tunnel after terminating the public HTTPS connection. No inbound port forward on my home router. The connector still needs working outbound connectivity.

I keep the tunnel config in Terraform like the rest of the infrastructure, with its credential managed in Vault. The `cloudflared` daemon runs in-cluster, connects up, and routes each hostname to its service:

- `swimto.eldertree.xyz` → SwimTO
- `pitanga.cloud` / `www.pitanga.cloud` → the Pitanga site
- `northwaysignal.pitanga.cloud` → Northway Signal

Public HTTPS, DDoS handling at the edge, and access policies if I want them — without a single exposed port at home.

## Where the encryption stops

There are several connections here, and I had been describing them too loosely. Internal HTTPS services use cert-manager and the cluster's self-signed certificate setup. The client still has to trust the issuer; encryption and browser trust are different checks.

For public access, the browser uses HTTPS to Cloudflare and `cloudflared` carries traffic over an encrypted outbound tunnel. The recorded tunnel configuration then forwards to the local ingress over HTTP. Origin Certificates elsewhere in the setup do not make that final hop TLS. I can accurately call the browser connection and the tunnel encrypted, without claiming every hop to the application is HTTPS.

## What stuck

A few things I believe now that I only knew abstractly before.

Keep secrets out of Git — not "encrypted in Git," out. A real secrets manager costs an afternoon to stand up and buys back the very specific dread of `git log --all -p | grep -i key`.

Scope access and verify the boundary. A policy file is a starting point; the identities and Secret references actually used by the workloads are what make it effective.

Make the secret source resilient without pretending every outage is immediate application downtime. Raft addresses a Vault storage and availability problem; synchronized Kubernetes Secrets and application restart behavior are separate parts of the recovery story.

Automate the work I need to repeat. The unseal script makes that operation repeatable; I still need to check that Vault is usable afterward.

Test failure and recovery under controlled conditions. A successful secret rotation and a verified failover answer questions that a policy file or a replica count cannot. I need those checks before relying on the result.

The aim is to keep credentials out of committed configuration and manage them in Vault. Kubernetes Secrets can still deliver values through environment variables; the important distinction is where the authoritative value is stored and who can retrieve it. That needs continued checking, not a one-time declaration that secrets are solved.

---

*Next: [Chapter 5: Scaling Decisions, Not YAML](/chapters/05-scaling-decisions-not-yaml) — how GitOps and reusable workflows turned copy-paste into a platform pattern.*
