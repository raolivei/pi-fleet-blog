## Chapter 12: Storage and Persistence

### The Storage Evolution

**Phase 1:** `local-path` only (K3s default)
**Phase 2:** Longhorn for distributed storage *(January 2026)*
**Phase 3:** Back to `local-path` provisioner *(February 2026)* - Longhorn removed

### Why Longhorn Was Removed

Longhorn was initially deployed for distributed block storage with 3-replica replication. However, it was removed in favor of the simpler local-path provisioner:

- **Resource overhead:** Longhorn's manager, driver, and replica pods consumed significant resources on 8GB Raspberry Pi nodes
- **Complexity vs. benefit:** For a 3-node homelab, the operational overhead of distributed storage wasn't justified
- **Vault already has HA:** Vault uses Raft consensus with its own replication across all 3 nodes, so distributed storage under Vault was redundant
- **Simpler recovery:** With proper backup strategies, local-path with periodic backups is sufficient

### Storage Classes

| Storage Class | Type | Path | Use Case |
|---------------|------|------|----------|
| `local-path` | Local filesystem | Default | General use |
| `local-path-nvme` | Local NVMe SSD | NVMe mount | Performance-critical data |
| `local-path-sd` | SD card | SD mount | Low-priority data |

### Current Configuration

**Storage Provisioner:** K3s local-path-provisioner
**Default Storage Class:** `local-path`
**Storage Nodes:** All 3 nodes (node-1, node-2, node-3)

### Persistent Volumes by Application

| Application | Size | Storage Class | Notes |
|-------------|------|---------------|-------|
| **Vault** (x3) | 10Gi each | local-path-nvme | Raft replication handles HA |
| **Prometheus** | 8Gi | local-path | 7-day retention |
| **Grafana** | 2Gi | local-path | Dashboards in git |
| **Pi-hole** | 2Gi | local-path | Easy to rebuild |

### The Longhorn Experiment (A Lesson in Simplicity)

**January 2026:** Longhorn was deployed with 3-replica volumes.

The installation itself was a tale of firewall debugging:

**Root Cause:** UFW firewall blocking cross-node pod communication!

```bash
# Flannel VXLAN uses UDP 8472
# Pod network: 10.42.0.0/16
# Service network: 10.43.0.0/16
# All were being silently dropped
```

**The Fix (still relevant for general k3s networking):**

```bash
# On ALL nodes
sudo ufw allow from 10.0.0.0/24 comment 'k3s internal network'
sudo ufw allow from 10.42.0.0/16 comment 'k3s pod network'
sudo ufw allow from 10.43.0.0/16 comment 'k3s service network'
sudo ufw allow 8472/udp comment 'k3s flannel VXLAN'
```

**Lesson:** Always check firewall rules when debugging networking. UFW can silently drop packets even when services appear to be listening!

**Why it was ultimately removed:** The resource overhead and complexity didn't justify the benefits for a homelab. Vault's built-in Raft replication already provides HA for secrets (the most critical data), and other workloads can tolerate node-local storage with proper backups.

### Backup Strategy

**Vault Secrets:**
```bash
./scripts/operations/backup-vault-secrets.sh > vault-backup-$(date +%Y%m%d).json
```

**Database Backups:**
- pg_dump for PostgreSQL databases
- Store backups on external storage (SD card)

### High Availability Summary

| Component | HA Method | Failure Tolerance |
|-----------|-----------|-------------------|
| Control Plane | 3-node etcd | 1 node |
| API Access | kube-vip VIP | 1 node |
| Secrets | Vault Raft (3 replicas) | 1 node |
| Storage | local-path-nvme (node-local) | N/A (node-pinned) |

**Key insight:** Not everything needs distributed storage. Vault handles its own replication via Raft. For other data, proper backup strategies are more practical than running a distributed storage system on resource-constrained hardware.

### Lessons Learned

- Longhorn works but is resource-heavy for Raspberry Pi
- Not all data needs distributed storage
- Vault's Raft replication eliminates the need for distributed storage under it
- Simpler is often better in homelab environments
- Firewall rules are critical for any cross-node communication
- Always test failover before you need it
- Document everything (especially firewall rules)

---
