## Chapter 6: Networking Architecture

### Network Design

**Management Network (wlan0):** 192.168.2.0/24

- **node-1**: 192.168.2.101 (control plane + etcd, wlan0)
- **node-2**: 192.168.2.102 (control plane + etcd, wlan0)
- **node-3**: 192.168.2.103 (control plane + etcd, wlan0)

**Gigabit Network (eth0):** 10.0.0.0/24 (isolated switch, primary for k8s traffic)

- **node-1**: 10.0.0.1 (eth0)
- **node-2**: 10.0.0.2 (eth0)
- **node-3**: 10.0.0.3 (eth0)

**Virtual IPs (kube-vip):**

- **192.168.2.100**: Kubernetes API server (HA VIP)
- **192.168.2.200**: Traefik Ingress (LoadBalancer VIP)
- **192.168.2.201**: Pi-hole DNS

### DNS Strategy (Or: How DNS Became My Nemesis)

**Approach:** Pi-hole as network-wide DNS server

Because nothing says "I know what I'm doing" like running your own DNS server. And nothing says "I'm in over my head" like DNS issues at 2 AM.

**Benefits (The Things That Actually Worked):**

- Ad-blocking for entire network (because ads are the enemy)
- Local service resolution (\*.eldertree.local) (because typing IPs is for peasants)
- Centralized DNS management (because managing DNS in 47 different places is fun)
- Performance improvement (in theory, anyway)

### Service Discovery

**Local Domains:** `*.eldertree.local` (via ExternalDNS + Pi-hole)

- `grafana.eldertree.local`
- `prometheus.eldertree.local`
- `pushgateway.eldertree.local`
- `vault.eldertree.local`
- `pihole.eldertree.local`
- `swimto.eldertree.local`
- `openclaw.eldertree.local`
- `docs.eldertree.local`

**Public Domains** (via Cloudflare Tunnel):

- `swimto.eldertree.xyz`
- `pitanga.cloud` / `www.pitanga.cloud`
- `northwaysignal.pitanga.cloud`
- `docs.eldertree.xyz` (GitHub Pages)

### Ingress Configuration

**Ingress Controller:** Traefik (built into K3s)
**TLS:** Cert-Manager with self-signed certificates
**Ingress Class:** `traefik`

### kube-vip for LoadBalancer Services

**Purpose:** Provide HA API access and LoadBalancer services on bare metal
**Configuration:** ARP-based IP assignment
**Replaces:** MetalLB (which was used initially but replaced by kube-vip for simplicity)

| VIP            | Service          | Description                |
|----------------|------------------|----------------------------|
| 192.168.2.100  | Kubernetes API   | HA API server endpoint     |
| 192.168.2.200  | Traefik Ingress  | HTTPS ingress for all apps |
| 192.168.2.201  | Pi-hole          | Network-wide DNS           |

#### The Evolution: MetalLB to kube-vip

The cluster initially used MetalLB for LoadBalancer services. However, kube-vip proved to be a better fit because it also handles the Kubernetes API VIP (192.168.2.100), consolidating two responsibilities into one component.

**The MetalLB VIP Debugging Saga (January 2026):**

Before the migration to kube-vip, MetalLB caused issues with VIP announcements on multi-interface nodes. The Raspberry Pis have two interfaces (`wlan0` for management, `eth0` for cluster traffic), and MetalLB was announcing on the wrong interface. This was one of the motivations for switching to kube-vip.

**Lesson:** On multi-interface bare-metal nodes, always be explicit about which interface handles VIP announcements.

### External DNS

**Tool:** ExternalDNS
**Providers:**

- Cloudflare (for public domains)
- RFC2136 (for local DNS via Pi-hole BIND)

### Lessons Learned (The Hard Way)

- DNS is critical for service discovery (who knew? Everyone. Everyone knew.)
- Pi-hole integration simplified local DNS (eventually, after much troubleshooting)
- A dedicated LoadBalancer (kube-vip) is essential for bare-metal services
- ExternalDNS automation saves time (when it works, which is most of the time, but not always)

---
