## Chapter 6: Networking Architecture

### Network Design

**Management Network (wlan0):** 192.168.2.0/24

- **node-1**: 192.168.2.101 (control plane, wlan0)
- **node-2**: 192.168.2.102 (worker, wlan0)
- **node-3**: 192.168.2.103 (worker, wlan0)

**Gigabit Network (eth0):** 10.0.0.0/24

- **node-1**: 10.0.0.1 (control plane, eth0)
- **node-2**: 10.0.0.2 (worker, eth0)
- **node-3**: 10.0.0.3 (worker, eth0)
- **node-1**: 10.0.0.2 (worker)
- **node-2**: 10.0.0.3 (worker)

**DNS Server:** 192.168.2.201 (Pi-hole via MetalLB)

### DNS Strategy (Or: How DNS Became My Nemesis)

**Approach:** Pi-hole as network-wide DNS server

Because nothing says "I know what I'm doing" like running your own DNS server. And nothing says "I'm in over my head" like DNS issues at 2 AM.

**Benefits (The Things That Actually Worked):**

- Ad-blocking for entire network (because ads are the enemy)
- Local service resolution (\*.eldertree.local) (because typing IPs is for peasants)
- Centralized DNS management (because managing DNS in 47 different places is fun)
- Performance improvement (in theory, anyway)

### Service Discovery

**Local Domains:** `*.eldertree.local`

- `grafana.eldertree.local`
- `prometheus.eldertree.local`
- `vault.eldertree.local`
- `pihole.eldertree.local`
- `canopy.eldertree.local`
- `swimto.eldertree.local`

### Ingress Configuration

**Ingress Controller:** Traefik (built into K3s)
**TLS:** Cert-Manager with self-signed certificates
**Ingress Class:** `traefik`

### MetalLB for LoadBalancer Services

**Purpose:** Provide LoadBalancer services on bare metal
**Configuration:** Layer 2 mode
**IP Range:** [Document your IP range]

### External DNS

**Tool:** ExternalDNS
**Providers:**

- Cloudflare (for public domains)
- RFC2136 (for local DNS via Pi-hole BIND)

### Lessons Learned (The Hard Way)

- DNS is critical for service discovery (who knew? Everyone. Everyone knew.)
- Pi-hole integration simplified local DNS (eventually, after much troubleshooting)
- MetalLB essential for LoadBalancer services (because bare metal doesn't have cloud magic)
- ExternalDNS automation saves time (when it works, which is most of the time, but not always)

---
