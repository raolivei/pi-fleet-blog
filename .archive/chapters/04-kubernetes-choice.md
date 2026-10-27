## Chapter 4: Kubernetes Choice - Why K3s

### Why K3s Over Full Kubernetes?

**Decision:** K3s (lightweight Kubernetes distribution)

**Rationale:**

- [ ] **Resource Efficiency:** Designed for edge/IoT, minimal overhead
- [ ] **ARM64 Support:** Excellent support for Raspberry Pi
- [ ] **Simplified Setup:** Single binary, no complex dependencies
- [ ] **Built-in Components:** Traefik ingress, local-path storage included
- [ ] **Production Ready:** CNCF certified, used in production environments
- [ ] **Single Node Friendly:** Works well for small clusters

### K3s Architecture

- **Control Plane:** 3-node HA with embedded etcd (all nodes are control-plane + etcd)
- **Ingress:** Traefik (pre-installed)
- **Storage:** local-path-provisioner (pre-installed), plus custom `local-path-nvme` and `local-path-sd` classes
- **Load Balancer:** kube-vip (ARP-based, replaced built-in Klipper ServiceLB)

### Version

- **K3s Version:** v1.35.0+k3s1 (initial: v1.33.5+k3s1, upgraded over time)
- **Kubernetes API:** Compatible with standard Kubernetes APIs
- **Helm Version:** v3 (bundled with K3s)

### Trade-offs

**Pros:**

- ✅ Low resource usage
- ✅ Easy installation
- ✅ Built-in components reduce complexity
- ✅ Active development and support

**Cons:**

- ⚠️ Some advanced features may differ from full Kubernetes
- ⚠️ Community smaller than full Kubernetes
- ⚠️ Some third-party tools may need adaptation

### Lessons Learned

- [x] K3s was the right choice for this use case
- [x] Built-in Traefik simplified ingress setup
- [x] local-path-provisioner sufficient for the cluster (with custom NVMe/SD classes)
- [x] 3-node HA with embedded etcd provides resilience

---
