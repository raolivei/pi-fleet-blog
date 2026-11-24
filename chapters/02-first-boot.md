# Chapter 2: First Boot

The moment between "I've decided to build this" and "it's actually working" is filled with a particular kind of nervous energy. You've read the docs, planned the steps, maybe even rehearsed the commands in your head. But until you see those green "Ready" statuses, you don't really know if it's going to work.

For Eldertree, that moment came in early November 2025.

## The SD Card to NVMe Journey

I started the way most people start with Raspberry Pis: an SD card. Flash the image with Raspberry Pi Imager, boot it up, connect via SSH, run some updates. Standard procedure.

Debian 12 Bookworm was the obvious choice—stable, excellent ARM64 support, long-term support, all the packages I'd need. No exotic distros. No beta releases. Just rock-solid Debian.

The initial setup worked fine. SSH connected. Packages installed. System updated. But I knew from the start that SD cards weren't going to cut it for a Kubernetes cluster. SD cards are fine for casual Pi projects. They're terrible for databases, persistent volumes, and constant write operations. They wear out. They corrupt. They fail at the worst possible time.

So the real goal was: **boot from NVMe via PCIe.**

NVMe was a better fit for the sustained writes I was asking of the storage, especially from Vault, PostgreSQL, and other persistent workloads. The exact speedup depends on the drive, card, and workload; the reason to make the move was reliability as much as speed.

The process sounded straightforward: clone the SD card to NVMe, update the boot configuration, reboot. Easy, right?

## The Emergency Mode Trap

Here's what the tutorials don't tell you: **if you get the fstab wrong, your Pi boots into emergency mode and requires a root password.**

And if root is locked (which it often is by default), and you don't have a wired keyboard handy (because who does?), you're stuck. Completely stuck. No SSH. No console access. Just a blinking cursor asking for a password you can't provide.

I learned this the hard way.

A bad filesystem entry can leave a node in emergency mode, needing recovery from a local console before the normal boot can continue. That was exactly the kind of setup problem I wanted the automation to handle, including checking the boot configuration after copying the filesystem.

It worked. But I knew this wasn't scalable. I couldn't do this for every node. And I definitely couldn't do this remotely.

The automation grew out of those setup and migration problems. The Ansible playbook `setup-nvme-boot.yml` captures the process:

- Copies the root filesystem from SD to NVMe with rsync; the boot partition has its own copy step
- Updates fstab and the boot configuration for the NVMe partitions
- Sets the ESP flag on the boot partition (`parted /dev/nvme0n1 set 1 esp on`)
- Updates cmdline.txt to point to the NVMe root partition
- Unlocks root and sets a password (emergency access)
- Disables PAM faillock (prevents account lockouts)
- Disables password expiration (prevents surprise lockouts)

The point was to make the next migration repeatable, with the boot and account checks written down instead of left in my head. I still had to verify the result after rebooting. A successful Ansible run and a Pi actually booting from the intended disk are two separate checks.

## The First `kubectl get nodes`

Storage setup and node automation kept evolving. The first milestone was simpler: get K3s running on one Pi.

I'd already decided on K3s over full Kubernetes—lightweight, ARM64-optimized, single binary, built-in components. Perfect for Raspberry Pis. But deciding is different from installing.

The Ansible playbook `install-k3s.yml` handled the installation. Single node first. No fancy HA setup yet—just get it working. The three-member etcd control plane came later.

I ran the playbook. Watched the output scroll by. Packages installing. Services starting. Kubeconfig being written.

Then came the moment of truth:

```bash
export KUBECONFIG=~/.kube/config-eldertree
kubectl get nodes
```

What mattered in the output was one node reporting `Ready`. The node names and K3s version changed as the setup grew; that first result was not a record of the later three-node cluster.

**Ready.**

That single word meant the node was reporting healthy enough for normal scheduling. It was a useful first check, not proof that DNS, storage, ingress, or an application worked end to end.

I'd built a Kubernetes cluster on a Raspberry Pi.

## The First Pods

K3s doesn't just give you an empty cluster. It pre-installs the essentials:

- **Traefik** - Ingress controller (HTTP routing to services)
- **CoreDNS** - DNS for service discovery
- **local-path-provisioner** - Storage for persistent volumes
- **Metrics server** - Resource usage API

Running `kubectl get pods -A` showed all of them: Running, green, healthy. The cluster was alive.

This is one of K3s's best features: you get a working cluster immediately. No separate Helm chart for Traefik. No manual CoreDNS setup. No storage class configuration. It's all there, working, out of the box.

I deployed a test nginx pod. It started. I created a service. It got a ClusterIP. I created an ingress. Traefik picked it up. I curled the endpoint. It responded.

**The cluster wasn't just running—it was working.**

## Growing the Foundation

The first working node did not arrive with the finished three-node setup attached. Node provisioning, NVMe migration, and HA work accumulated over the following weeks and months. The foundation grew to include:

- Repeatable node setup and NVMe boot automation
- K3s growing from one control plane to a three-node cluster
- Cert-manager for TLS certificates
- Prometheus and Grafana for monitoring
- FluxCD for GitOps (all configuration in Git)
- Pi-hole for network-wide DNS and ad blocking

Each addition taught something new. Cert-manager taught me about Kubernetes certificates. Prometheus taught me about service discovery and scrape configs. FluxCD taught me about GitOps reconciliation loops. Pi-hole taught me about DNS integration with Kubernetes.

The cluster wasn't perfect. There were resource limit issues (8GB RAM goes fast). Storage binding issues (PVCs not claiming volumes). Network resolution issues (services not finding each other). But those were fixable problems. The foundation was solid.

## What I Learned About Starting

Here's what getting that foundation working taught me:

**Automation pays off when you repeat the work.** The node setup and NVMe playbooks let me carry the fixes forward. They did not remove the need to check a new node, but they stopped every rebuild from beginning with the same search through old commands.

**Start simple, then grow.** Single node first. Get it working. Understand it. Then add HA. Then add complexity. Trying to build everything at once is a recipe for confusion.

**The first boot is the hardest.** Once you've done it once, subsequent boots are easy. You know what to expect. You've debugged the weird issues. The playbooks capture that knowledge.

**Resource limits matter on Pis.** 8GB sounds like a lot until you run a monitoring stack, a secrets manager, and a few applications. Set limits early. Be explicit.

**Built-in components are a gift.** K3s giving me Traefik and CoreDNS out of the box saved hours of configuration. Don't fight the defaults—use them.

## The Feeling

There's a specific feeling when you see that first `Ready` status. It's not quite triumph—you haven't built anything complex yet. It's not quite relief—you know there's a long road ahead.

It's more like: **this is actually possible.**

You've crossed the threshold from theory to practice. The hardware works. The software works. The pieces fit together. You can build on this.

That feeling carried me through the next six months. Every time something broke (and things broke often), I'd remember: I got it working once. I can get it working again.

The foundation was set. The cluster was alive. Now came the real work: making it production-ready, resilient, and actually useful.

But that first boot? That first `kubectl get nodes`? That first green "Ready"?

**That's the moment you become a cluster operator.**

---

*Next: [Chapter 3: Making Things Talk](/chapters/03-making-things-talk) - When networking clicked (and when it broke).*
