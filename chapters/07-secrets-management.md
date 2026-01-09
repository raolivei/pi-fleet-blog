## Chapter 7: Secrets Management with Vault

### Why Vault?

**Decision:** HashiCorp Vault for secrets management

**Rationale:**

- [ ] Industry-standard secrets management
- [ ] Policy-based access control
- [ ] Integration with Kubernetes
- [ ] Audit capabilities
- [ ] Support for multiple secret engines

### Deployment Journey

**Initial Setup:** Dev mode (no persistence)
**Migration:** Production mode with persistent storage

**Key Dates:**

- November 17, 2025: Initial deployment
- November 23, 2025: Migration to production mode with policies

### Production Configuration

- **Version:** v1.17.2
- **Mode:** Production (with persistence)
- **Storage:** 10Gi persistent volume (local-path)
- **Storage Type:** file backend
- **HA:** Standalone mode (single node)

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

### Unsealing Process (The Part Everyone Forgets About)

**Challenge:** Vault seals after each restart (because of course it does)
**Reality:** Every time you restart the cluster, Vault decides to lock itself. It's like a bank vault that locks itself every time you close the door. Security? Yes. Convenience? Not so much.
**Solution:** Manual unsealing with 3 of 5 keys (because 1 key would be too easy)
**Automation:** `unseal-vault.sh` script (because typing commands is hard, and also because I forget things)
**The Fun Part:** You need 3 of 5 keys. Not 2. Not 4. Exactly 3. Because math is important, apparently.

### Backup Strategy

- Regular backups of all secrets
- Secure storage of unseal keys
- Backup script: `backup-vault-secrets.sh`

### Lessons Learned

- [ ] Production mode requires manual unsealing
- [ ] Policy-based access is essential for multi-project setup
- [ ] External Secrets Operator simplifies secret management
- [ ] Regular backups are critical
- [ ] Unseal keys must be stored securely

### Migration Notes

See: `docs/VAULT_MIGRATION.md` for complete migration guide

---
