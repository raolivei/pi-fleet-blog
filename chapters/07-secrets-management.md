## Chapter 7: Secrets Management with Vault

### Why Vault?

**Decision:** HashiCorp Vault for secrets management

**Rationale:**

- [x] Industry-standard secrets management
- [x] Policy-based access control
- [x] Integration with Kubernetes
- [x] Audit capabilities
- [x] Support for multiple secret engines
- [x] High Availability with Raft consensus

### Deployment Journey

**Initial Setup:** Dev mode (no persistence)
**Migration 1:** Production mode with persistent storage
**Migration 2:** Full HA with Raft integrated storage *(January 2026)*

**Key Dates:**

- November 17, 2025: Initial deployment
- November 23, 2025: Migration to production mode with policies
- **January 13, 2026: Migration to HA mode with 3 replicas**

### Current Configuration (HA Mode)

- **Version:** v1.17.2
- **Mode:** High Availability with Raft
- **Replicas:** 3 (one per node)
- **Storage:** 10Gi per pod (local-path-nvme)
- **Storage Type:** Raft integrated storage
- **Failure Tolerance:** 1 node

### Why HA? The Final Piece of True High Availability

After achieving 3-node HA for the control plane, Vault in standalone mode was the last single point of failure. In standalone mode with local-path storage:

```
If node-1 fails → Vault PVC is pinned to node-1 → Vault goes down → 
All External Secrets stop syncing → Applications lose access to secrets
```

With Vault HA:

```
If ANY node fails → Raft elects new leader in <15 seconds → 
External Secrets continue syncing → Applications unaffected
```

### HA Architecture

| Pod | Node | Role |
|-----|------|------|
| vault-0 | node-3 | Leader or Standby |
| vault-1 | node-1 | Leader or Standby |
| vault-2 | node-2 | Leader or Standby |

**Raft Consensus:** All data is replicated across all 3 nodes. If the leader fails, a standby is automatically promoted.

### Policy-Based Access Control

**Approach:** Per-project policies for isolation

**Policies Created:**

- `canopy-policy` - Access to `secret/canopy/*`
- `swimto-policy` - Access to `secret/swimto/*`
- `journey-policy` - Access to `secret/journey/*`
- `nima-policy` - Access to `secret/nima/*`
- `us-law-severity-map-policy` - Access to `secret/us-law-severity-map/*`
- `monitoring-policy` - Access to `secret/monitoring/*`
- `infrastructure-policy` - Access to `secret/pi-fleet/*`
- `eso-readonly-policy` - Read-only for External Secrets Operator

**Benefits:**

- Least-privilege access
- Project isolation
- Prevents accidental cross-project access
- Better auditability

### External Secrets Operator

**Purpose:** Automatically sync secrets from Vault to Kubernetes
**Configuration:** ClusterSecretStore pointing to Vault
**Sync Frequency:** Every 24 hours (or on-demand)

### Unsealing Process

**Challenge:** Vault seals after each restart (all 3 pods in HA mode)

**Old Way (Standalone):** Manual unsealing, type 3 keys each time

**New Way (HA with Auto-Unseal):**
1. Unseal keys stored in K8s secret `vault-unseal-keys`
2. Run `./scripts/operations/unseal-vault.sh`
3. Script automatically unseals all 3 pods

**The Fun Part:** You need 3 of 5 keys. Not 2. Not 4. Exactly 3. Because math is important, apparently. But now you don't have to type them!

### HA Migration Summary

**What Changed:**

| Aspect | Before | After |
|--------|--------|-------|
| Mode | Standalone | HA with Raft |
| Replicas | 1 | 3 |
| Storage Class | local-path | local-path-nvme |
| Storage Backend | File | Raft (replicated) |
| Unseal | Manual 3 keys | Auto from K8s secret |
| Failure Tolerance | 0 nodes | 1 node |

**Migration Steps:**

1. Backup all secrets: `./scripts/operations/backup-vault-secrets.sh`
2. Update HelmRelease for HA mode
3. Delete old StatefulSet (local-path PVC was pinned to node-1)
4. Initialize new HA cluster: `./scripts/operations/init-vault-ha.sh`
5. Restore secrets from backup
6. Update External Secrets vault-token

**Downtime:** ~10-15 minutes during migration

### Failover Test Results

We deleted vault-0 (the leader) to test failover:

- ✅ New leader elected in <15 seconds (vault-1 took over)
- ✅ No data loss (Raft replication preserved all secrets)
- ✅ External Secrets continued syncing from new leader
- ✅ Cluster returned to healthy state after vault-0 recovery

### Backup Strategy

- Regular backups of all secrets: `./scripts/operations/backup-vault-secrets.sh`
- Unseal keys stored in K8s secret AND offline (password manager)
- Backup script outputs JSON with all secrets

### Lessons Learned

- [x] HA mode is essential for true high availability
- [x] Raft storage eliminates external distributed storage dependencies (Longhorn was removed)
- [x] Raft replication across all 3 nodes ensures secrets survive node failures
- [x] Auto-unseal from K8s secret saves time (but keep offline backup!)
- [x] Policy-based access is essential for multi-project setup
- [x] External Secrets Operator simplifies secret management
- [x] Test failover before you need it!

### Reference

- HelmRelease: `clusters/eldertree/secrets-management/vault/helmrelease.yaml`
- Init Script: `scripts/operations/init-vault-ha.sh`
- Unseal Script: `scripts/operations/unseal-vault.sh`
- Quick Reference: `docs/VAULT_QUICK_REFERENCE.md`

---
