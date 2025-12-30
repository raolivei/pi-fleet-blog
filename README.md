# Eldertree Blog

A comprehensive blog documenting the journey of building the **eldertree** Kubernetes cluster on Raspberry Pi hardware.

## About

This blog chronicles the complete journey from initial concept to a production-ready Kubernetes infrastructure, including:

- Hardware decisions and setup
- Kubernetes cluster configuration (K3s)
- Networking and DNS architecture
- Secrets management with Vault
- Monitoring and observability
- Application deployments
- Troubleshooting and lessons learned

**Current Status:** ~27% complete (Introduction + 4 chapters)

## Project Structure

```
pi-fleet-blog/
├── content/              # Blog content (Markdown files)
│   ├── BLOG.md          # Main blog content
│   └── BLOG_*.md        # Supporting guides
├── public/               # Static assets
│   └── content/         # Blog markdown (copied for serving)
│       └── BLOG.md
├── src/                  # Source files for the blog site
│   ├── index.html       # Main HTML
│   ├── main.js          # JavaScript entry point
│   └── styles.css       # Styles
├── dist/                 # Build output (generated)
├── .github/              # GitHub workflows
│   └── workflows/
│       └── deploy.yml   # Auto-deploy to GitHub Pages
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── SETUP.md             # Setup instructions
└── README.md            # This file
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content

The blog content is in `content/BLOG.md`. This is a comprehensive Markdown document with:

- **Introduction** - Overview and statistics
- **15 Chapters** covering the complete journey
- **Appendix** - Reference materials

### Current Chapters

✅ **Completed:**
- Introduction
- Chapter 1: The Vision
- Chapter 5: Initial Cluster Setup
- Chapter 8: DNS and Service Discovery
- Chapter 14: Troubleshooting and Lessons Learned

📝 **In Progress:**
- 11 chapters remaining

## Publishing

The blog can be published to:

- **GitHub Pages** - Static site hosting
- **Netlify** - Automatic deployments
- **Vercel** - Fast static hosting
- **Any static host** - The build output is static HTML/CSS/JS

### GitHub Pages Deployment

```bash
# Build the site
npm run build

# Deploy to GitHub Pages (using gh-pages)
npm install -g gh-pages
gh-pages -d dist
```

## Related Projects

- **[pi-fleet](https://github.com/raolivei/pi-fleet)** - The Kubernetes cluster infrastructure
- **Analysis Tools** - Git history analysis scripts in pi-fleet repository

## License

MIT

---

**Last Updated:** 2025-12-30
