# Chapter 4: Keeping Secrets

The first time I nearly pushed an API key to GitHub, I sat very still for about three seconds. Then came the `git reset --soft HEAD~1`, reading the diff line by line, and the specific relief of realizing the commit hadn't left my laptop yet. This was November 2025, early in the build. It was late, I was tired, and I'd pasted a `DATABASE_URL` straight into a config file to "test something real quick."

Nothing actually leaked. But the gap between *almost* and *actually* is mostly luck and timing, and I didn't love how much I was leaning on either. That was the night I stopped treating secrets as something I'd tidy up later and started treating them like networking or storage — a part of the system I had to design on purpose.

## Picking Vault

I wanted the boring, correct answer, not a clever one. Environment variables scattered through manifests, encrypted files checked into Git, a password manager I'd copy-paste from at 1 a.m. — none of those survive contact with more than one app and more than one bad night. What I needed was something that kept secrets encrypted at rest, handed them out to code instead of to me, could scope each app to only its own paths, synced into Kubernetes on its own, and didn't fall over when a node did.

That's HashiCorp Vault's entire job, so Vault it was.

I deployed it on November 17, 2025 in dev mode first — no persistence, no policies, just checking whether the pieces fit. They did. Secrets went in, secrets came back out, and the External Secrets Operator happily synced them into Kubernetes. Enough to prove the shape of it.

## Dev mode lies to you, politely

Dev mode is comfortable right up until the pod restarts and everything you stored is gone. Fine for a demo, useless for anything I actually wanted to depend on.

On November 23 I moved to a real production setup: persistent storage, proper initialization, unseal keys, policies. That's also where Vault stops being convenient. Production Vault *seals* itself whenever it restarts — the encryption keys get locked away, and it refuses to decrypt anything until you unseal it with a quorum of keys (3 of 5, the way I set it up). It's the right behavior. If someone walks off with the storage, all they get is ciphertext.

The catch is that a Raspberry Pi reboots more than you'd expect — power blips, kernel updates, the occasional Tuesday — and every reboot leaves Vault sealed. Sealed Vault means External Secrets stops syncing, which means apps quietly lose their credentials. I unsealed it by hand the first few times. Around the fifth, I gave up and wrote `scripts/operations/unseal-vault.sh`, which reads the keys from a Kubernetes secret and unseals every Vault pod for me. It isn't true auto-unseal — that wants a cloud KMS I've deliberately chosen not to have — but for a homelab it's close enough, and I stopped dreading reboots.

## One policy per app

The part of Vault I ended up appreciating most is that access is scoped by policy, not by "here's the whole vault, be careful." Every project got its own, and each one can read exactly one path:

- `canopy-policy` → `secret/canopy/*`
- `swimto-policy` → `secret/swimto/*`
- `openclaw-policy` → `secret/openclaw/*`
- `monitoring-policy` → `secret/monitoring/*`
- `infrastructure-policy` → `secret/pi-fleet/*`

Each app authenticates through a Kubernetes ServiceAccount tied to its role, so SwimTO physically can't read OpenClaw's secrets even if it tried, and monitoring can't reach into application credentials. The External Secrets Operator runs on a read-only policy (`eso-readonly-policy`): it can sync secrets out but can't change them. If something ever does get popped, the blast radius is one app's secrets, not all of them.

## The last single point of failure

By January the rest of the cluster had grown up — three nodes, a three-node control plane with embedded etcd, kube-vip fronting the API. HA where it counted, everywhere except Vault. Vault was still one pod on one node, married to a local PersistentVolume. Lose that node and Vault went with it, and when Vault goes down External Secrets stops and apps start failing to find credentials. It was the one piece left that could take the whole thing out.

On January 13, 2026 I moved it to HA with Raft integrated storage: three pods, one per node, one leader and two standbys replicating over Raft. A node dies, a new leader gets elected in seconds, and the apps never notice.

Getting there was a careful little dance. Back up every secret (`scripts/operations/backup-vault-secrets.sh`), flip the HelmRelease to HA, delete the old StatefulSet whose PVC was pinned to node-1, initialize the new Raft cluster, restore from backup, and hand External Secrets its new token. Maybe ten to fifteen minutes of downtime, most of it just waiting on FluxCD to reconcile the new release.

Then I did the thing you're supposed to do and usually don't: I tested it. Deleted the leader pod on purpose. Raft elected a new leader in eleven seconds, External Secrets carried on from the new leader, nothing was lost, no app so much as blinked. That was the point Vault felt production-ready instead of just configured to look that way.

## Getting in without opening the door

Secrets are one half of the story. The other half is reaching the cluster from outside without turning my home router into an attack surface. I settled on two layers: Tailscale for me, Cloudflare Tunnel for the public.

### Tailscale

I'd run plain WireGuard before. It's genuinely good — fast, clean protocol — but the setup is all ceremony: generate keys, trade public keys, hand-edit routing tables and firewall rules, copy configs onto every device. Do it once and it's fine. Do it for a homelab you hit from a laptop, a phone, and whatever else is in reach, and it wears thin fast.

Tailscale is WireGuard underneath with the ceremony taken away. Install, log in, done. I ran it on all three nodes as subnet routers, advertising the networks I care about:

- `192.168.2.0/24` — the home LAN and node management IPs
- `10.42.0.0/16` — the Kubernetes pod network
- `10.43.0.0/16` — the service network

From anything on my tailnet I can SSH to a node, curl a pod, load Grafana at `https://grafana.eldertree.local`, run `kubectl` — no port forwarding, no inbound rules. The tailnet auth key lives in Vault at `secret/pi-fleet/tailscale` and syncs in through External Secrets, so even the VPN's own credentials travel the same path as everything else.

It wasn't free, though. Tailscale drops routes for its advertised subnets into policy routing table 52, and those routes started intercepting the cross-node traffic k3s relies on for pod-to-pod networking. Things broke in the confusing, intermittent way networking always breaks. The fix was narrow: pull the `10.42.0.0/16` and `10.43.0.0/16` routes back out of table 52, and add a small systemd unit to do it again on every boot so it sticks. Tailscale and k3s get along now — they just needed a fence between them. (The full saga is Chapter 9.)

### Cloudflare Tunnel

A few things need to be reachable by the public — SwimTO, the Pitanga site, Northway Signal — and none of that is worth opening a port on my router for. Cloudflare Tunnel sidesteps the question entirely: the cluster dials *out* to Cloudflare's edge and holds the connection open, and Cloudflare proxies HTTPS back down through it. Nothing inbound, nothing forwarded, nothing to firewall.

I keep the tunnel config in Terraform like the rest of the infrastructure, with the token in Vault at `secret/pi-fleet/cloudflare-tunnel/token`. The `cloudflared` daemon runs in-cluster, connects up, and routes each hostname to its service:

- `swimto.eldertree.xyz` → SwimTO
- `pitanga.cloud` / `www.pitanga.cloud` → the Pitanga site
- `northwaysignal.pitanga.cloud` → Northway Signal

Public HTTPS, DDoS handling at the edge, and access policies if I want them — without a single exposed port at home.

## TLS on both sides

Two certificate stories run side by side. Internal `*.eldertree.local` services get certs from cert-manager backed by a self-signed CA I run myself. Browsers grumble about the self-signed root, which is fine — I trust my own CA, and the traffic is encrypted, which is the point. Public services use Cloudflare Origin Certificates: the edge terminates the public TLS session and re-encrypts down to the origin, so it's encrypted end to end without me juggling Let's Encrypt rate limits or ACME challenges.

## What stuck

A few things I believe now that I only knew abstractly before.

Keep secrets out of Git — not "encrypted in Git," out. A real secrets manager costs an afternoon to stand up and buys back the very specific dread of `git log --all -p | grep -i key`.

Scope everything. One policy per app, least privilege for the operator, so a bad day stays one app's bad day instead of the whole cluster's.

If secrets aren't highly available, nothing is. Vault down means External Secrets down means apps down. Raft fixed that, and I should have done it sooner than January.

Automate the second time something annoys you. Unsealing by hand twice is fine. By the fifth time it's a script.

And test the security you built, because untested failover is just a hopeful comment in a config file. Kill the leader. Revoke a token. Rotate a secret and watch whether the app actually picks up the new value. If you haven't watched it work, you don't know that it does.

That November near-miss turned out to be the good kind of scare — it made me build this before I needed it instead of after I'd regretted not having it. Six months on, there are no keys in Git, no passwords tucked into environment variables, and no plaintext secrets sitting around waiting to become a story I'd rather not tell.

---

*Next: [Chapter 5: Scaling Decisions, Not YAML](/chapters/05-scaling-decisions-not-yaml) — how GitOps and reusable workflows turned copy-paste into a platform pattern.*
