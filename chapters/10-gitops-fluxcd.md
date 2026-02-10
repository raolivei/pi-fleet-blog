## Chapter 10: GitOps with FluxCD

### Why GitOps?

**Decision:** FluxCD for GitOps workflows

**Rationale:**

- [ ] Infrastructure as Code
- [ ] Version-controlled deployments
- [ ] Automated synchronization
- [ ] Rollback capabilities
- [ ] Multi-environment support

### Bootstrap Process

**Method:** Ansible playbook (`bootstrap-flux.yml`)
**Repository:** `https://github.com/raolivei/pi-fleet`
**Branch:** `main`
**Path:** `clusters/eldertree/`

### Repository Structure

```
clusters/eldertree/
├── core-infrastructure/
│   ├── cert-manager/
│   ├── issuers/
│   ├── kube-vip/
│   └── storage/
├── secrets-management/
│   ├── vault/
│   └── external-secrets/
├── dns-services/
│   ├── pihole/
│   ├── external-dns/
│   └── cloudflare-tunnel/
├── observability/
│   ├── keda/
│   └── monitoring-stack/
├── apps/
│   ├── swimto/
│   ├── openclaw/
│   ├── pitanga/
│   └── eldertree-docs/
└── kustomization.yaml
```

### Helm Releases

**Management:** FluxCD HelmRelease resources
**Charts:** Custom charts in `helm/` directory
**Values:** Managed via Git

### Sync Process

- **Frequency:** Continuous (every 5 minutes)
- **Reconciliation:** Automatic
- **Notifications:** [If configured]

### Benefits Realized

- [ ] All infrastructure changes tracked in Git
- [ ] Easy rollbacks via Git revert
- [ ] Consistent deployments
- [ ] Reduced manual errors

### Lessons Learned

- [ ] GitOps requires discipline in Git workflow
- [ ] Clear directory structure is essential
- [ ] Helm charts simplify application management
- [ ] FluxCD reconciliation is reliable

---
