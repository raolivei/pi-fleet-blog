# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- **Eldertree Control Center** on the home page — Vue components for cluster topology, runbook explorer, journey highlights, and documentation pillars.
- `data/cluster.ts` static cluster manifest (VIPs, nodes, stack, storage).
- `scripts/sync-runbook-issues.mjs` and `scripts/export-journey-stats.mjs` with CI-safe fallback when sibling repos are absent.
- Generated `data/runbook-issues.json` and `data/journey-stats.json` (refresh via `npm run presync`).

### Changed

- Home page stats grid replaced by interactive control center; duplicate infrastructure table removed.
