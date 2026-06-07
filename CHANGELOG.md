# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed

- **Home page (LinkedIn launch)** — Hero copy matches Chapter 1 pitch; featured cards lead with Ch.1 + Ch.18 chapter links; cluster glance uses public `control.eldertree.xyz` API for live node badges; Control Center public URL in ops links; refresh `cluster-status.json` fallback.
- **Nav cleanup** — Remove archived technical chapters (01–20) from sidebar; only the new story-driven series is listed. Legacy deep links (e.g. Ch.18) stay published but out of sidebar.

### Fixed

- **Legacy deep link** — Republish `/chapters/18-reusable-workflows` (not in sidebar) so LinkedIn and other shared URLs keep working after the nav cleanup.
- **Deploy workflow queued forever** — `build` used `self-hosted` but the only ARC scale set (`ollie-eldertree`) registers runners for `raolivei/ollie` only. Build on `ubuntu-latest` instead (VitePress static site; cluster-status sync no-ops without kubectl on GHA).

### Added

- **Live cluster glance:** node STABLE/UNSTABLE badges refresh at runtime from `https://elder.eldertree.local/api/public/cluster/nodes`, then `/cluster-status.json`, with static fallback from [`data/cluster.ts`](data/cluster.ts). Optional refresh: [`scripts/sync-cluster-status.sh`](scripts/sync-cluster-status.sh) (kubectl).

### Changed

- **Cluster at a glance:** link to Eldertree Control Center (`control.eldertree.local`, LAN/Tailscale) in the ops links row.
- **Deploy workflow:** optional `scripts/sync-cluster-status.sh` pre-build step (no-op in GHA when kubectl/cluster unavailable; uses committed `public/cluster-status.json`).
- **Home hero typography:** [Fraunces](https://fonts.google.com/specimen/Fraunces) display for the title, [DM Sans](https://fonts.google.com/specimen/DM+Sans) for the “Build diary” eyebrow (body unchanged).
- **Eldertree logo:** official artwork ([`assets/logo-source.png`](assets/logo-source.png)) recolored to blog teal via [`scripts/recolor-logo.py`](scripts/recolor-logo.py); flood-fill removes white canvas/halos; brighter ramp for dark UI; [`public/logo-full.png`](public/logo-full.png) (home), [`public/logo.png`](public/logo.png) (nav/favicon).
- **Home spacing:** more horizontal padding on the custom home layout so hero copy is not flush with the viewport edge.
- **Home layout:** replaced VitePress default hero + blurred `banner.svg` with custom `HomePage.vue` (compact header, crisp logo, no side-by-side banner).
- User-facing copy no longer refers to the GitHub repository by internal repo name.

## [Previous]

### Added (2026-06)

### Added

- Narrative-first home page: **Start here** cards, **Cluster at a glance**, **Featured stories**.
- [`podcast/index.md`](podcast/index.md) — audio series landing page.
- New [`public/banner.svg`](public/banner.svg) aligned with [`logo.svg`](public/logo.svg) (tree + three HA nodes, brand teal).

### Changed

- Blog identity repositioned as **build diary** (chapters, war stories, podcast); ops links out to docs and Grafana.
- Replaced Eldertree Control Center with slim `ClusterGlance` + `FeaturedStories` components.
- Site title, hero copy, nav (Podcast, Runbook), footer, and OG metadata updated for narrative positioning.

### Removed

- Home-page runbook browser, docs pillars grid, and git-heuristic stat dashboard.
- `presync` from default `dev`/`build` (optional scripts remain for data refresh).
