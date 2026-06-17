# Chapter 4: Keeping Secrets

The first time I almost committed an API key to GitHub, my heart stopped for about three seconds. Then came the frantic `git reset --soft HEAD~1`, the careful inspection of the diff, the relief when I realized I'd caught it in time. That was in November 2025, early in the cluster build. I was tired, working late, and had just pasted a DATABASE_URL into a config file "just to test something real quick."

We've all been there. The difference between "almost" and "actually" is usually luck, timing, or a very loud voice in your head that screams "WAIT" right before you hit enter.

That near-miss became the moment I decided to take secrets management seriously. Not as a "nice to have." Not as "we'll fix it later." But as a first-class concern, right alongside networking and storage.

## The Vault Decision

I needed a real secrets management solution. Not environment variables. Not encrypted files in Git. Not a password manager I manually copy-paste from. Something that could:

- Store secrets securely with encryption at rest
- Provide programmatic access (no human copy-paste)
- Support policy-based access control (each app gets only its secrets)
- Integrate with Kubernetes (automatically sync secrets to pods)
- Survive node failures (high availability)

The answer was HashiCorp Vault. Industry-standard, battle-tested, designed exactly for this problem.

On November 17, 2025, I deployed Vault to the cluster. Dev mode first—no persistence, no policies, just "does it work?" It worked. Secrets went in. Secrets came out. The External Secrets Operator could sync them to Kubernetes. Progress.

## Production Mode: When Things Get Real

Dev mode was fine for testing. But dev mode doesn't survive restarts. When the pod restarts, all secrets disappear. That's not production-ready. That's not even staging-ready.

On November 23, 2025, I migrated to production mode: persistent storage, proper initialization, unseal keys, policy-based access control. This is when Vault goes from "fun demo" to "critical infrastructure component."

Production Vault has a security feature that dev mode doesn't: **it seals on every restart**. Sealing means the encryption keys are locked away, and the Vault can't decrypt secrets until you manually unseal it with a quorum of unseal keys (3 of 5, in my case). This protects against someone stealing the storage and reading secrets directly.

The downside? Every time a Raspberry Pi reboots (power outage, kernel update, Tuesday), Vault is sealed. Applications can't get secrets. External Secrets Operator stops syncing. Everything breaks until you manually type in 3 unseal keys.

The first few times, I typed the keys manually. By the fifth time, I'd automated it: `./scripts/operations/unseal-vault.sh` reads the keys from a Kubernetes secret and unseals all Vault pods automatically. Not quite auto-unseal (which requires cloud KMS), but close enough for a homelab.

## Policy-Based Access Control

One of Vault's best features is policy-based access. Instead of "here's a giant secret store, good luck," you define policies that grant specific access to specific paths.

I created policies for every project:

- `canopy-policy` → can only read `secret/canopy/*`
- `swimto-policy` → can only read `secret/swimto/*`
- `openclaw-policy` → can only read `secret/openclaw/*`
- `monitoring-policy` → can only read `secret/monitoring/*`
- `infrastructure-policy` → can only read `secret/pi-fleet/*`

Each application gets a Kubernetes ServiceAccount with a role tied to its policy. SwimTO can't accidentally read OpenClaw's secrets. Monitoring can't access application credentials. Isolation by design.

The External Secrets Operator gets a read-only policy (`eso-readonly-policy`) that can sync secrets but not modify them. Least privilege, everywhere.

## High Availability: The Final Piece

By January 2026, the cluster had evolved. Three nodes. Three-node control plane with embedded etcd. High availability for everything critical: API access via kube-vip, etcd consensus, workload distribution.

Except Vault. Vault was still running in standalone mode on a single pod, pinned to a single node by its persistent volume. If that node failed, Vault went down. External Secrets stopped syncing. Applications lost access to credentials. The last single point of failure in the stack.

On January 13, 2026, I migrated Vault to high availability mode with Raft integrated storage.

**Before:**
- One Vault pod on one node
- Local filesystem storage
- Node failure = Vault down = cluster-wide secret outage

**After:**
- Three Vault pods (one per node)
- Raft consensus for replication
- One leader, two standbys
- Node failure = automatic leader election in <15 seconds
- Zero application impact during failover

The migration required careful planning:
1. Backup all secrets (`./scripts/operations/backup-vault-secrets.sh`)
2. Update the HelmRelease for HA mode
3. Delete the old StatefulSet (PVC pinned to node-1)
4. Initialize the new HA cluster with the init script
5. Restore secrets from backup
6. Update the External Secrets Operator token

Downtime: about 10-15 minutes. The longest outage was waiting for FluxCD to reconcile the new HelmRelease.

We tested failover by deleting the leader pod. Raft elected a new leader in 11 seconds. External Secrets continued syncing from the new leader. No data loss. No application impact. The cluster self-healed.

That's the moment Vault became truly production-ready.

## Remote Access: The Other Half of Security

Secrets are one half of the security story. The other half is: how do you access the cluster remotely without punching holes in your firewall?

The answer came in two layers: **Tailscale for private access** and **Cloudflare Tunnel for public services**.

### Tailscale: The VPN That Just Works

I'd used WireGuard before. It works. It's fast. It's also a pain to configure: generate keys, exchange public keys, configure routing tables, update firewall rules, distribute configs to every device. For a single VPN, fine. For a homelab that I access from multiple devices, it's too much ceremony.

Tailscale is WireGuard under the hood, but with all the ceremony automated. Install the client. Log in. Done. No keys. No config files. No firewall rules. It just works.

I deployed Tailscale on all three nodes as subnet routers, advertising the cluster networks:

- `192.168.2.0/24` — home network (management IPs)
- `10.42.0.0/16` — Kubernetes pod network
- `10.43.0.0/16` — Kubernetes service network

From my laptop, phone, or any device on my Tailnet, I can reach any node, any pod, any service. SSH into node-1. Hit Grafana at `https://grafana.eldertree.local`. Run `kubectl` commands. All through the VPN. No port forwarding. No firewall rules. Zero-config remote access.

The auth key lives in Vault at `secret/pi-fleet/tailscale`, synced to Kubernetes via External Secrets. Even the VPN credentials are managed securely.

There was one hiccup (see Chapter 9 for the full saga): Tailscale added routes in policy routing table 52 for the advertised subnets, which intercepted cross-node k3s traffic and broke pod-to-pod communication. The fix was surgical: delete the routes for `10.42.0.0/16` and `10.43.0.0/16` from table 52, and add a systemd service to do it on every boot. Tailscale and k3s coexist peacefully now, but they needed boundaries.

### Cloudflare Tunnel: Public Without the Exposure

Some services need to be publicly accessible: SwimTO (the Toronto pool schedule app), the Pitanga website, Northway Signal. But opening ports on my home router? No thanks. That's a surface area I don't want to defend.

Cloudflare Tunnel solves this elegantly: it creates an outbound-only connection from the cluster to Cloudflare's edge. No inbound ports. No port forwarding. No firewall changes. Cloudflare's edge proxies HTTPS traffic through the tunnel to the cluster.

I manage the tunnel configuration with Terraform (infrastructure as code, always). The tunnel token lives in Vault at `secret/pi-fleet/cloudflare-tunnel/token`. The cloudflared daemon runs in the cluster, connects to Cloudflare, and routes traffic to the correct services.

Public URLs:
- `swimto.eldertree.xyz` → SwimTO app
- `pitanga.cloud` / `www.pitanga.cloud` → Pitanga website
- `northwaysignal.pitanga.cloud` → Northway Signal

HTTPS by default. DDoS protection included. Access control via Cloudflare policies if needed. No exposed home network. It's the best of both worlds: public accessibility, private infrastructure.

## TLS Everywhere

The cluster runs two certificate strategies:

**Internal services** use cert-manager with a self-signed certificate authority. All `*.eldertree.local` services get TLS certificates from the cluster CA. Browsers complain (self-signed), but that's fine—I trust my own CA. The traffic is encrypted, which is what matters.

**Public services** use Cloudflare Origin Certificates. Cloudflare's edge terminates the public TLS connection, then re-encrypts with the origin certificate to the cluster. End-to-end encryption from browser to pod, no Let's Encrypt rate limits, no ACME challenges.

HTTPS everywhere. No plaintext HTTP. No "we'll add TLS later." Security from day one.

## The Lessons

Here's what I learned about secrets and security in six months of running a production homelab:

**Secrets belong in Vault, not in Git.** Not even encrypted. Not even in a private repo. Use a real secrets manager. The peace of mind is worth the setup time.

**Policy-based access is essential.** Every application gets exactly the secrets it needs, nothing more. Isolation prevents lateral movement if something gets compromised.

**High availability for secrets is critical.** If Vault goes down, everything goes down. HA mode with Raft ensures secrets survive node failures.

**Automation beats manual processes.** Unsealing Vault manually is fine twice. By the fifth time, automate it. Same with secret rotation, backup, and monitoring.

**Tailscale is dramatically simpler than WireGuard.** For homelab VPN, it's the right choice. Less ceremony, same security.

**Cloudflare Tunnel eliminates port forwarding risk.** Public services without exposed ports. It's the security model every homelab should use.

**TLS everywhere, always.** Even for internal services. Even for things "no one will see." Encryption is cheap. Breaches are expensive.

**Test your security.** Delete the Vault leader. See if failover works. Revoke a token. See if access is denied. Rotate a secret. See if applications pick up the new value. If you haven't tested it, you don't know if it works.

The near-miss with the API key in November was a gift. It forced me to build proper secrets management before it became a real problem. Now, six months later, the cluster has:

- Vault HA with Raft replication across three nodes
- Policy-based access control for every application
- Automated unsealing after restarts
- External Secrets syncing credentials to Kubernetes
- Tailscale VPN for private remote access
- Cloudflare Tunnel for public services
- TLS certificates for everything

No API keys in Git. No passwords in environment variables. No plaintext secrets anywhere.

Just encrypted secrets, automated access, and the confidence that comes from knowing you did it right.

---

*Next: [Chapter 5: Scaling Decisions, Not YAML](/chapters/05-scaling-decisions-not-yaml) - How GitOps and reusable workflows turned copy-paste into a platform pattern.*
