## Chapter 14: Troubleshooting and Lessons Learned

> **Note:** This chapter is based on analysis of 212 Git commits, identifying 92 problems and their solutions. The journey wasn't always smooth, but each challenge taught valuable lessons.

### Major Challenges

#### Challenge 1: Pi-hole Port Conflicts with K3s ServiceLB

**Date:** December 28-30, 2025  
**Commit:** `c3bfadf` (PR #50, #56)

**Problem:**
Pi-hole pod couldn't bind to port 53 (DNS) because K3s ServiceLB was conflicting with the pod's network configuration. The pod would fail to start or DNS resolution would break.

**Symptoms:**

- Pi-hole pod in `CrashLoopBackOff` or `Pending` state
- DNS queries failing
- Port 53 already in use errors
- ServiceLB trying to bind to the same port

**Root Cause:**
K3s includes a built-in ServiceLB (Klipper) that automatically creates LoadBalancer services. When Pi-hole was configured with `hostNetwork: true` or when ServiceLB tried to bind to port 53, conflicts occurred. Additionally, the deployment template didn't explicitly disable `hostNetwork`, leading to unpredictable behavior.

**Investigation:**

1. Checked pod logs: `kubectl logs -n pihole deployment/pi-hole`
2. Verified port binding: `netstat -tuln | grep 53`
3. Examined ServiceLB configuration
4. Reviewed Pi-hole Helm chart deployment template

**Solution:**

1. **Disabled K3s ServiceLB for Pi-hole service:**

   ```yaml
   annotations:
     service.beta.kubernetes.io/k3s-lb: "false"
   ```

2. **Explicitly set `hostNetwork: false` in deployment:**

   ```yaml
   spec:
     hostNetwork: false
   ```

3. **Used MetalLB for LoadBalancer functionality** instead of ServiceLB

4. **Added comprehensive documentation** in Pi-hole README with troubleshooting guide

**Prevention:**

- Always explicitly set `hostNetwork` in deployment templates (don't rely on defaults)
- Document network requirements for services using privileged ports
- Use MetalLB for LoadBalancer services on bare metal instead of ServiceLB when conflicts occur
- Add health checks and readiness probes to detect port conflicts early

**Lessons Learned:**

- K3s ServiceLB can conflict with pods using privileged ports
- Explicit configuration is better than implicit defaults
- MetalLB provides more control for bare-metal Kubernetes
- Documentation helps prevent repeating the same mistakes

---

#### Challenge 2: ARM64 Image Compatibility for BIND

**Date:** November 13, 2025  
**Commit:** `1b41a1c`

**Problem:**
ExternalDNS couldn't connect to BIND service because the BIND container image wasn't ARM64 compatible. The pod would crash or fail to start on Raspberry Pi.

**Symptoms:**

- BIND pod in `ImagePullBackOff` or `CrashLoopBackOff`
- Error: "no matching manifest for linux/arm64"
- ExternalDNS failing to connect to BIND

**Root Cause:**
The default BIND image in the Helm chart was built for AMD64/x86_64 architecture. Raspberry Pi 5 uses ARM64 architecture, so the image couldn't run.

**Solution:**
Switched to an ARM64-compatible BIND image:

```yaml
image:
  repository: internetsystemsconsortium/bind9
  tag: "9.18" # ARM64 compatible version
```

**Prevention:**

- Always verify image architecture compatibility for ARM64 deployments
- Use multi-arch images when available
- Test image pulls before deploying to production
- Document architecture requirements in deployment manifests

**Lessons Learned:**

- ARM64 compatibility is critical for Raspberry Pi deployments
- Not all container images support ARM64
- Always check image architecture before deployment
- Multi-arch images simplify cross-platform deployments

---

#### Challenge 3: Storage Class Configuration for Monitoring Stack

**Date:** November 7, 2025  
**Commits:** `3e8c1ef`, `18872b7`

**Problem:**
Prometheus and Grafana pods couldn't create persistent volumes because the storage class wasn't specified. Pods would start but lose all data on restart.

**Symptoms:**

- Prometheus/Grafana pods starting but data not persisting
- PVCs in `Pending` state
- No storage class assigned to volumes

**Root Cause:**
The monitoring stack Helm chart didn't specify `storageClassName: local-path`, which is the default storage class in K3s. Without explicit configuration, PVCs couldn't bind to volumes.

**Solution:**
Added explicit storage class configuration:

```yaml
persistence:
  enabled: true
  storageClass: "local-path"
  size: 8Gi # Prometheus
  # size: 2Gi  # Grafana
```

**Prevention:**

- Always specify storage class explicitly in Helm values
- Document storage requirements for stateful applications
- Verify PVC status after deployment: `kubectl get pvc -A`
- Use appropriate storage class for single-node vs multi-node clusters

**Lessons Learned:**

- Explicit storage class configuration prevents binding issues
- `local-path` is perfect for single-node K3s clusters
- Stateful applications require persistent storage planning
- Always verify PVC status after deployment

---

#### Challenge 4: BIND DNS Resolution and ExternalDNS Integration

**Date:** November 13, 2025  
**Commits:** `50a6ce8`, `1713866`

**Problem:**
ExternalDNS couldn't update DNS records via BIND because:

1. BIND couldn't resolve upstream DNS queries
2. ExternalDNS was pointing to node IP instead of BIND service

**Symptoms:**

- ExternalDNS pod in `CrashLoopBackOff`
- DNS record updates failing
- BIND logs showing DNS resolution errors

**Root Cause:**

1. BIND was configured to use itself for DNS resolution (circular dependency)
2. ExternalDNS RFC2136 provider was configured with node IP instead of BIND ClusterIP service

**Solution:**

1. **Configured BIND to use CoreDNS for upstream resolution:**

   ```yaml
   environment:
     - name: RESOLVER
       value: "kube-dns.kube-system.svc.cluster.local"
   ```

2. **Updated ExternalDNS to use BIND ClusterIP:**
   ```yaml
   rfc2136:
     host: "bind.pihole.svc.cluster.local" # Instead of node IP
   ```

**Prevention:**

- Always use Kubernetes service DNS names instead of node IPs
- Configure proper DNS resolution chains (avoid circular dependencies)
- Test DNS updates after ExternalDNS configuration
- Monitor ExternalDNS logs for connection errors

**Lessons Learned:**

- Kubernetes service discovery is more reliable than node IPs
- DNS resolution chains must be properly configured
- ExternalDNS requires proper BIND/RFC2136 configuration
- Service DNS names survive node IP changes

---

#### Challenge 5: Vault Sealing After Raspberry Pi Restart

**Date:** November 17-23, 2025  
**Related:** Migration from dev mode to production mode

**Problem:**
After each Raspberry Pi restart, Vault would start in a sealed state, requiring manual unsealing with 3 of 5 keys. This broke all applications depending on secrets from Vault.

**Symptoms:**

- Vault pod running but sealed
- External Secrets Operator failing to sync
- Applications unable to start (missing secrets)
- Error: "Vault is sealed"

**Root Cause:**
Vault in production mode requires manual unsealing after each restart for security. This is expected behavior but wasn't initially documented or automated.

**Solution:**

1. **Created automated unsealing script:**

   ```bash
   ./scripts/operations/unseal-vault.sh
   ```

2. **Documented the unsealing process** in VAULT.md

3. **Added Vault status checks** to deployment validation scripts

4. **Created backup/restore scripts** for unseal keys

**Prevention:**

- Document manual steps required after restarts
- Create automation scripts for repetitive tasks
- Store unseal keys securely (password manager)
- Add Vault status to monitoring dashboards
- Consider auto-unseal with cloud KMS for production (future)

**Lessons Learned:**

- Production Vault requires manual unsealing (security feature)
- Automation scripts save time for repetitive tasks
- Documentation is critical for operational procedures
- Monitoring should include Vault seal status
- Backup unseal keys securely (they can't be recovered)

---

#### Challenge 6: MetalLB VIP Not Responding After Interface Changes

**Date:** January 18, 2026  
**Branch:** `main`  
**Issue:** Related to NET-005 in runbook

**Problem:**
After cluster changes, the MetalLB VIP (192.168.2.200) stopped responding. Services worked via NodePort but not through the LoadBalancer IP. All `*.eldertree.local` services became unreachable.

**Symptoms:**

- VIP does not respond to ping: `ping 192.168.2.200` → timeout
- Services accessible via NodePort (e.g., `192.168.2.101:32474`) but not VIP
- `/etc/hosts` correctly mapping to VIP
- MetalLB speakers running but VIP unreachable
- ARP table shows no entry for VIP

**Root Cause:**
MetalLB L2Advertisement was not configured to use the correct network interface. The Raspberry Pi nodes have:
- `wlan0`: 192.168.2.0/24 (management network, where clients connect)
- `eth0`: 10.0.0.0/24 (internal k3s cluster network)

MetalLB was attempting to announce on all interfaces or defaulting to eth0, but clients were on the wlan0 network.

**Solution:**
Explicitly configure L2Advertisement to use `wlan0`:

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
    - wlan0  # Specify the management network interface
```

Apply and restart:

```bash
kubectl apply -f clusters/eldertree/core-infrastructure/metallb/config.yaml
kubectl rollout restart daemonset/metallb-speaker -n metallb-system
```

**Verification:**

```bash
# Test VIP connectivity
ping -c 3 192.168.2.200
# 64 bytes from 192.168.2.200: icmp_seq=0 ttl=64 time=2.xxx ms

# Test service
curl -k https://grafana.eldertree.local
# Works!
```

**Lessons Learned:**

- Always specify interfaces for MetalLB L2 mode on multi-interface nodes
- Don't trust auto-detection for network interfaces
- NodePort bypass is a useful debugging technique
- ARP table inspection helps diagnose L2 issues

---

#### Challenge 7: The Great DNS Battle - Making Pi-hole Work as Primary DNS

**Date:** December 30-31, 2025  
**Branch:** `fix/pi-hole-servicelb-annotation`  
**Commits:** `baeb241`, `1a3834d`, `d8293ca`

**Problem:**
After setting up Pi-hole as the DNS server for the cluster, DNS resolution wasn't working when using `192.168.2.201` (Pi-hole LoadBalancer IP) as the primary DNS. Queries would timeout, requiring a fallback DNS server (1.1.1.1) to work. The goal was to use Pi-hole as the sole DNS server without any fallback.

**Symptoms:**

- DNS queries to `192.168.2.201` timing out from external clients (MacBook)
- `dig @192.168.2.201 google.com` returning "connection timed out"
- `ping 192.168.2.201` failing with "Destination Host Unreachable"
- DNS working from within cluster pods but not from external clients
- LoadBalancer IP not reachable despite MetalLB announcing it

**Root Causes (Multiple Layers):**

1. **MetalLB Layer 2 Advertisement Issue:**

   - MetalLB was announcing the LoadBalancer IP but not on the correct network interface
   - Nodes have InternalIPs `10.0.0.1/10.0.0.2` (K3s internal network) but physical IPs are on `192.168.2.0/24` via `wlan0`
   - MetalLB wasn't explicitly configured to use `wlan0` interface, causing advertisement on wrong network

2. **Service externalTrafficPolicy Misconfiguration:**

   - Initially set to `Local` policy, which was too restrictive
   - With `Local` policy, only the node hosting the pod can respond, but routing wasn't working correctly
   - Changed to `Cluster` policy to allow traffic from any node

3. **Manual DNS Entries Overriding ExternalDNS:**

   - Manual entries in Pi-hole dnsmasq ConfigMap (`address=/grafana.eldertree.local/192.168.2.101`) were overriding ExternalDNS-managed records
   - Wildcard entry in BIND zone (`* A 192.168.2.101`) was catching all queries before ExternalDNS records could be used

4. **ExternalDNS Circular Dependency:**
   - ExternalDNS was trying to resolve `pi-hole.pihole.svc.cluster.local` for RFC2136 connection
   - But ExternalDNS depends on Pi-hole for DNS resolution, creating a circular dependency
   - Fixed by using Pi-hole service ClusterIP directly (`10.43.227.7`)

**Investigation Journey:**

This was a multi-hour troubleshooting session that required investigating multiple layers:

1. **Initial Diagnosis:**

   ```bash
   # DNS queries timing out
   dig @192.168.2.201 google.com
   # Result: connection timed out

   # LoadBalancer IP not reachable
   ping 192.168.2.201
   # Result: Destination Host Unreachable
   ```

2. **MetalLB Investigation:**

   ```bash
   # Checked MetalLB speaker logs
   kubectl logs -n metallb-system -l app.kubernetes.io/component=speaker
   # Found: "notOwner" errors, IP being withdrawn and re-announced

   # Checked L2Advertisement configuration
   kubectl get l2advertisement -n metallb-system default -o yaml
   # Found: Missing `interfaces: [wlan0]` specification
   ```

3. **Service Policy Testing:**

   ```bash
   # Tested with Local policy (didn't work)
   kubectl patch svc -n pihole pi-hole -p '{"spec":{"externalTrafficPolicy":"Local"}}'
   # Still timing out

   # Tested with Cluster policy
   kubectl patch svc -n pihole pi-hole -p '{"spec":{"externalTrafficPolicy":"Cluster"}}'
   # Still timing out initially
   ```

4. **DNS Record Investigation:**

   ```bash
   # Checked what DNS records existed
   kubectl get configmap -n pihole pi-hole-dnsmasq -o yaml
   # Found: Manual entries overriding ExternalDNS

   # Checked BIND zone
   kubectl get configmap -n pihole pi-hole-bind -o yaml
   # Found: Wildcard entry catching all queries
   ```

5. **ExternalDNS Investigation:**
   ```bash
   # Checked ExternalDNS logs
   kubectl logs -n external-dns -l app.kubernetes.io/name=external-dns
   # Found: Couldn't resolve pi-hole.pihole.svc.cluster.local
   ```

**Solution (Multi-Step Fix):**

1. **Fixed MetalLB Interface Configuration:**

   Updated `clusters/eldertree/core-infrastructure/metallb/config.yaml`:

   ```yaml
   apiVersion: metallb.io/v1beta1
   kind: L2Advertisement
   metadata:
     name: default
     namespace: metallb-system
   spec:
     ipAddressPools:
       - default
     # Specify wlan0 interface to ensure MetalLB advertises on physical network
     interfaces:
       - wlan0
   ```

   Applied and restarted MetalLB speakers:

   ```bash
   kubectl apply -f clusters/eldertree/core-infrastructure/metallb/config.yaml
   kubectl rollout restart daemonset -n metallb-system metallb-speaker
   ```

2. **Changed Service externalTrafficPolicy:**

   Updated `helm/pi-hole/templates/service.yaml`:

   ```yaml
   spec:
     # Use Cluster policy for DNS to allow traffic from any node
     # Cluster policy allows traffic from any node, which is required for
     # proper DNS response routing in MetalLB LoadBalancer setup with multiple nodes
     externalTrafficPolicy: Cluster
   ```

   This allows DNS traffic to be routed from any node, not just the node hosting the pod.

3. **Removed Manual DNS Overrides:**

   Cleared manual entries from `pi-hole-dnsmasq` ConfigMap:

   ```yaml
   data:
     05-custom-dns.conf: |
       # Custom DNS rewrites moved to BIND backend for RFC2136 support
       # Only put non-dynamic records here if needed
       # Removed manual DNS entries that were overriding ExternalDNS
   ```

   Removed wildcard from BIND zone in `pi-hole-bind` ConfigMap:

   ```yaml
   data:
     eldertree.local.zone: |
       # Removed wildcard entry that was overriding ExternalDNS
       # Only keep static records that shouldn't be managed by ExternalDNS
   ```

4. **Fixed ExternalDNS Circular Dependency:**

   Updated `clusters/eldertree/dns-services/external-dns/helmrelease.yaml`:

   ```yaml
   env:
     - name: EXTERNAL_DNS_RFC2136_HOST
       # WORKAROUND: Use ClusterIP directly to avoid circular DNS dependency
       # ExternalDNS can't resolve pi-hole.pihole.svc.cluster.local because
       # it depends on DNS working, which creates a circular dependency.
       value: "10.43.227.7" # Pi-hole service ClusterIP
   ```

5. **Restarted Pi-hole Pods:**
   ```bash
   kubectl rollout restart deployment -n pihole pi-hole
   ```

**Verification:**

After all fixes were applied:

```bash
# Test external domain resolution
dig @192.168.2.201 google.com
# Result: ✅ Working - returns IP addresses

nslookup google.com 192.168.2.201
# Result: ✅ Working - resolves correctly

# Test local domain resolution
dig @192.168.2.201 grafana.eldertree.local
# Result: ✅ Working - resolves to 192.168.2.200 (Traefik LoadBalancer)

# Test LoadBalancer IP reachability
ping -c 2 192.168.2.201
# Result: ✅ Working - packets received
```

**Prevention:**

- Always specify network interfaces explicitly in MetalLB L2Advertisement for multi-network nodes
- Use `Cluster` policy for DNS services that need to be accessible from external clients
- Never add manual DNS entries that conflict with ExternalDNS-managed records
- Use ClusterIP directly for services that ExternalDNS depends on (avoid circular dependencies)
- Document network architecture (internal vs physical IPs) in infrastructure docs
- Test DNS resolution from external clients, not just from within cluster

**Lessons Learned:**

- **Multi-layer troubleshooting is essential:** DNS issues can span networking, service configuration, and application layers
- **MetalLB Layer 2 mode requires interface specification:** When nodes have multiple network interfaces, explicitly specify which interface to use
- **externalTrafficPolicy matters for LoadBalancer services:** `Cluster` policy allows traffic from any node, while `Local` is more restrictive
- **Avoid circular dependencies in DNS:** Services that DNS depends on should use direct IPs, not DNS names
- **Manual overrides break automation:** ExternalDNS can't work if manual entries override its records
- **Test from external clients:** Just because DNS works from within the cluster doesn't mean it works from external clients
- **Document network architecture:** Understanding internal vs physical IPs is critical for troubleshooting LoadBalancer issues

**The Victory:**

After hours of troubleshooting across multiple layers, Pi-hole now works as the primary DNS server without requiring any fallback. The MacBook can use `192.168.2.201` as the sole DNS server, and both local (`*.eldertree.local`) and external domains resolve correctly. This was a true battle that required understanding MetalLB Layer 2 mode, Kubernetes service routing, DNS resolution chains, and ExternalDNS integration.

---

#### Challenge 7: Cluster-Wide Boot Failure and SD Card Recovery

**Date:** January 2-3, 2026  
**Branch:** Recovery from maintenance shutdown  
**Commits:** Multiple recovery commits

**Problem:**
After a maintenance shutdown of all Raspberry Pi nodes, the entire cluster failed to boot. All three nodes (node-1, node-2, node-3) were stuck in emergency mode or busybox/initramfs, making the cluster completely inaccessible. This was a critical failure that required physical recovery using SD card backups.

**Symptoms:**

- All nodes unreachable via SSH and ping
- Nodes stuck in emergency mode requiring root password
- Nodes stuck in busybox/initramfs shell
- Root account locked (preventing console access)
- Boot hanging waiting for unavailable mounts
- Cluster API completely down: `Unable to connect to the server: dial tcp 192.168.2.101:6443: connect: host is down`

**Root Causes (Multiple Issues):**

1. **Missing `nofail` on Optional Mounts:**

   - `/etc/fstab` had entries for optional mounts (backup drive `/dev/sdb1`, NVMe partitions) without the `nofail` flag
   - Systemd would wait ~30 seconds for each unavailable mount before giving up
   - This caused boot delays and timeouts, sometimes leading to emergency mode

2. **Unused Backup Mount Causing Boot Delays:**

   - An unused `/dev/sdb1 /mnt/backup` mount was configured in fstab
   - This mount was never actually used (no scripts, no cron jobs)
   - Even with `nofail`, systemd would wait ~30 seconds for the mount to fail
   - This added unnecessary boot delay on every restart

3. **Root Account Locked:**

   - Root account was locked after switching boot devices (SD to NVMe)
   - PAM faillock was enabled, locking accounts after failed login attempts
   - Without console access (only Bluetooth keyboard available), recovery was impossible

4. **Incorrect fstab Configuration:**

   - NVMe partitions were mounted without `nofail` flag
   - When booting from SD card, NVMe mounts would fail and cause boot issues
   - Missing `nofail` on boot partition caused issues during recovery

5. **Corrupted SD Card OS:**
   - SD card backup OS had corrupted initramfs
   - SD card fstab had incorrect entries
   - SD card would get stuck in busybox/initramfs even after fixes

**Investigation Journey:**

This was a multi-day recovery process that required understanding boot processes, fstab configuration, and recovery procedures:

1. **Initial Diagnosis:**

   ```bash
   # All nodes unreachable
   ping -c 1 192.168.2.101  # node-1 - no response
   ping -c 1 192.168.2.102  # node-2 - no response
   ping -c 1 192.168.2.103  # node-3 - no response

   # Cluster API down
   kubectl get nodes
   # Error: Unable to connect to the server: dial tcp 192.168.2.101:6443: connect: host is down
   ```

2. **Physical Inspection:**

   - Nodes were stuck during boot
   - Some showed emergency mode requiring root password
   - Some showed busybox/initramfs shell
   - No USB keyboard available (only Bluetooth), making console access difficult

3. **SD Card Recovery Strategy:**

   - Decided to recover nodes one by one using SD card backups
   - SD card has generic hostname `node-x` (from Raspberry Pi Imager)
   - Nodes identified by IP address during recovery
   - Boot from SD card, then fix NVMe, then boot from NVMe

4. **Root Cause Analysis:**

   ```bash
   # When booted from SD card, checked fstab
   cat /etc/fstab
   # Found: Missing nofail on optional mounts
   # Found: Unused backup mount causing delays

   # Checked root account status
   passwd -S root
   # Found: Root account locked (L)

   # Checked PAM configuration
   grep pam_faillock /etc/pam.d/common-auth
   # Found: PAM faillock enabled
   ```

**Solution (Multi-Step Recovery):**

1. **Created Boot Reliability Fix Playbook:**

   Created `ansible/playbooks/fix-boot-reliability.yml` to address all boot issues:

   ```yaml
   - name: Fix Boot Reliability Issues
     hosts: raspberry_pi
     become: true
     tasks:
       # Unlock root account
       - name: Unlock root account
         command: passwd -u root

       # Set root password
       - name: Set root password
         user:
           name: root
           password: "{{ password_hash }}"

       # Remove unused backup mount
       - name: Remove unused backup mount
         replace:
           path: /etc/fstab
           regexp: '^/dev/sdb1.*/mnt/backup.*\n?'
           replace: ""

       # Add nofail to optional mounts
       - name: Add nofail to optional mounts
         replace:
           path: /etc/fstab
           regexp: '^(/dev/nvme[^\s]*\s+[^\s]*\s+ext4\s+defaults)([^,]*)(\s+\d+\s+\d+)$'
           replace: '\1,nofail\2\3'

       # Disable PAM faillock
       - name: Disable PAM faillock
         replace:
           path: /etc/pam.d/common-auth
           regexp: "^(auth.*pam_faillock)"
           replace: '# \1'
   ```

2. **SD Card Recovery Process:**

   For each node, the recovery process was:

   a. **Boot from SD Card:**

   - Insert SD card backup into node
   - Remove NVMe temporarily (to ensure boot from SD)
   - Power on and wait for boot (hostname will be `node-x`)
   - Identify node by IP address

   b. **Fix NVMe (Not SD Card):**

   - Mount NVMe partitions: `/mnt/nvme-root` and `/mnt/nvme-boot`
   - Apply boot reliability fixes to NVMe fstab
   - Fix NVMe cmdline.txt
   - Unlock root account on NVMe
   - Disable PAM faillock on NVMe

   c. **Reboot from NVMe:**

   - Remove SD card
   - Ensure NVMe is connected
   - Reboot - node should boot from NVMe correctly

   Created `scripts/recover-node-by-ip.sh` to automate this process:

   ```bash
   # Usage: ./scripts/recover-node-by-ip.sh <IP_ADDRESS>
   # Example: ./scripts/recover-node-by-ip.sh 192.168.2.101

   # Script automatically:
   # - Identifies node by IP
   # - Mounts NVMe partitions
   # - Applies fixes to NVMe (not SD card)
   # - Verifies fixes
   ```

3. **SD Card Fresh Setup:**

   When SD card itself was corrupted (stuck in busybox/initramfs):

   a. **Format SD Card with Raspberry Pi Imager:**

   - OS: Debian 12 Bookworm (64-bit)
   - Hostname: `node-x` (generic, works for any node)
   - User: `raolivei`
   - Password: `Control01!` (different from main password to avoid mistakes)
   - SSH: Enabled

   b. **Apply Boot Reliability Fixes:**

   - Boot from SD card
   - Run `./scripts/setup-sd-card-os.sh <IP>` to apply fixes
   - Script updates initramfs, fixes fstab, removes backup mount

   c. **SD Card Ready for Recovery:**

   - SD card can now be used to boot and fix NVMe on any node

4. **Removed Unused Backup Mount:**

   Updated `ansible/playbooks/setup-system.yml` to make backup mount optional:

   ```yaml
   vars:
     # Backup mount is now optional (default: false)
     # Only enable if you have a permanently connected backup drive
     enable_backup_mount: "{{ enable_backup_mount | default(false) | bool }}"
   ```

   Created `ansible/playbooks/remove-backup-mount.yml` to remove from existing nodes.

5. **Documentation Created:**
   - `docs/RECOVERY_FROM_SD_CARD.md` - Complete recovery guide
   - `docs/SD_CARD_FRESH_SETUP.md` - SD card setup guide
   - `docs/BACKUP_MOUNT_DECISION.md` - Trade-off analysis for backup mount
   - `scripts/recover-node-by-ip.sh` - Automated recovery script
   - `scripts/setup-sd-card-os.sh` - SD card setup script
   - `scripts/fix-sd-card-on-node2.sh` - Fix SD card while mounted

**Verification:**

After recovery, all nodes boot correctly:

```bash
# All nodes accessible
ping -c 1 192.168.2.101  # node-1 - ✅ Working
ping -c 1 192.168.2.102  # node-2 - ✅ Working
ping -c 1 192.168.2.103  # node-3 - ✅ Working

# Cluster API accessible
kubectl get nodes
# Result: ✅ All nodes in Ready state

# Boot times improved
# Before: ~60-90 seconds (with backup mount timeout)
# After: ~30-40 seconds (backup mount removed)
```

**Prevention:**

- **Always use `nofail` on optional mounts** - Prevents boot failures when mounts are unavailable
- **Remove unused mounts from fstab** - Even with `nofail`, systemd waits before giving up
- **Keep root account unlocked** - Critical for emergency mode access
- **Disable PAM faillock** - Prevents account lockouts during recovery
- **Test reboots after important changes** - Catch boot issues before they become critical
- **Maintain SD card backups** - Essential for recovery when NVMe boot fails
- **Document recovery procedures** - When disaster strikes, you need clear steps
- **Make optional features truly optional** - Don't add features by default that cause boot delays

**Lessons Learned:**

- **Boot reliability is critical** - A cluster that can't boot is completely useless
- **`nofail` is not enough** - Even with `nofail`, systemd waits before giving up, causing delays
- **Unused mounts cause problems** - Remove mounts that aren't actually being used
- **SD card recovery is essential** - When NVMe boot fails, SD card is your lifeline
- **Root account must be accessible** - Locked root accounts prevent emergency mode recovery
- **Documentation saves time** - Clear recovery procedures are critical during disasters
- **Test assumptions** - Just because something has `nofail` doesn't mean it's harmless
- **Default behavior matters** - Don't add optional features by default that cause boot delays
- **Physical access limitations** - No USB keyboard (only Bluetooth) made console access difficult
- **Recovery is iterative** - Each node recovered teaches lessons for the next one

**The Recovery Process:**

The recovery took several days and required:

1. Understanding boot processes (initramfs, fstab, systemd mounts)
2. Creating automated recovery scripts
3. Documenting the complete process
4. Fixing SD card OS when it was corrupted
5. Applying fixes to NVMe (not SD card) during recovery
6. Testing reboots after each fix

**Key Insight:**

The most important lesson was understanding that **optional mounts should be truly optional**. Even with `nofail`, systemd waits before giving up, causing boot delays. The unused backup mount was adding ~30 seconds to every boot, and when combined with other issues, it could cause boot failures. Removing unused mounts and ensuring all optional mounts have `nofail` is critical for boot reliability.

**Trade-off Analysis:**

The backup mount decision illustrates an important trade-off:

- **ON (default):** Prepared for backup drive, but causes boot timeout if drive not connected
- **OFF (recommended):** Faster boot, but need to configure manually when connecting drive

**Decision:** Keep backup mount OFF by default. Only enable when you have a permanently connected backup drive. Boot speed is more important than the convenience of an unused feature.

**The Recovery: A Tale of SD Cards and NVMe Drives**

With the root causes identified and tools created, it was time for the actual recovery. Picture this: three Raspberry Pis sitting in a rack, completely unresponsive, like they'd collectively decided to take a vacation. The only way back was through a single SD card and a lot of patience.

**Round 1: Node-1 (The Boss)**

Node-1 is the control plane—the brain of the operation. Without it, nothing works. So naturally, it got first priority.

I formatted a fresh SD card (because the old one was also corrupted—because of course it was), booted node-1 from it, and watched it come online with the generic hostname `node-x`. It felt like meeting a stranger who happens to live at your address.

Then came the moment of truth: mount the NVMe, fix its fstab, unlock root, disable PAM faillock, fix cmdline.txt. All while the node is running from the SD card, like performing surgery on someone while they're walking around.

I removed the SD card, crossed my fingers, and rebooted. Two minutes later: `node-1.eldertree.local` was back online, booting from NVMe, k3s running, cluster API responding. Victory! 🎉

**Round 2: Node-2 (The Worker)**

With node-1 recovered, node-2 was next. Same SD card (why waste a good thing?), same process. By this point, I had the routine down: boot from SD, mount NVMe, apply fixes, remove SD, reboot, celebrate.

Node-2 came back online without drama. Sometimes the second time is easier because you've already made all the mistakes.

**Round 3: Node-3 (The Other Worker)**

Finally, node-3. By now, the process was muscle memory. Boot from SD, mount NVMe, apply fixes, remove SD, reboot. Done. Three nodes, three recoveries, one very relieved cluster administrator.

**The Plot Twist: Fixing the Wrong Thing**

Here's where it gets embarrassing. Early in the recovery, I was applying fixes to the SD card instead of the NVMe. The SD card! The thing I was only using to temporarily boot the system!

It's like fixing the rental car's engine when your actual car is in the shop. The SD card was just a means to an end, but I kept trying to make it perfect. Eventually, I realized: "Wait, I'm supposed to fix the NVMe, not the SD card. The SD card is just... temporary access."

This led to a very important update in the recovery scripts: big, bold warnings that say "⚠️ THIS FIXES THE NVME, NOT THE SD CARD!" Because apparently, I needed that reminder.

**The Happy Ending**

After two days of investigation, tool creation, and actual recovery work, all three nodes (node-1, node-2, and node-3) were back online:

```bash
$ kubectl get nodes
NAME                     STATUS   ROLES
node-1.eldertree.local   Ready    control-plane,etcd,master
node-2.eldertree.local   Ready    <none>
node-3.eldertree.local   Ready    <none>
```

All pods running, all services healthy, cluster fully operational. The eldertree was back to providing shelter.

**What I Learned (The Hard Way):**

1. **SD cards are your lifeline** - When NVMe boot fails, that SD card backup is worth its weight in gold
2. **Fix the right thing** - SD card is temporary access, NVMe is the actual target (yes, I needed to learn this)
3. **Unused mounts are troublemakers** - That backup mount I never used? It was adding 30 seconds to every boot and causing timeouts
4. **Documentation saves sanity** - When you're in the middle of a disaster, clear steps are everything
5. **One node at a time** - Methodical beats frantic every time

The cluster is now more resilient, with better boot reliability and a complete recovery playbook. And I have a newfound appreciation for the humble SD card—the unsung hero of this recovery story.

---

### Common Issues

Based on analysis of 92 problems identified in the Git history, here are the most common categories:

1. **Vault Sealing After Restart** (Multiple occurrences)

   - **Solution:** Automated unsealing script (`./scripts/operations/unseal-vault.sh`)
   - **Prevention:** Document unsealing process, add to monitoring
   - **Frequency:** Every restart (expected behavior in production mode)

2. **DNS Resolution Issues** (15+ related commits)

   - **Common causes:** Pi-hole not ready, BIND service unavailable, ExternalDNS misconfiguration, multi-container pod readiness
   - **Solution:** Verify Pi-hole and BIND status, check ExternalDNS logs, wait for all containers to be ready
   - **Prevention:** Health checks, proper service DNS configuration, monitoring, understand readiness probes
   - **Key fixes:** ARM64 BIND image, CoreDNS resolution chain, ClusterIP instead of node IP
   - **Detailed case study:** See Chapter 8 for a complete troubleshooting story of a DNS outage caused by multi-container pod readiness issues

3. **Resource Limits on Raspberry Pi** (Multiple occurrences)

   - **Common issue:** "Specified limits are higher than node capacity!"
   - **Solution:** Optimize resource requests/limits for ARM64/Raspberry Pi constraints
   - **Prevention:** Monitor resource usage, set appropriate limits from start
   - **Example fixes:** Reduced FluxCD, KEDA, Journey API limits from 1000m/1Gi to 500m/512Mi

4. **Storage Class Configuration** (Multiple occurrences)

   - **Common issue:** PVCs in Pending state, data not persisting
   - **Solution:** Explicitly specify `storageClassName: local-path` in Helm values
   - **Prevention:** Always configure storage class for stateful applications
   - **Affected services:** Prometheus, Grafana, Vault

5. **Image Pull Issues** (Multiple occurrences)

   - **Common causes:** ARM64 incompatibility, missing GHCR secrets, wrong image tags
   - **Solution:** Verify image architecture, configure imagePullSecrets, use versioned tags
   - **Prevention:** Test image pulls, use ARM64-compatible images, pin image versions
   - **Example fixes:** ARM64 BIND image, versioned SwimTO tags (v0.5.1), GHCR secret configuration

6. **Helm Chart/Template Issues** (Multiple occurrences)
   - **Common issues:** Template syntax errors, missing values, incorrect paths
   - **Solution:** Validate Helm templates, check values.yaml, verify chart paths
   - **Prevention:** Use `helm template` to validate before deployment, test locally
   - **Example fixes:** Dashboard template base functions, correct Helm chart paths in FluxCD

### Debugging Workflow

1. Check pod status: `kubectl get pods -A`
2. Check logs: `kubectl logs <pod> -n <namespace>`
3. Check events: `kubectl get events -A`
4. Check resource usage: Grafana dashboards
5. Check DNS: `nslookup <service>.eldertree.local`

### Lessons Learned Summary

Based on 212 commits, 45 pull requests, and 92 problems solved:

**What Worked Well:**

- ✅ **K3s was the right choice** - Lightweight, ARM64 support, built-in components (Traefik, local-path)
- ✅ **Ansible for automation** - Idempotent configuration, reproducible deployments
- ✅ **GitOps with FluxCD** - All infrastructure as code, easy rollbacks, version control
- ✅ **Vault for secrets management** - Policy-based access, External Secrets integration
- ✅ **Pi-hole for DNS** - Network-wide ad-blocking, local service resolution
- ✅ **Helm charts** - Simplified application deployment and configuration
- ✅ **Git history analysis** - Commits document the journey, problems, and solutions

**What Would I Do Differently:**

- 🔄 **Start with explicit resource limits** - Would have saved time debugging "limits higher than capacity" errors
- 🔄 **Document ARM64 requirements earlier** - Would have avoided image compatibility issues
- 🔄 **Set up monitoring from day one** - Would have caught issues faster
- 🔄 **Use versioned image tags from start** - Would have avoided "latest" tag issues
- 🔄 **Automate Vault unsealing earlier** - Would have reduced manual steps after restarts

**Key Takeaways:**

- 📝 **Automation from the start** - Scripts and Ansible playbooks save time and prevent errors
- 📝 **Documentation is critical** - Every problem solved should be documented to avoid repetition
- 📝 **Monitoring is essential** - Grafana dashboards help identify issues before they become critical
- 📝 **Start simple, add complexity gradually** - Begin with control plane, then add worker nodes
- 📝 **Git history tells the story** - Commit messages document problems, solutions, and decisions
- 📝 **ARM64 requires special attention** - Always verify image compatibility for Raspberry Pi
- 📝 **Explicit configuration beats defaults** - Always specify storage classes, resource limits, network settings
- 📝 **Test before deploying** - Use `helm template`, validate YAML, test locally when possible
- 📝 **PRs provide context** - Pull requests document why changes were made, not just what changed

**Statistics from the Journey:**

- **Total Commits:** 212
- **Pull Requests:** 45
- **Problems Solved:** 92
- **Features Added:** 91
- **Bug Fixes:** 68 (32% of commits)
- **Features:** 31 (14.6% of commits)
- **Documentation:** 22 (10.3% of commits)

**The Journey in Numbers:**
This blog represents months of learning, troubleshooting, and iteration. Each commit tells a story of a problem encountered, investigated, and solved. The 92 problems identified weren't failures—they were learning opportunities that made the cluster more robust and the documentation more comprehensive.

---
