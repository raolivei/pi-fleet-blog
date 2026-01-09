## Chapter 12: Storage and Persistence

### Storage Classes

**Default:** `local-path` (built into K3s)
**Type:** Local filesystem storage
**Limitations:** Single node, no replication

### Persistent Volumes

**Applications Using PVs:**

- Prometheus (8Gi)
- Vault (10Gi)
- [Add other applications]

### Backup Strategy

**Current Approach:** [Document your backup strategy]

- [ ] Vault secrets backup
- [ ] Database backups
- [ ] Configuration backups

### Future Considerations

- [ ] Longhorn for multi-node storage
- [ ] NFS for shared storage
- [ ] External storage solutions

### Lessons Learned

- [ ] local-path sufficient for single-node
- [ ] Persistent volumes essential for stateful apps
- [ ] Backup strategy must be planned early
- [ ] Storage performance can be a bottleneck

---

