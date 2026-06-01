import { defineConfig } from "vitepress";
import { sidebar } from "./sidebar";

// Base path is always "/" since we use custom domain blog.eldertree.xyz
// The CNAME file in public/ tells GitHub Pages to serve from the custom domain
const base = "/";

export default defineConfig({
  base,
  title: "Building Eldertree",
  description:
    "The documented journey of running a highly available K3s cluster on Raspberry Pi — chapters, war stories, and podcast.",
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ["link", { rel: "icon", href: "/logo.png", type: "image/png" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Building Eldertree" }],
    [
      "meta",
      {
        property: "og:title",
        content: "Building Eldertree — Raspberry Pi Kubernetes journey",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Chapters, war stories, and podcast — self-hosted K3s on Raspberry Pi 5.",
      },
    ],
    ["meta", { property: "og:image", content: "https://blog.eldertree.xyz/logo-full.png" }],
  ],

  themeConfig: {
    logo: "/logo.png",

    nav: [
      { text: "Home", link: "/" },
      { text: "Chapters", link: "/chapters/" },
      { text: "Podcast", link: "/podcast" },
      { text: "Runbook", link: "https://docs.eldertree.xyz/runbook/" },
      { text: "pi-fleet", link: "https://github.com/raolivei/pi-fleet" },
    ],

    sidebar: sidebar(),

    socialLinks: [
      { icon: "github", link: "https://github.com/raolivei" },
    ],

    editLink: {
      pattern: "https://github.com/raolivei/pi-fleet-blog/tree/main/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Building Eldertree — a self-hosted Kubernetes build diary",
      copyright: "Copyright © 2026 Rafael Oliveira",
    },
  },

  markdown: {
    image: {
      lazyLoading: true,
    },
  },

  ignoreDeadLinks: true,

  srcExclude: [
    "src/**",
    "**/content/**",
    "**/scripts/**",
    "podcast/episode-*/**",
    "podcast/cover-art/**",
    "podcast/README.md",
    "podcast/RECORDING_NOTES.md",
    "podcast/metadata.json",
    "**/README.md",
    "**/SETUP.md",
    "**/TROUBLESHOOTING.md",
    "**/DEPLOYMENT.md",
  ],
});
