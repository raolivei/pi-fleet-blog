## Chapter 11: Deploying Applications

### Application Portfolio

**Active Applications:**

1. **SwimTO** - Toronto pool schedules
2. **OpenClaw** - AI assistant (Telegram bot)
3. **Pitanga** - Pitanga LLC infrastructure
4. **Eldertree Docs** - Documentation site

**Disabled / Not Yet Deployed:**

- **Canopy** - Personal finance dashboard (commented out in kustomization)
- **Journey** - AI-powered career pathfinder (not deployed yet)
- **NIMA** - AI/ML learning project (not needed currently)

### Deployment Patterns

**Common Pattern:**

- Helm charts for each application
- External Secrets Operator for credentials (synced from Vault)
- Ingress resources for local access (`*.eldertree.local`)
- Cloudflare Tunnel for public access
- KEDA ScaledObjects for event-driven autoscaling

### Application-Specific Notes

#### SwimTO

- **Namespace:** `swimto`
- **Stack:** Frontend (port 3000), API (port 8000), PostgreSQL, Redis
- **Local Access:** https://swimto.eldertree.local
- **Public Access:** https://swimto.eldertree.xyz (via Cloudflare Tunnel)
- **Secrets:** Database credentials, API keys in Vault (`secret/swimto/*`)
- **Autoscaling:** KEDA ScaledObjects for API and frontend

#### OpenClaw

- **Namespace:** `openclaw`
- **Type:** AI assistant with Telegram bot integration
- **Local Access:** https://openclaw.eldertree.local
- **Telegram Bot:** `@eldertree_assistant_bot`
- **AI Provider:** Google Gemini 1.5 Flash
- **Features:** SwimTO integration, cluster monitoring, web search

#### Pitanga

- **Namespace:** `pitanga`
- **Public URLs:** https://pitanga.cloud, https://www.pitanga.cloud
- **Northway Signal:** https://northwaysignal.pitanga.cloud
- **TLS:** Cloudflare Origin Certificate

#### Eldertree Docs

- **Namespace:** `eldertree-docs`
- **Public Access:** https://docs.eldertree.xyz (GitHub Pages)
- **Local Access:** https://docs.eldertree.local

### CI/CD Integration

**GitHub Actions:** Automated builds and image publishing
**Container Registry:** GitHub Container Registry (ghcr.io)
**Image Tagging:** Based on branch/tag/PR
**Reusable Workflows:** Consolidated CI/CD across all applications (see Chapter 18)

### Autoscaling with KEDA

**KEDA** (Kubernetes Event-Driven Autoscaler) is deployed for event-driven autoscaling:

- ScaledObjects configured for SwimTO API and frontend
- Scales based on HTTP traffic and queue depth
- Prevents over-provisioning on resource-constrained Raspberry Pi nodes

### Lessons Learned

- Consistent deployment patterns simplify management
- External Secrets + Vault integration is seamless once configured
- Helm charts provide flexibility for per-app customization
- Resource limits are critical on 8GB Raspberry Pi nodes
- KEDA autoscaling prevents resource waste on low-traffic periods
- Cloudflare Tunnel eliminates the need for port forwarding

---

