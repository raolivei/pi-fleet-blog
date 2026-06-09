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
            text: "Chapter 2: Why We Dropped Pi-hole for BIND9",
            link: "/chapters/02-why-we-dropped-pihole-for-bind9",
          },
        ],
      },
    ],
  };
}
