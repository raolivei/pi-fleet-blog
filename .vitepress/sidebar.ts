export function sidebar() {
  return {
    "/": [
      {
        text: "Introduction",
        link: "/",
      },
    ],
    "/chapters/": [
      {
        text: "Chapters Overview",
        link: "/chapters/",
      },
      {
        text: "The Journey",
        items: [
          { text: "Chapter 1: The Vision", link: "/chapters/01-vision" },
          {
            text: "Chapter 2: Hardware Decisions",
            link: "/chapters/02-hardware-decisions",
          },
          {
            text: "Chapter 3: Operating System and Base Setup",
            link: "/chapters/03-os-base-setup",
          },
          {
            text: "Chapter 4: Kubernetes Choice - Why K3s",
            link: "/chapters/04-kubernetes-choice",
          },
          {
            text: "Chapter 5: Initial Cluster Setup",
            link: "/chapters/05-cluster-setup",
          },
          {
            text: "Chapter 6: Networking Architecture",
            link: "/chapters/06-networking-architecture",
          },
          {
            text: "Chapter 7: Secrets Management with Vault",
            link: "/chapters/07-secrets-management",
          },
          {
            text: "Chapter 8: DNS and Service Discovery",
            link: "/chapters/08-dns-service-discovery",
          },
          {
            text: "Chapter 9: Monitoring and Observability",
            link: "/chapters/09-monitoring-observability",
          },
          {
            text: "Chapter 10: GitOps with FluxCD",
            link: "/chapters/10-gitops-fluxcd",
          },
          {
            text: "Chapter 11: Deploying Applications",
            link: "/chapters/11-deploying-applications",
          },
          {
            text: "Chapter 12: Storage and Persistence",
            link: "/chapters/12-storage-persistence",
          },
          {
            text: "Chapter 13: Remote Access and Security",
            link: "/chapters/13-remote-access-security",
          },
          {
            text: "Chapter 14: Troubleshooting and Lessons Learned",
            link: "/chapters/14-troubleshooting",
          },
          {
            text: "Chapter 15: Future Plans and Scaling",
            link: "/chapters/15-future-plans-scaling",
          },
        ],
      },
      {
        text: "War Stories",
        items: [
          {
            text: "Chapter 16: The Great Deployment Disaster",
            link: "/chapters/16-the-great-deployment-disaster-of-2026",
          },
          {
            text: "Chapter 17: The Tailscale Treachery",
            link: "/chapters/17-the-tailscale-treachery",
          },
          {
            text: "Chapter 18: The CI/CD Consolidation",
            link: "/chapters/18-reusable-workflows",
          },
        ],
      },
    ],
  };
}
