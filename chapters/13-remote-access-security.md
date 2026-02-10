## Chapter 13: Remote Access and Security

### Remote Access Stack

The cluster uses a layered approach to remote access:

1. **Tailscale VPN** - Primary remote access (full cluster access)
2. **Cloudflare Tunnel** - Public-facing services (SwimTO, Pitanga)
3. **WireGuard** - Configured but not actively used (superseded by Tailscale)

### Tailscale VPN (Primary)

**Status:** Active on all 3 nodes
**Purpose:** Full remote access to cluster and local network

Tailscale runs as subnet routers on all nodes, advertising the cluster networks:

| Node | Tailscale IP | Advertised Subnets |
|------|-------------|-------------------|
| node-1 | 100.86.241.124 | 192.168.2.0/24, 10.42.0.0/16, 10.43.0.0/16 |
| node-2 | 100.116.185.57 | 192.168.2.0/24, 10.42.0.0/16, 10.43.0.0/16 |
| node-3 | 100.104.30.105 | 192.168.2.0/24, 10.42.0.0/16, 10.43.0.0/16 |

**Advertised subnets provide access to:**
- `192.168.2.0/24` - Home network and management IPs
- `10.42.0.0/16` - Kubernetes pod network
- `10.43.0.0/16` - Kubernetes service network

**Auth key stored in Vault:** `secret/pi-fleet/tailscale`

**Benefits:**
- Zero-config VPN (no port forwarding, no firewall rules)
- Works from anywhere with internet access
- Access all `*.eldertree.local` services remotely
- MagicDNS for Tailscale hostnames
- Subnet routing for full network access

### Cloudflare Tunnel

**Status:** Active
**Purpose:** Expose specific services publicly without opening ports
**Configuration:** Terraform-managed (infrastructure as code)

**Public services exposed:**
- `swimto.eldertree.xyz` - SwimTO application
- `pitanga.cloud` / `www.pitanga.cloud` - Pitanga LLC website
- `northwaysignal.pitanga.cloud` - Northway Signal

**Tunnel token stored in Vault:** `secret/pi-fleet/cloudflare-tunnel/token`

**Benefits:**
- No port forwarding required
- HTTPS by default with Cloudflare's edge certificates
- DDoS protection included
- Access control via Cloudflare policies

### TLS Certificate Strategy

**Internal services:** cert-manager with self-signed CA
- ClusterIssuers: `selfsigned-cluster-issuer`, `ca-cluster-issuer`
- All `*.eldertree.local` services use self-signed certificates

**Public services:** Cloudflare Origin Certificates
- Pitanga and SwimTO use Cloudflare-issued origin certificates
- End-to-end encryption from Cloudflare edge to cluster

### Security Practices

- TLS/HTTPS for all services (internal and external)
- All secrets stored in HashiCorp Vault (never in Git)
- External Secrets Operator syncs secrets to Kubernetes
- UFW firewall on all nodes
- Network isolation: Gigabit network (10.0.0.0/24) for cluster-internal traffic
- Tailscale ACLs for VPN access control
- Regular K3s and system updates

### Lessons Learned

- Tailscale is dramatically simpler than WireGuard for homelab VPN
- Cloudflare Tunnel eliminates the need for port forwarding entirely
- HTTPS is required for OAuth flows (important for app development)
- Secrets management with Vault + External Secrets is seamless once configured
- Network security requires planning upfront (dual network architecture pays off)
- Subnet routing via Tailscale enables full remote cluster management

---

