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
**IP Range:** 192.168.2.200-210

| VIP            | Service          | Description                |
|----------------|------------------|----------------------------|
| 192.168.2.200  | Traefik Ingress  | HTTPS ingress for all apps |
| 192.168.2.201  | Pi-hole          | Network-wide DNS           |
| 192.168.2.202  | WireGuard (planned) | VPN access              |

#### The VIP Debugging Saga (January 2026)

Everything was working... until it wasn't. The VIP (192.168.2.200) suddenly stopped responding. Services worked via NodePort, but the LoadBalancer IP was just... gone.

**The Symptoms:**
```bash
# This worked (NodePort bypass)
curl -k https://192.168.2.101:32474
# OK!

# This didn't (VIP)
curl -k https://192.168.2.200
# Connection refused

ping 192.168.2.200
# Request timeout for icmp_seq 0
```

**The Hunt:**

After much debugging (checking MetalLB speakers, ARP tables, iptables rules), the culprit was found: MetalLB was announcing on the wrong interface!

The Raspberry Pis have two interfaces:
- `wlan0`: 192.168.2.0/24 (management network, where clients are)
- `eth0`: 10.0.0.0/24 (internal cluster network)

MetalLB was trying to announce the VIP on all interfaces or defaulting to the wrong one.

**The Fix:**

```yaml
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
spec:
  ipAddressPools:
    - default
  interfaces:
    - wlan0  # THE MAGIC LINE
```

**Lesson:** Always specify the exact interface for MetalLB L2 mode on multi-interface nodes. Don't trust auto-detection.

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
