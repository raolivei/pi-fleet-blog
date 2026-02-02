import { defineConfig } from "vitepress";
import { sidebar } from "./sidebar";

// Base path is always "/" since we use custom domain blog.eldertree.xyz
// The CNAME file in public/ tells GitHub Pages to serve from the custom domain
const base = "/";

export default defineConfig({
  base,
  title: "Building Eldertree",
  description: "A Journey in Self-Hosted Kubernetes - Comprehensive diary of building a production-ready Kubernetes cluster on Raspberry Pi hardware",
  cleanUrls: true,
  lastUpdated: true,
  
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "Building Eldertree" }],
    ["meta", { property: "og:title", content: "Building Eldertree: A Journey in Self-Hosted Kubernetes" }],
    ["meta", { property: "og:description", content: "A comprehensive diary of building a production-ready Kubernetes cluster on Raspberry Pi hardware" }],
  ],

  themeConfig: {
    logo: "/logo.svg",
    
    nav: [
      { text: "Home", link: "/" },
      { text: "Chapters", link: "/chapters/" },
      { text: "Infrastructure", link: "https://github.com/raolivei/pi-fleet" },
    ],

    sidebar: sidebar(),

    socialLinks: [
      { icon: "github", link: "https://github.com/raolivei/pi-fleet-blog" },
    ],

    editLink: {
      pattern: "https://github.com/raolivei/pi-fleet-blog/tree/main/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Built with ❤️ documenting the eldertree Kubernetes cluster journey",
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
    "**/README.md",
    "**/SETUP.md",
    "**/TROUBLESHOOTING.md",
    "**/DEPLOYMENT.md",
  ],
});

