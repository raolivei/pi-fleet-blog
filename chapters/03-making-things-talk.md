# Chapter 3: Making Things Talk

Kubernetes is great at running containers. DNS is great at finding services. Networking is great at routing traffic.

Until they're not.

And then you spend a Tuesday night staring at connection timeouts, wondering if you fundamentally misunderstand how computers communicate with each other.

## The Dual Network Setup

The Eldertree cluster has two networks. Not because I'm fancy—because I had to work with what I had.

**Network 1: WiFi (192.168.2.0/24)**
- Management access
- SSH connections
- API server access
- Works with my existing home network

**Network 2: Gigabit switch (10.0.0.0/24)**
- Kubernetes pod-to-pod traffic
- High-speed storage communication
- Isolated from the rest of the house

Raspberry Pi 5s have built-in WiFi and Gigabit Ethernet. I could use both. So I did.

The management network (WiFi) connects to my router. DHCP reservations give each node a stable IP: node-1 at .101, node-2 at .102, node-3 at .103. This is where I SSH in. This is where the Kubernetes API listens (via kube-vip at .100).

The gigabit network is a cheap unmanaged switch sitting on my desk. No router. No gateway. No DNS. Just three Raspberry Pis talking to each other at full speed over a private subnet. This is where pods communicate when they need performance.

It's not the most elegant setup. But it works. And more importantly, it taught me about network interfaces, routing tables, and why sometimes the simplest solution is the right one.

## The DNS Journey

I wanted local service discovery. Type `vault.eldertree.local` in my browser and reach Vault. Type `grafana.eldertree.local` and see metrics. No IP addresses to remember. No bookmarks to maintain. Just DNS.

The obvious solution: **Pi-hole.**

Pi-hole gives you network-wide ad blocking and custom DNS. Deploy it in Kubernetes. Point my router's DNS at it. Every device in my house gets ad-free browsing and automatic resolution of `.eldertree.local` domains.

Perfect plan. Flawless execution. Until DNS stopped resolving one morning.

### When DNS Dies, Everything Dies

I woke up to a network where nothing worked. Not "slow"—**nothing worked**. Services unreachable. Ingress timing out. Even `kubectl` commands were sluggish because the API server DNS wasn't resolving properly.

The Pi-hole pod was running. Or so I thought.

```bash
kubectl get pods -n pi-hole
```

Output: `1/2 Ready`

One out of two containers ready. That's the problem with multi-container pods—Kubernetes won't route traffic until **all** containers pass readiness probes. The Pi-hole container was fine. The BIND sidecar container wasn't.

BIND handles the custom `.eldertree.local` zone. Without it, Pi-hole can resolve public domains (google.com works fine), but anything local just returns `SERVFAIL`.

I checked the service endpoints:

```bash
kubectl get endpoints -n pi-hole pi-hole
```

No endpoints. Zero. The service existed, the LoadBalancer IP existed (192.168.2.201), but Kubernetes wasn't routing traffic to the pod because the pod wasn't "ready."

No endpoints = no traffic. Even if the pod is running. Even if DNS is listening on port 53. If Kubernetes doesn't consider the pod ready, the service is dead.

I tested DNS directly from inside the pod:

```bash
kubectl exec -n pi-hole <pod-name> -c pihole -- nslookup vault.eldertree.local 127.0.0.1
```

`SERVFAIL`. DNS was running, but the BIND zone wasn't loaded.

The fix? **Wait.** The init container needed time to finish configuring BIND. The BIND container needed time to load the zone file. The readiness probe needed time to pass. Eventually, the pod went `2/2 Ready`, endpoints appeared, and DNS worked again.

But my Mac's DNS cache still had stale entries. So I flushed it:

```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

And then everything worked.

### What I Learned About DNS

**DNS is deceptively simple until it isn't.** It's "just" name resolution. Until you have multi-container pods with init containers and readiness probes and service endpoints and client-side caching all interacting in ways that aren't obvious.

**Service endpoints are the source of truth.** If `kubectl get endpoints` shows nothing, traffic isn't routing. Full stop. Doesn't matter if the pod exists. Doesn't matter if DNS is listening. No endpoints = no service.

**Readiness probes gate traffic.** Kubernetes won't add a pod to service endpoints until all containers pass readiness probes. A single failing container blocks the entire pod.

**Client-side caching hides problems.** When DNS starts working again, your machine might not notice. Flush the cache. Always flush the cache.

And most importantly: **patience.** Sometimes the solution isn't a clever fix. Sometimes it's just waiting for init containers to finish and readiness probes to pass.

## kube-vip and LoadBalancer Services

Kubernetes on cloud providers gives you LoadBalancer services for free. You create a service of type LoadBalancer, and the cloud assigns a public IP. Magic.

On bare metal, you don't get magic. You get nothing. Unless you bring your own LoadBalancer.

Enter **kube-vip.**

kube-vip provides virtual IPs (VIPs) for services using ARP. When you create a LoadBalancer service, kube-vip assigns it an IP from a pool and announces that IP on the network. Any device on the network can reach that IP, and kube-vip routes traffic to the appropriate pods.

I use three VIPs:

- **192.168.2.100** - Kubernetes API server (HA control plane)
- **192.168.2.200** - Traefik ingress (HTTP/HTTPS for all apps)
- **192.168.2.201** - Pi-hole DNS

Every application in the cluster routes through Traefik at .200. Every DNS query goes to Pi-hole at .201. The API server lives at .100. Clean. Simple. Works.

The cluster originally used MetalLB, but kube-vip does double duty—it handles both the API VIP and LoadBalancer services. Less complexity. Fewer moving parts.

## ExternalDNS: Automation That Actually Saves Time

Manually creating DNS records is tedious. Add a new service. Update Pi-hole configuration. Reload BIND. Check that it's working. Repeat for every service.

ExternalDNS automates this.

Point ExternalDNS at your DNS provider (Cloudflare for public domains, RFC2136 for Pi-hole). Create an Ingress resource in Kubernetes. ExternalDNS sees the Ingress, extracts the hostname, and automatically creates a DNS record.

Deploy Grafana with an Ingress for `grafana.eldertree.local`. ExternalDNS creates the DNS record. Done. No manual steps.

It's one of those tools that feels like magic when it works. And when it doesn't work, you remember why automation is hard—because it's just code, and code has bugs, and now you're debugging why a DNS record didn't get created instead of just creating it manually.

But when it works (which is most of the time), it's glorious.

## The Aha Moment

Networking in Kubernetes clicked for me when I stopped thinking about individual services and started thinking about **layers**.

**Layer 1: Cluster networking** - Pods talk to each other via CNI (Flannel in K3s)  
**Layer 2: Service discovery** - Services get stable DNS names (CoreDNS)  
**Layer 3: Ingress** - External traffic routes to services (Traefik)  
**Layer 4: LoadBalancer** - Services get external IPs (kube-vip)  
**Layer 5: DNS** - Names resolve to IPs (Pi-hole + ExternalDNS)  

Each layer does one thing. Each layer depends on the layer below it. When something breaks, you work through the layers until you find the problem.

DNS not resolving? Check Pi-hole (layer 5). Service unreachable? Check Traefik (layer 3). Pod can't reach another pod? Check CNI (layer 1).

It's not glamorous. But it works. And after enough late-night debugging sessions, it becomes second nature.

## What I Learned About Making Things Talk

**Start with simple connectivity tests.** Can you ping the node? Can you curl the service IP? Can you resolve the DNS name? Build up from there.

**Multi-interface nodes are tricky.** WiFi for management, Ethernet for data—sounds clever until you hit routing issues. Be explicit about which interface handles what.

**Readiness probes are your friend (and your enemy).** They prevent broken pods from receiving traffic. They also prevent working pods from receiving traffic if you configure them wrong.

**DNS is foundational.** When DNS breaks, everything breaks. Invest time in understanding it. Build redundancy. Monitor it closely.

**Automation pays off.** ExternalDNS saves hours of manual work. But you need to understand what it's doing, because when it breaks, you're the one fixing it.

And most importantly: **networking is a journey, not a destination.** You don't "finish" networking. You build it, it breaks, you fix it, you learn something, you improve it, and then it breaks again in a new way. That's just how it is.

But the moment when you type a `.eldertree.local` domain in your browser and it **just works**? That moment makes all the troubleshooting worth it.

---

*Next: [Chapter 4: Keeping Secrets](/chapters/04-keeping-secrets) - The time I almost committed an API key to GitHub.*
