# Chapter 8: DNS and Service Discovery

### Pi-hole Integration

**Purpose:** Network-wide DNS with ad-blocking
**Deployment:** Kubernetes pod with LoadBalancer service
**IP:** 192.168.2.201 (via MetalLB)

### Local DNS Resolution

**Domain Pattern:** `*.eldertree.local`
**Resolver:** Pi-hole with custom DNS records
**Configuration:** Custom DNS entries for all services

### External DNS Automation

**Tool:** ExternalDNS
**Providers:**

- **Cloudflare:** For public domain management
- **RFC2136:** For local DNS updates via Pi-hole BIND

**Benefits:**

- Automatic DNS record creation
- Ingress-based service discovery
- Reduced manual DNS management

### BIND Integration

**Purpose:** RFC2136 support for ExternalDNS
**Configuration:** BIND sidecar in Pi-hole pod
**TSIG Secret:** Managed via Vault and External Secrets

### Router DNS Configuration

**Setup:** Router DNS set to Pi-hole IP (192.168.2.201)
**Fallback:** 8.8.8.8 (Google DNS) or 1.1.1.1 (Cloudflare DNS)

### Troubleshooting DNS

**Common Issues:**

- DNS not resolving after deployment
- Pi-hole pod not ready
- BIND service unavailable
- TSIG secret missing

**Solutions:**

- Check Pi-hole pod status
- Verify BIND sidecar logs
- Ensure TSIG secret exists in Vault
- Check ExternalDNS logs

### A Real-World DNS Troubleshooting Story

One morning, I woke up to find that none of my services were reachable. Simple commands like `ping vault.eldertree.local` returned "Unknown host" errors. This was particularly frustrating because everything had been working fine the day before. When DNS breaks in a self-hosted cluster, nothing works—services become unreachable, monitoring fails, and the entire infrastructure feels broken.

This is the story of that morning and what I learned about debugging DNS in Kubernetes.

#### The Architecture (Context)

Before diving into the troubleshooting, it's important to understand the setup:

- **Kubernetes**: k3s v1.33.6 running on Raspberry Pi 5
- **DNS Server**: Pi-hole running in Kubernetes with BIND for custom zone resolution
- **Load Balancing**: MetalLB providing a virtual IP (192.168.2.201) for the Pi-hole service
- **Custom Domains**: `.eldertree.local` domains resolving to cluster services
- **Network**: Local network (192.168.2.0/24) with router DNS pointing to Pi-hole

The Pi-hole deployment is a multi-container pod:

- **pihole container**: Main DNS server (port 53)
- **bind container**: BIND DNS server (port 5353) for custom zone resolution
- **bind-init container**: Init container that sets up BIND configuration

This multi-container setup is crucial to understanding what went wrong.

#### The Investigation

**Step 1: Check Pod Status**

First, I checked if Pi-hole was running:

```bash
kubectl get pods -n pihole
```

**Finding**: One pod was `1/2 Ready` (pihole container ready, bind container not ready), and another pod was `Pending`. This was the first clue—the pod wasn't fully ready.

**Step 2: Test DNS Resolution**

I tried to query DNS directly:

```bash
nslookup vault.eldertree.local 192.168.2.201
```

**Result**: Connection timeout. The LoadBalancer IP wasn't responding.

**Step 3: Check Service Endpoints**

I checked if the service had endpoints:

```bash
kubectl get endpoints -n pihole pi-hole
```

**Finding**: The service had no endpoints! This meant Kubernetes wasn't routing traffic to the pod, even though a pod existed.

**Step 4: Inspect Pod Containers**

I checked which containers were ready:

```bash
kubectl get pod -n pihole pi-hole-58d9d66bd5-sxdw8 -o jsonpath='{.status.containerStatuses[*].name}'
kubectl get pod -n pihole pi-hole-58d9d66bd5-sxdw8 -o jsonpath='{.status.containerStatuses[*].ready}'
```

**Result**: `bind pihole` and `true false`—the bind container wasn't ready.

**Step 5: Test DNS from Inside the Pod**

I tested DNS resolution from inside the pod:

```bash
kubectl exec -n pihole pi-hole-58d9d66bd5-sxdw8 -c pihole -- nslookup vault.eldertree.local 127.0.0.1
```

**Result**: `SERVFAIL`—DNS was running but couldn't resolve the custom zone. The BIND container wasn't ready, so the zone configuration wasn't active.

**Step 6: Check Init Container**

I checked the init container logs:

```bash
kubectl logs -n pihole pi-hole-58d9d66bd5-sxdw8 -c bind-init
```

**Result**: Empty—the init container had completed, but something was preventing the bind container from starting properly.

**Step 7: Verify Ports Are Listening**

I checked if DNS was actually listening:

```bash
kubectl exec -n pihole pi-hole-58d9d66bd5-sxdw8 -c pihole -- netstat -tuln | grep 53
```

**Result**: Port 53 was listening! DNS was running, but the readiness probe was failing.

**Step 8: Check Readiness Probe**

I inspected the readiness probe configuration:

```bash
kubectl describe pod -n pihole pi-hole-58d9d66bd5-sxdw8 | grep -A 5 "Readiness:"
```

**Finding**: The readiness probe was a TCP socket check on port 53 with:

- `initialDelaySeconds: 60`
- `periodSeconds: 10`
- `timeoutSeconds: 5`
- `failureThreshold: 3`

The probe was likely failing because while port 53 was listening, the DNS service wasn't fully initialized (BIND zone not configured).

#### The Root Causes

After investigation, I identified three interconnected issues:

**1. Pod Not Fully Ready**

The Pi-hole pod had two containers, but only one was ready:

- ✅ `pihole` container: Ready (port 53 listening)
- ❌ `bind` container: Not ready (BIND zone not configured)

Kubernetes only considers a pod "ready" when **all** containers pass their readiness probes. Since the bind container wasn't ready, the entire pod was marked as not ready.

**2. Service Had No Endpoints**

Because the pod wasn't ready, Kubernetes didn't add it to the service endpoints. This meant:

- The LoadBalancer IP (192.168.2.201) had no backend
- DNS queries to the LoadBalancer IP timed out
- The service was effectively unreachable

**3. DNS Cache Issues**

Even after the pod became ready, my Mac's DNS cache had stale entries. I needed to flush the cache:

```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

#### The Solution

The fix was surprisingly simple—I just needed to wait for the pod to become fully ready:

1. **Wait for bind-init to complete**: The init container sets up BIND configuration
2. **Wait for bind container to start**: BIND needs to load the zone configuration
3. **Wait for readiness probe to pass**: Kubernetes needs to verify the pod is healthy
4. **Flush DNS cache**: Clear stale entries on client machines

After a few minutes, the pod became `2/2 Ready`, endpoints were created, and DNS started working again.

#### Testing the Fix

I verified everything was working:

```bash
# Test DNS resolution
nslookup vault.eldertree.local
# Result: 192.168.2.101 ✅

# Test ping
ping -c 2 vault.eldertree.local
# Result: Successful ✅

# Test all services
for service in vault.eldertree.local swimto.eldertree.local canopy.eldertree.local; do
  nslookup $service
done
# Result: All resolving correctly ✅
```

#### Key Takeaways from This Incident

**1. Multi-Container Pods Are Complex**

When a pod has multiple containers, **all** containers must be ready for the pod to be considered ready. This is by design—Kubernetes won't route traffic to a pod until all containers are healthy.

**Lesson**: Check all container statuses, not just the pod status.

**2. Readiness Probes Matter**

Readiness probes determine when a pod is ready to receive traffic. If a probe fails:

- The pod won't be added to service endpoints
- LoadBalancer IPs won't route to the pod
- Services appear "broken" even though containers are running

**Lesson**: Understand your readiness probe configuration and what it's actually checking.

**3. DNS Cache Can Hide Issues**

Client-side DNS caching can make problems appear fixed (or broken) when they're not. Always flush DNS cache when troubleshooting.

**Lesson**: When DNS seems broken, check both server-side (pod status) and client-side (DNS cache).

**4. Init Containers Are Sequential**

Init containers run sequentially and must complete before main containers start. If an init container is slow or fails, the entire pod is delayed.

**Lesson**: Monitor init container logs and ensure they complete successfully.

**5. Service Endpoints Are the Source of Truth**

If a service has no endpoints, traffic won't route—regardless of pod status. Always check endpoints:

```bash
kubectl get endpoints -n <namespace> <service-name>
```

**Lesson**: No endpoints = no traffic, even if pods exist.

#### Troubleshooting Checklist

For future DNS issues, I now use this checklist:

- [ ] Check pod status: `kubectl get pods -n pihole`
- [ ] Verify all containers are ready: `kubectl get pod <pod-name> -o jsonpath='{.status.containerStatuses[*].ready}'`
- [ ] Check service endpoints: `kubectl get endpoints -n pihole pi-hole`
- [ ] Test DNS from inside pod: `kubectl exec -n pihole <pod-name> -c pihole -- nslookup <domain> 127.0.0.1`
- [ ] Verify ports are listening: `kubectl exec -n pihole <pod-name> -c pihole -- netstat -tuln | grep 53`
- [ ] Check LoadBalancer IP: `kubectl get svc -n pihole pi-hole`
- [ ] Test DNS from client: `nslookup <domain> <dns-ip>`
- [ ] Flush DNS cache on client: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` (macOS)
- [ ] Check init container logs: `kubectl logs -n pihole <pod-name> -c bind-init`
- [ ] Inspect readiness probe: `kubectl describe pod -n pihole <pod-name> | grep -A 5 "Readiness:"`

#### Reflection

Debugging DNS in Kubernetes requires understanding multiple layers:

- Pod lifecycle (init containers, readiness probes)
- Service discovery (endpoints, LoadBalancer)
- DNS server configuration (BIND zones, Pi-hole)
- Client-side caching

The issue wasn't a single point of failure—it was a cascade of interconnected problems. By systematically checking each layer, I was able to identify and resolve the root causes.

For self-hosted Kubernetes clusters, DNS is critical infrastructure. When it breaks, everything breaks. Understanding how to debug it is essential, and this incident taught me that sometimes the solution is simply patience—waiting for all containers to become ready.

### Lessons Learned

- ✅ **Centralized DNS simplifies service discovery** - Pi-hole as network-wide DNS works well
- ✅ **ExternalDNS automation is invaluable** - Automatic DNS record creation saves time
- ✅ **BIND integration required for RFC2136** - Needed for ExternalDNS to work properly
- ✅ **Router-level DNS configuration affects all devices** - One change impacts everything
- ✅ **Multi-container pods require all containers to be ready** - This is critical for service endpoints
- ✅ **Readiness probes determine service availability** - Understanding probes is essential
- ✅ **DNS cache can mask problems** - Always flush cache when troubleshooting
- ✅ **Service endpoints are the source of truth** - No endpoints = no traffic
- ✅ **Systematic troubleshooting works** - Check each layer methodically


