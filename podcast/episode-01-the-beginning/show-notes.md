# Episode 1: The Beginning - Show Notes

**The vision behind the eldertree cluster**

## Episode Summary

The eldertree cluster didn't start as a grand plan — it began with a simple
need: run personal applications without depending on cloud providers. In this
episode, we explore the motivations behind self-hosting, the goals for the
cluster, the constraints of building on Raspberry Pi hardware, and how the
project evolved organically from a single Pi running Docker to a full
Kubernetes cluster.

## Timestamps

- **0:00** - Introduction
- **[TBD]** - Act 1: Why Self-Host?
- **[TBD]** - Act 2: Goals and Constraints
- **[TBD]** - Act 3: The Evolution
- **[TBD]** - The Name: Eldertree
- **[TBD]** - Lessons Learned
- **[TBD]** - Closing

## Key Takeaways

1. **Start simple** - Single node, basic setup, then grow. Don't build the final architecture on day one.
2. **Problems are learning opportunities** - 92 documented problems, each one teaching something valuable.
3. **Documentation is critical** - Without it, you repeat the same mistakes.
4. **Git history tells the story** - Commits document the journey better than memory.
5. **Iteration beats perfection** - Ship, learn, improve, repeat.

## Applications Mentioned

- **Canopy** - Personal finance dashboard ([canopy.eldertree.local](https://canopy.eldertree.local))
- **SwimTO** - Toronto pool schedules ([swimto.eldertree.xyz](https://swimto.eldertree.xyz))
- **Journey** - AI-powered career pathfinder
- **NIMA** - AI/ML learning project
- **US Law Severity Map** - Data visualization project

## Technology Stack Mentioned

- Raspberry Pi 5 (8GB RAM, ARM64)
- K3s (lightweight Kubernetes)
- FluxCD (GitOps)
- HashiCorp Vault (secrets management)
- Prometheus + Grafana (monitoring)
- Pi-hole (DNS)
- Terraform (Cloudflare DNS)

## Project Timeline

| Phase | Period | Focus |
|-------|--------|-------|
| Initial | October 2025 | First project on Pi, Docker containers |
| Infrastructure | November 2025 | K3s, Terraform, FluxCD |
| Services | Nov-Dec 2025 | Vault, monitoring, DNS, applications |
| Optimization | December 2025 | Bug fixes, resource tuning, documentation |

## Chapter Reference

- [Chapter 1: The Vision](../../chapters/01-vision.md)

## Topics Covered

self-hosting, raspberry pi, kubernetes, k3s, privacy, data ownership, ARM64, home lab, infrastructure, gitops

## Connect

- **GitHub Repository:** [raolivei/pi-fleet](https://github.com/raolivei/pi-fleet)
- **Blog:** [pi-fleet-blog](https://github.com/raolivei/pi-fleet-blog)

---

*Building Eldertree - Episode 1 of 10*
