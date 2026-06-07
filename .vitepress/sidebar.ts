export function sidebar() {
  return {
    "/": [
      {
        text: "Introduction",
        link: "/",
      },
      {
        text: "Podcast",
        link: "/podcast",
      },
    ],
    "/podcast": [
      {
        text: "Audio series",
        link: "/podcast",
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
        ],
      },
    ],
  };
}
