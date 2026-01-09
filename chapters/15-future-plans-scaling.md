## Chapter 15: Future Plans and Scaling

### Short-term Goals

- [ ] Add worker nodes (fleet-worker-01, fleet-worker-02)
- [ ] Implement high availability
- [ ] Add more applications
- [ ] Improve monitoring and alerting
- [ ] Enhance backup strategy

### Cluster Expansion: Adding Worker Nodes (December 31, 2025)

**The Goal:** Expand the eldertree cluster to a multi-node setup with dedicated worker nodes (node-2 and node-3), enabling better resource distribution and redundancy.

**Initial Setup:**

- **node-1**: Control plane (192.168.2.101 (wlan0), eth0: 10.0.0.1)
- **node-2**: Worker node (192.168.2.102 (wlan0), eth0: 10.0.0.2) - already configured
- **node-3**: Worker node (192.168.2.103 (wlan0), eth0: 10.0.0.3) - already configured

**The Process:**

1. **Automated Node Setup Playbook**

   - Created `setup-new-node.yml` master playbook to orchestrate complete node setup
   - Automatically calculates next available IP addresses from inventory
   - Handles DNS configuration, network setup, k3s installation, and prerequisites

2. **Key Fixes Applied:**

   - **DNS Configuration**: Added `/etc/hosts` entries for all cluster nodes before k3s installation
   - **Network Configuration**: Fixed node-1 eth0 IP to use 10.0.0.1 (was incorrectly configured)
   - **k3s-agent Cleanup**: Added automatic cleanup of stuck k3s-agent state before restart
   - **Longhorn Prerequisites**: Improved open-iscsi detection and installation

3. **Challenges Encountered:**

   - **DNS Resolution Failure**: node-2 couldn't resolve `node-1.eldertree.local`, causing k3s-agent to fail
     - **Solution**: Added DNS configuration play to setup-new-node.yml before k3s installation
   - **k3s-agent Stuck State**: Service stuck in "activating" state after configuration changes
     - **Solution**: Added cleanup tasks to stop service and remove `/var/lib/rancher/k3s/agent` before restart
   - **Longhorn Manager Failure**: Longhorn manager pod failing due to missing `open-iscsi`
     - **Solution**: Fixed detection logic in `setup-longhorn-node.yml` to use `which iscsiadm` instead of `dpkg -l`
   - **Sudo Warnings**: "unable to resolve host node-2.eldertree.local" warnings
     - **Solution**: Added node's own hostname to `/etc/hosts` in DNS configuration play

4. **Idempotency Verification:**
   - Added verification play to `setup-new-node.yml` that can be enabled with `-e verify_idempotency=true`
   - Verifies hostname, DNS, network, k3s installation, and prerequisites
   - Ensures playbook can be safely rerun without unintended changes

**The Result:**

After running the master playbook:

```bash
ansible-playbook playbooks/setup-new-node.yml --limit localhost,node-1,node-3
```

**Cluster Status:**

- ✅ All 3 nodes in Ready state
- ✅ All nodes have correct eth0 IPs (10.0.0.1, 10.0.0.2, 10.0.0.3)
- ✅ All Longhorn manager pods running (2/2 Ready)
- ✅ DNS resolution working on all nodes
- ✅ k3s-agent connecting successfully to control plane

**Lessons Learned:**

- **DNS is Critical**: k3s requires DNS resolution to connect worker nodes to the control plane. Always configure DNS before installing k3s.
- **Service State Management**: When services get stuck, clean their state directories before restarting. This prevents persistent failure states.
- **Idempotency Matters**: Building idempotent playbooks allows safe reruns and verification, reducing manual intervention.
- **Automation Prevents Errors**: Manual fixes should always be added back to playbooks to prevent the same issues on future nodes.
- **Multi-Node Considerations**: Each node needs its own hostname in `/etc/hosts` to prevent sudo warnings and ensure proper resolution.

**The Master Playbook:**

The `setup-new-node.yml` playbook orchestrates the complete setup process:

1. **IP Calculation** - Automatically calculates next available wlan0 and eth0 IPs from inventory
2. **DNS Configuration** - Adds `/etc/hosts` entries for all cluster nodes (including node's own hostname)
3. **System Configuration** - Hostname, user setup, SSH, firewall, cgroups, timezone, NTP
4. **NVMe Boot Setup** - Partitions, clones OS from SD card, fixes emergency mode prevention (fstab, cmdline.txt, root account)
5. **Gigabit Network (eth0)** - Configures NetworkManager connection with calculated IP
6. **k3s Token Retrieval** - Automatically retrieves token from control plane (node-1)
7. **k3s Worker Installation** - Installs k3s agent with proper cgroup configuration
8. **k3s Gigabit Network** - Configures k3s to use eth0 for cluster communication
9. **SSH Keys Setup** - Node-to-node communication and optional local key addition
10. **Terminal Monitoring** - Installs btop, tmux, and neofetch
11. **Longhorn Prerequisites** - Installs and loads open-iscsi, creates mount point
12. **K3s ServiceLB Disable** - Disables ServiceLB for MetalLB compatibility
13. **Idempotency Verification** - Optional verification play (enable with `-e verify_idempotency=true`)

**Key Features:**

- **Fully automated** - No manual IP or token input required
- **Idempotent** - Safe to rerun multiple times
- **Comprehensive** - Handles all prerequisites and configuration
- **Error handling** - Includes timeouts, retries, and cleanup tasks

**Future Nodes:**

Adding new nodes is now as simple as:

1. **Boot node from SD card** with generic hostname (e.g., "node-x")
2. **Add node to inventory**: `ansible/inventory/hosts.yml`
   ```yaml
   node-N:
     ansible_host: 192.168.2.XX
   ```
3. **Run master playbook**:
   ```bash
   ansible-playbook playbooks/setup-new-node.yml --limit localhost,node-1,node-N
   ```
4. **All configuration is automated** - IPs calculated, DNS configured, k3s installed, prerequisites set up

**Optional Overrides:**

- Override IPs: `-e wlan0_ip_override=192.168.2.XX -e eth0_ip_override=10.0.0.X`
- Override k3s token: `-e k3s_token_override=<token>`
- Verify idempotency: `-e verify_idempotency=true`

### Long-term Vision

- [x] Multi-node cluster ✅ (3 nodes: 1 control plane, 2 workers)
- [ ] High availability setup
- [x] Advanced storage (Longhorn) ✅
- [ ] Enhanced security
- [ ] Disaster recovery plan

### Scaling Considerations

**Horizontal Scaling:**

- Adding worker nodes
- Load distribution
- Resource planning

**Vertical Scaling:**

- Hardware upgrades
- Resource optimization
- Performance tuning

### Technology Roadmap

- [ ] Kubernetes version upgrades
- [ ] New tools and services
- [ ] Architecture improvements
- [ ] Security enhancements

---
