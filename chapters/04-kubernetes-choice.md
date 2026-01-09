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

- **Control Plane:** Embedded etcd (no external etcd needed)
- **Ingress:** Traefik (pre-installed)
- **Storage:** local-path-provisioner (pre-installed)
- **Service Load Balancer:** Klipper (pre-installed)

### Version

- **K3s Version:** v1.33.5+k3s1
- **Kubernetes API:** Compatible with standard Kubernetes APIs
- **Helm Version:** v4.0.0

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

- [ ] K3s was the right choice for this use case
- [ ] Built-in Traefik simplified ingress setup
- [ ] local-path-provisioner sufficient for single-node

---
