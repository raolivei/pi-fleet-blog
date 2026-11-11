export function sidebar() {
  return {
    "/": [
      {
        text: "Introduction",
        link: "/",
      },
      {
        text: "Chapters",
        link: "/chapters/",
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
          {
            text: "Chapter 1: The Moment I Decided to Own My Infrastructure",
            link: "/chapters/01-the-moment-i-decided-to-own-my-infrastructure",
          },
          {
            text: "Chapter 2: First Boot",
            link: "/chapters/02-first-boot",
          },
          {
            text: "Chapter 3: Making Things Talk",
            link: "/chapters/03-making-things-talk",
          },
          {
            text: "Chapter 4: Keeping Secrets",
            link: "/chapters/04-keeping-secrets",
          },
          {
            text: "Chapter 5: Scaling Decisions, Not YAML",
            link: "/chapters/05-scaling-decisions-not-yaml",
          },
          {
            text: "Chapter 6: Running Real Apps",
            link: "/chapters/06-running-real-apps",
          },
          {
            text: "Chapter 7: Watching It All",
            link: "/chapters/07-watching-it-all",
          },
          {
            text: "Chapter 8: The Great Deployment Disaster",
            link: "/chapters/08-deployment-disaster",
          },
          {
            text: "Chapter 9: The Tailscale Treachery",
            link: "/chapters/09-tailscale-treachery",
          },
          {
            text: "Chapter 10: Building Ollie",
            link: "/chapters/10-building-ollie",
          },
          {
            text: "Chapter 14: The Ticket Was Real. The CI Failure Wasn't.",
            link: "/chapters/14-the-ticket-was-real",
          },
        ],
      },
      {
        text: "Interludes",
        items: [
          {
            text: "Why We Dropped Pi-hole for BIND9",
            link: "/chapters/interlude-why-we-dropped-pihole-for-bind9",
          },
        ],
      },
    ],
  };
}
