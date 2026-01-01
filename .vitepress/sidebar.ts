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
          { text: "Chapter 5: Initial Cluster Setup", link: "/chapters/05-cluster-setup" },
        ],
      },
    ],
  };
}

