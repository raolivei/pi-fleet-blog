## Chapter 11: Deploying Applications

### Application Portfolio

**Deployed Applications:**

1. **Canopy** - Personal finance dashboard
2. **SwimTO** - Toronto pool schedules
3. **Journey** - AI-powered career pathfinder
4. **NIMA** - AI/ML learning project
5. **US Law Severity Map** - Law visualization
6. **Ollie** - Local AI with memory (planned/in progress)

### Deployment Patterns

**Common Pattern:**

- Helm charts for each application
- External Secrets for credentials
- Ingress resources for external access
- Persistent volumes for data

### Application-Specific Notes

#### Canopy

- **Database:** PostgreSQL
- **Storage:** Persistent volume for database
- **Secrets:** Database password, app secret key
- **Access:** https://canopy.eldertree.local

#### SwimTO

- **Database:** PostgreSQL
- **Cache:** Redis
- **API Keys:** OpenAI, Leonardo.ai
- **OAuth:** Google OAuth
- **Access:** https://swimto.eldertree.local

#### Journey

- **Database:** PostgreSQL
- **Access:** [Document access URL]

#### NIMA

- **Status:** [Document status]
- **Access:** [Document access URL]

### CI/CD Integration

**GitHub Actions:** Automated builds and image publishing
**Container Registry:** GitHub Container Registry (ghcr.io)
**Image Tagging:** Based on branch/tag/PR

### Lessons Learned

- [ ] Consistent deployment patterns simplify management
- [ ] External Secrets integration is seamless
- [ ] Helm charts provide flexibility
- [ ] Resource limits are critical on Raspberry Pi

---

