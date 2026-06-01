# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed

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
