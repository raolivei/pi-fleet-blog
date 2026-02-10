# Chapter 5: Initial Cluster Setup

The initial cluster setup happened in November 2025, starting with infrastructure as code and ending with a working Kubernetes cluster hosting multiple services. This chapter documents that journey, based on the actual Git commit history.

## The Timeline: November 2025

**November 6, 2025 - The Beginning**

The journey started with infrastructure as code. The first commit set up Terraform for the eldertree control plane:

```bash
feat: Add k3s cluster setup with Terraform for eldertree control plane
```

This established the pattern that would define the entire project: **everything in Git, everything automated**.

**November 7, 2025 - Foundation Day**

This was a busy day with multiple foundational pieces:

1. **Git Workflow Established**

   - Added git branching strategy and contributing guidelines
   - Set up the workflow that would support 45 pull requests

2. **K9s Installation**

   - Added k9s (Kubernetes CLI) to the control plane
   - Essential tool for cluster management and troubleshooting

3. **Network Documentation**

   - Created NETWORK.md with IP configuration and service domains
   - Documented the `.eldertree.local` domain strategy
   - Set up FluxCD GitOps foundation

4. **Cluster Naming**
   - Standardized cluster name to 'eldertree' across all kubeconfig contexts
   - Important for consistency across tools and scripts

## Installation Process

**Method:** Automated via Ansible playbook

The actual K3s installation was handled by Ansible, ensuring:

- Idempotent configuration (can run multiple times safely)
- Version-controlled setup
- Reproducible deployments
- Clear separation of concerns

**Steps:**

1. **System Preparation**

   - Base system configuration via Ansible
   - User setup, hostname, network configuration
   - Required packages installation

2. **K3s Binary Installation**

   - Automated via `ansible/playbooks/install-k3s.yml`
   - Single binary installation (no complex dependencies)
   - ARM64 compatible out of the box

3. **Cluster Initialization**

   - Embedded etcd (no external etcd needed)
   - Traefik ingress controller (pre-installed)
   - local-path storage provisioner (pre-installed)
   - CoreDNS for service discovery (pre-installed)

4. **Kubeconfig Setup**

   - Ansible playbook configured kubeconfig
   - Cluster and context renamed to "eldertree"
   - Stored at `~/.kube/config-eldertree`

5. **Verification**
   ```bash
   export KUBECONFIG=~/.kube/config-eldertree
   kubectl get nodes
   kubectl get pods -A
   kubectl cluster-info
   ```

## Cluster Configuration

### Initial Configuration (November 2025)

```yaml
Cluster Name: eldertree
Control Plane: node-1 (192.168.2.101)
Kubernetes Version: v1.33.5+k3s1 (initial)
Storage Class: local-path (built-in)
Ingress Class: traefik (built-in)
Service Load Balancer: Klipper (built-in, later replaced by kube-vip)
```

**Key Decisions:**

- Single-node cluster initially (sufficient for learning and small workloads)
- Embedded etcd (simpler than external etcd for single node)
- Built-in components (Traefik, local-path) reduce complexity
- Standard Kubernetes APIs (compatible with all K8s tools)

### Current Configuration (February 2026) - TRUE HIGH AVAILABILITY

```yaml
Cluster Name: eldertree
Control Plane: 3-node HA (node-1, node-2, node-3) - all control-plane + etcd
Kubernetes Version: v1.35.0+k3s1
API VIP: 192.168.2.100 (kube-vip)
Traefik VIP: 192.168.2.200
Storage Classes: 
  - local-path (default)
  - local-path-nvme (NVMe SSD)
  - local-path-sd (SD card)
Ingress Class: traefik (built-in)
Load Balancer: kube-vip (ARP-based)
```

**HA Components:**

| Component | HA Method | Failure Tolerance |
|-----------|-----------|-------------------|
| Control Plane | 3-node etcd | 1 node |
| API Access | kube-vip VIP | 1 node |
| Storage | local-path-nvme (node-local NVMe) | N/A (node-pinned) |
| Secrets | Vault Raft 3 replicas | 1 node |

**Any single node can fail and the cluster control plane keeps running. Vault data is replicated across all three nodes via Raft consensus.**

## First Pods

After installation, the cluster automatically started these system pods:

**kube-system namespace:**

- `traefik` - Ingress controller (pre-installed with K3s)
- `local-path-provisioner` - Storage provisioner
- `coredns` - DNS server for service discovery
- `svclb-traefik` - Service load balancer for Traefik
- `metrics-server` - Resource metrics API

**Key Insight:** K3s includes many components that would require separate installation in full Kubernetes. This simplicity was a major advantage.

## Early Additions (November 7, 2025)

**Cert-Manager and Monitoring Stack**

The same day as cluster setup, cert-manager and monitoring were added:

```bash
feat: add cert-manager and monitoring stack
- Deploy cert-manager with self-signed ClusterIssuer
```

This established the pattern of **adding infrastructure incrementally** rather than all at once.

**Initial Challenges:**

- Had to add `open-iscsi` for Longhorn (later removed)
- Fixed cert-manager dependencies
- Configured storage classes for Prometheus and Grafana

## Verification and Testing

**Basic Cluster Health:**

```bash
# Check nodes
kubectl get nodes
# NAME        STATUS   ROLES                  AGE   VERSION
# eldertree   Ready    control-plane,master   1d    v1.33.5+k3s1

# Check system pods
kubectl get pods -A
# All system pods should be Running

# Check cluster info
kubectl cluster-info
```

**First Application Test:**

- Deployed a simple nginx pod to verify everything worked
- Created a service and ingress to test Traefik
- Verified DNS resolution with CoreDNS

## Challenges Encountered

**1. Resource Limits on Raspberry Pi**

- **Problem:** Some default resource limits were too high for 8GB RAM
- **Solution:** Adjusted limits for K3s components and applications
- **Lesson:** Always set appropriate resource limits from the start

**2. Storage Configuration**

- **Problem:** PVCs not binding, data not persisting
- **Solution:** Explicitly specified `storageClassName: local-path`
- **Lesson:** Don't rely on default storage classes

**3. Network Setup**

- **Problem:** Services not accessible, DNS not resolving
- **Solution:** Configured static IP, set up Pi-hole for DNS
- **Lesson:** Network configuration is critical for service discovery

**4. Initial Troubleshooting**

- **Problem:** Learning curve for Kubernetes debugging
- **Solution:** Used k9s, kubectl, and documentation
- **Lesson:** Good tools (k9s) make troubleshooting much easier

## The First Week

By the end of the first week (November 13, 2025), the cluster had:

- ✅ Working K3s cluster
- ✅ Cert-manager with self-signed certificates
- ✅ Monitoring stack (Prometheus + Grafana)
- ✅ Network documentation
- ✅ GitOps foundation (FluxCD)
- ✅ Basic troubleshooting experience

**Key Milestones:**

- November 6: Infrastructure as code setup
- November 7: Cluster installation and initial services
- November 13: First major troubleshooting session (multiple fixes)

## Lessons Learned

**What Worked Well:**

- ✅ **Ansible automation** - Made setup reproducible and documented
- ✅ **K3s simplicity** - Built-in components saved time
- ✅ **Incremental approach** - Adding services one at a time was manageable
- ✅ **GitOps from the start** - All configuration in Git from day one

**What Would I Do Differently:**

- 🔄 **Set resource limits earlier** - Would have avoided some debugging
- 🔄 **Document as you go** - Some early decisions weren't documented
- 🔄 **Test storage earlier** - Storage issues appeared later
- 🔄 **Set up monitoring immediately** - Would have caught issues faster

**Key Takeaways:**

- 📝 **Automation is essential** - Ansible playbooks made everything reproducible
- 📝 **Start simple** - Single node, basic setup, then grow
- 📝 **Document decisions** - Git commits document the journey
- 📝 **Incremental is better** - Add one service at a time, learn, then add more
- 📝 **Built-in components help** - K3s includes what you need, reducing complexity

## The Foundation Was Set

By the end of November 2025, eldertree was a working Kubernetes cluster. It wasn't perfect—there were 92 problems to solve over the coming months—but it was functional, documented, and ready to grow. The foundation of infrastructure as code, GitOps, and automation would support all future development.

The journey from "let's set up Kubernetes" to "production-ready cluster" had begun.



