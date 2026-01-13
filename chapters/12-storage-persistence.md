## Chapter 12: Storage and Persistence

### The Storage Evolution

**Phase 1:** `local-path` only (K3s default)
**Phase 2:** Longhorn for distributed storage *(January 2026)*

### Storage Classes

| Storage Class | Type | Replication | Use Case |
|---------------|------|-------------|----------|
| `local-path` | Local filesystem | None | Non-critical data |
| `longhorn` | Distributed block | 3 replicas | Critical data |

### Why Longhorn?

**Problem:** With `local-path`, PersistentVolumes are pinned to specific nodes. If that node fails, the data is inaccessible until the node recovers.

**Solution:** Longhorn provides:

- [x] Distributed block storage across all nodes
- [x] Automatic replication (3 replicas by default)
- [x] Data survives single node failure
- [x] Volume can be attached to any node
- [x] Snapshot and backup capabilities
- [x] Web UI for management

### Current Configuration

**Longhorn Version:** 1.7.2
**Replicas per Volume:** 3 (one per node)
**Data Path:** `/var/lib/longhorn`
**Storage Nodes:** All 3 nodes (node-1, node-2, node-3)

### Persistent Volumes by Application

| Application | Size | Storage Class | Critical? |
|-------------|------|---------------|-----------|
| **Vault** (x3) | 10Gi each | longhorn | ✅ Yes |
| **SwimTO PostgreSQL** | 10Gi | longhorn | ✅ Yes |
| **Prometheus** | 8Gi | local-path | No |
| **Grafana** | 2Gi | local-path | No |
| **Pi-hole** | 2Gi | local-path | No |

### Migration Strategy

**What to Migrate to Longhorn:**

1. ✅ **Vault** - Secrets are critical, need HA
2. ✅ **SwimTO PostgreSQL** - Commercial app, business continuity
3. 🔄 **Canopy PostgreSQL** - When enabled, configure for Longhorn
4. ⏸️ **Journey PostgreSQL** - Low priority, configure when enabled

**What to Keep on local-path:**

- **Prometheus** - Time-series data is ephemeral, can be rebuilt
- **Grafana** - Dashboards are in git, not critical
- **Pi-hole** - Small config, easy to rebuild

### Longhorn Installation

Deployed via Flux HelmRelease:

```yaml
# clusters/eldertree/storage/longhorn/helmrelease.yaml
spec:
  values:
    persistence:
      defaultClassReplicaCount: 3
    defaultSettings:
      defaultDataPath: /var/lib/longhorn
```

### The Longhorn Journey (A Tale of Firewalls)

**January 10, 2026:** First attempt at Longhorn installation

**Problem 1:** Pods couldn't reach services across nodes
**Problem 2:** DNS resolution failing for Longhorn webhooks
**Problem 3:** CSI drivers not deploying

**Root Cause:** UFW firewall blocking cross-node pod communication!

```bash
# Flannel VXLAN uses UDP 8472
# Pod network: 10.42.0.0/16
# Service network: 10.43.0.0/16
# All were being silently dropped
```

**The Fix:**

```bash
# On ALL nodes
sudo ufw allow from 10.0.0.0/24 comment 'k3s internal network'
sudo ufw allow from 10.42.0.0/16 comment 'k3s pod network'
sudo ufw allow from 10.43.0.0/16 comment 'k3s service network'
sudo ufw allow 8472/udp comment 'k3s flannel VXLAN'
```

**Lesson:** Always check firewall rules when debugging networking. UFW can silently drop packets even when services appear to be listening!

### Backup Strategy

**Vault Secrets:**
```bash
./scripts/operations/backup-vault-secrets.sh > vault-backup-$(date +%Y%m%d).json
```

**Database Backups:**
- pg_dump for PostgreSQL databases
- Store backups on external storage (SanDisk SD card)

**Longhorn Snapshots:**
- Automatic snapshots configurable per volume
- Web UI at `longhorn.eldertree.local`

### High Availability Summary

With Longhorn, the cluster now has TRUE high availability:

| Component | HA Method | Failure Tolerance |
|-----------|-----------|-------------------|
| Control Plane | 3-node etcd | 1 node |
| API Access | kube-vip VIP | 1 node |
| **Storage** | **Longhorn 3 replicas** | **1 node** |
| Secrets | Vault Raft | 1 node |

**If ANY single node goes offline:**
- ✅ Cluster API remains accessible
- ✅ Storage data remains accessible
- ✅ Pods can reschedule to healthy nodes
- ✅ Longhorn rebuilds replicas when node returns

### Lessons Learned

- [x] Longhorn requires proper firewall configuration
- [x] 3-replica storage is essential for HA
- [x] Not all data needs distributed storage
- [x] Firewall debugging is frustrating but worth it
- [x] Always test failover before you need it
- [x] Document everything (especially firewall rules)

### Reference

- Longhorn HelmRelease: `clusters/eldertree/storage/longhorn/`
- Firewall fix: `docs/LONGHORN_FIX_2026-01-12.md`
- Storage assessment: `clusters/eldertree/storage/longhorn/STORAGE_MIGRATION_ASSESSMENT.md`

---
