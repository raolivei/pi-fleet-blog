## Chapter 2: Hardware Decisions

### Why Raspberry Pi 5?

**Decision:** Raspberry Pi 5 (8GB RAM, ARM64)

**Rationale:**

- [ ] Cost-effective compared to cloud hosting
- [ ] Low power consumption
- [ ] ARM64 architecture (learning opportunity)
- [ ] 8GB RAM sufficient for small cluster
- [ ] Active community and support

**Specifications:**

- **Model:** Raspberry Pi 5
- **RAM:** 8GB
- **Architecture:** ARM64
- **Storage:** [SD Card / NVMe - document your choice]
- **Network:** Gigabit Ethernet
- **Power:** [Power supply details]

### Storage Decisions

**Initial Setup:** NVMe (via PCIe adapter)

- **Why:**

  - **Performance**: NVMe provides significantly better I/O performance than SD cards
  - **Reliability**: SD cards are prone to wear and failure under constant write operations
  - **Boot speed**: Faster boot times and application startup
  - **Future-proof**: Better suited for Kubernetes workloads with persistent volumes

- **Performance considerations:**

  - NVMe provides 10-20x better random I/O performance
  - Lower latency for database and storage operations
  - Better suited for Longhorn distributed storage

- **Migration path:**
  - Started with SD card for initial setup
  - Cloned OS from SD to NVMe using `setup-nvme-boot.yml` playbook
  - Configured boot from NVMe with proper fstab and cmdline.txt

**⚠️ CRITICAL: Emergency Mode Prevention**

When setting up NVMe boot, it is **absolutely critical** to prevent emergency mode issues. Without proper configuration, nodes will repeatedly fail to boot and require manual intervention (which is impossible without a wired keyboard).

**The Problem:**

- Nodes boot into emergency mode when fstab has incorrect mount entries
- Root account gets locked when switching boot devices
- PAM faillock can lock accounts after failed login attempts
- Duplicate or incorrect PARTUUIDs in fstab cause mount failures
- Missing `nofail` flags on optional mounts cause boot failures

**The Solution:**
The `setup-nvme-boot.yml` playbook now automatically applies comprehensive emergency mode prevention:

- **Clean fstab**: Creates proper fstab with correct NVMe PARTUUIDs (no duplicates, no problematic entries)
- **Clean cmdline.txt**: Ensures correct root device (`/dev/nvme0n1p2`) and cgroup settings
- **Root account unlocked**: Unlocks root and sets password to prevent console lock
- **PAM faillock disabled**: Prevents account lockouts that block emergency mode access
- **Password expiration disabled**: Prevents account expiration issues

**Why This Matters:**
Without these fixes, you'll find yourself in a situation where:

- Node boots into emergency mode requiring root password
- Root account is locked, preventing console access
- No wired keyboard available (only Bluetooth)
- Node is completely inaccessible
- Requires physical access and manual recovery

**Lesson Learned:**
Always run `setup-nvme-boot.yml` with emergency mode prevention enabled. Never attempt to boot from NVMe without first applying these fixes. The playbook now includes these fixes automatically, but if you need to recover a node, use `fix-nvme-emergency-mode.yml`.

### Network Setup

- **IP Assignment:** Static IP via DHCP reservation (node-1: 192.168.2.101, node-2: 192.168.2.102, node-3: 192.168.2.103)
- **Network:** 192.168.2.0/24
- **DNS:** Pi-hole as network-wide DNS server

### Cooling and Power

- [ ] Cooling solution (if any)
- [ ] Power supply considerations
- [ ] Thermal management

### Lessons Learned

- [ ] What worked well
- [ ] What you'd change
- [ ] Performance bottlenecks discovered

---
