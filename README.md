# Building Eldertree

Narrative site for the Eldertree cluster journey — **https://blog.eldertree.xyz**

Written chapters, war stories, and the **Building Eldertree** podcast. Operational runbooks live on [docs.eldertree.xyz](https://docs.eldertree.xyz); live metrics on Grafana (LAN).

## Stack

- [VitePress](https://vitepress.dev/) 1.x
- Vue 3 home components (`ClusterGlance`, `FeaturedStories`)
- GitHub Pages + custom domain (`public/CNAME`)

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview  # http://localhost:4173
```

Optional data refresh (requires sibling repos `../pi-fleet`, `../eldertree-docs`):

```bash
node scripts/export-journey-stats.mjs
node scripts/sync-runbook-issues.mjs
```

## Structure

```
├── chapters/           # Main blog content
├── podcast/            # Episode scripts (index.md is published)
├── public/             # banner.svg, logo.svg, CNAME
├── data/cluster.ts     # Static cluster facts for home glance
└── .vitepress/         # Theme + config
```

## Deploy

Push to `main` triggers **Deploy Blog** (reusable workflow from `github-workflows`).
