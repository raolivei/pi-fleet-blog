# Building Eldertree

Narrative site for the Eldertree cluster journey — **https://blog.eldertree.xyz**

Written chapters and war stories from the Eldertree build diary. Operational runbooks live on [docs.eldertree.xyz](https://docs.eldertree.xyz); live metrics on [Grafana](https://grafana.eldertree.xyz/) (sign-in required).

## Stack

- [VitePress](https://vitepress.dev/) 1.x
- "Ops Console" theme (#67): `StatusBar`, `ChapterLog`, `ChapterMeta`, `RecordPanel`, with the chapter index built from frontmatter by `.vitepress/theme/chapters.data.ts`
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
├── .archive/           # Archived chapters + draft podcast (not published)
├── public/             # banner.svg, logo.svg, CNAME
├── data/cluster.ts     # Static cluster facts for home glance
└── .vitepress/         # Theme + config
```

## Deploy

Push to `main` triggers **Deploy Blog** (reusable workflow from `github-workflows`).


## Publication verification

After deployment, the workflow checks `publication.json` against the triggering commit, then checks Chapters 7 and 14 for article headings, unique sharing metadata, social image availability and ecosystem links. It retries briefly for propagation and fails if an older deployment is still served. A successful check enables human review of the launch copy; it does not publish to LinkedIn or confirm LinkedIn has refreshed its cached preview.

To check a release manually:

```bash
node scripts/verify-publication.mjs --expected-revision <full-commit-sha>
```

The launch-page list lives in that script. Add future promoted articles when their metadata and publication path are ready. This supplements editorial review and does not check every external source link or authenticated dashboard.
