# Chapter 2: Why We Dropped Pi-hole for BIND9

Pi-hole was one of the first “real” services I deployed on Eldertree. Network-wide DNS, ad-blocking, a friendly web UI, and a `.local` zone for every ingress hostname — it felt like the obvious homelab choice.

Eight months after the first pi-fleet commit (October 28, 2025), in June 2026, I removed it entirely. The router still points at `192.168.2.201`. Nothing on the LAN had to change. What changed was what actually answered on port 53: a single BIND9 container instead of a three-container Pi-hole stack that was doing work Pi-hole never got credit for.

This chapter is the story of that simplification — and why the old war stories about port 53, klipper-lb, and kube-vip still matter even after Pi-hole is gone.

## What Pi-hole Was Supposed to Do

The pitch was simple:

- **LAN DNS** at `192.168.2.201` so every device resolves `*.eldertree.local`
- **Ad-blocking** for the whole network
- **Automatic records** via external-dns when I added an Ingress

On paper, perfect. In practice, the part I cared about — authoritative DNS for `eldertree.local` and RFC2136 updates from external-dns — lived in a **BIND sidecar**, not in Pi-hole’s FTL/dnsmasq stack.

Pi-hole answered recursive queries and served blocklists. BIND held the zone external-dns wrote to. Two DNS engines in one pod, plus an init container to wire TSIG keys from Vault. It worked, until it didn’t, and debugging always started with “which of the three containers is lying?”

## The Battles We Already Documented

If you’ve read the older technical chapters (archived in this repo), Pi-hole shows up constantly — not because it was elegant, but because it fought everything on port 53.

### Pi-hole vs K3s ServiceLB (klipper-lb)

K3s ships **ServiceLB** (Klipper): for every `type: LoadBalancer` Service, it spawns `svclb-*` DaemonSets that bind host ports on each node. Pi-hole also needs **port 53**. Those two ideas do not share well.

Symptoms we hit:

- Pods `CrashLoopBackOff` or stuck `Pending`
- “Address already in use” on 53
- DNS timeouts from the Mac even when the pod looked “mostly” ready

The fix was a pattern we still use today:

```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/k3s-lb: "false"  # don't let klipper touch this Service
spec:
  type: LoadBalancer
  loadBalancerIP: 192.168.2.201
```

Disable ServiceLB for the DNS Service, pin a VIP, and let **kube-vip** own ARP on the LAN — same approach Traefik uses on `192.168.2.200`. MetalLB came and went; kube-vip stayed. The lesson wasn’t “Pi-hole is special”; it was **privileged ports on bare-metal K3s need an explicit LB strategy**.

### The Great DNS Battle (MetalLB → kube-vip era)

A longer arc — external-dns couldn’t resolve `pi-hole.pihole.svc.cluster.local` while depending on Pi-hole for cluster DNS, manual dnsmasq overrides fighting ExternalDNS, `externalTrafficPolicy` rabbit holes, TSIG mismatches. We documented it in [legacy Chapter 14](/.archive/chapters/14-troubleshooting) and [Chapter 8](/.archive/chapters/08-dns-service-discovery).

The through-line: **most of the hard problems were BIND + external-dns + LoadBalancer plumbing**, not ad-blocking.

## What Finally Broke the Camel’s Back

Three unrelated pressures converged in 2026:

1. **Adblock was never used.** Blocklists, gravity.db drama, FTL logs — operational noise with zero benefit on our network. The value was always `eldertree.local` resolution and GitOps-driven records.

2. **The metrics sidecar couldn’t run on ARM64.** `pihole6-exporter` had no arm64 image. The pod sat **2/3 Ready**, Service endpoints went empty, and **external-dns crashed** trying RFC2136 against a Service with no backends. DNS automation broke because of a Prometheus sidecar we didn’t need.

3. **Helm upgrades stalled on immutable Service fields.** `loadBalancerClass` drift between chart and live object blocked rollouts — another sign the stack had accreted more parts than the problem required.

Meanwhile, BIND in the sidecar had been the reliable piece all along.

## The Cutover: Same VIP, Fewer Moving Parts

We replaced the stack with **standalone BIND9** ([pi-fleet#234](https://github.com/raolivei/pi-fleet/pull/234)):

| Before | After |
|--------|--------|
| Namespace `pihole`, Deployment `pi-hole` | Namespace `bind`, Deployment `bind9` |
| 3 containers (pihole + bind + init) | 1 container (BIND9) |
| RFC2136 → sidecar on port 5353 | RFC2136 → `bind9.bind.svc.cluster.local:53` |
| Pi-hole UI at `pihole.eldertree.local` | No web UI (DNS only) |
| VIP `192.168.2.201` | **Unchanged** |

external-dns still watches Ingresses. Traefik VIP is still `192.168.2.200`. Router DNS is still `.201`. Downtime was acceptable; the cutover script reconciles Flux, deletes the orphaned `pihole` namespace, and runs `verify-service-routing.sh` against BIND.

```bash
dig @192.168.2.201 grafana.eldertree.local +short
# 192.168.2.200
```

That’s the whole user-visible test.

## What We Kept From the Pi-hole Era

Removing Pi-hole doesn’t erase the networking lessons:

- **Disable ServiceLB** when kube-vip (or another LB) should own the VIP
- **Don’t create circular DNS** — external-dns should talk to BIND via cluster DNS (`*.svc.cluster.local`), not via the LAN VIP
- **Multi-container readiness is a liability** for infrastructure DNS — one bad sidecar takes down the whole resolver
- **Run the simplest component that solves the job** — we needed authoritative DNS + recursion, not blocklists

The old “Pi-hole vs ServiceLB” highlight on the blog home page is really a story about **bare-metal Kubernetes and port 53**. BIND9 inherits the same kube-vip annotation and the same VIP; it just stops pretending we need FTL in the path.

## Operational Footprint Today

- **Runbook:** [BIND9-001](https://docs.eldertree.xyz/runbook/issues/dns/BIND9-001) (replaces PIHOLE-001)
- **Cluster scripts:** `cutover-bind9-dns.sh`, `check-bind9-status.sh`, `diagnose-bind9-dns-mac.sh`
- **Control Center:** topology component renamed `bind9` in namespace `bind`

`docker-pi-hole` remains in the org as a fork — useful upstream image maintenance, but no longer part of the Eldertree data path.

## The Trade-Off (Again)

**What we gave up:**

- Network-wide ad-blocking (we weren’t using it)
- Pi-hole’s dashboard and query logs
- A well-known brand name guests recognize on homelab tours

**What we gained:**

- One pod to restart, one log stream to read
- external-dns stable without a fragile exporter sidecar
- Helm releases that aren’t fighting immutable Service fields from a chart built for a different shape
- Honest architecture docs — the diagram says “BIND9”, not “Pi-hole with a BIND sidecar that does the real work”

Ownership still means accepting operational burden. It doesn’t mean keeping every component you once thought you’d need.

## What’s Next

Eldertree DNS is boring again — the best compliment infrastructure can get. The next chapters in this series will go back to the human story (first boot, first outage, first “it works from my phone”). This detour was worth writing down because **simplification is a design decision**, not a confession of failure.

If you’re running Pi-hole on K3s only for `*.local` zones and external-dns, ask whether you’re maintaining two DNS servers to avoid admitting you only needed one.

---

*Previous: [Chapter 1: The Moment I Decided to Own My Infrastructure](/chapters/01-the-moment-i-decided-to-own-my-infrastructure)*

*Related (legacy technical deep dives): [Chapter 8 — DNS](/.archive/chapters/08-dns-service-discovery) · [Chapter 14 — Troubleshooting](/.archive/chapters/14-troubleshooting)*
