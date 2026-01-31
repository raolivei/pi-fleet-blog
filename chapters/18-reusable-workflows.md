# Chapter 18: The Great CI/CD Consolidation

*Taming the workflow wilderness with reusable GitHub Actions*

## The Problem: Copy-Paste Hell

After months of building out the homelab, I noticed a pattern. Every time I created a new project, I'd copy a workflow from another repo, tweak it slightly, and move on. Soon I had:

- 8 repositories with Docker build workflows
- 3 slightly different Python CI configurations
- 2 Terraform PR workflows that were almost identical
- Multiple static site deployments with minor variations

When I needed to update something—like switching from multi-platform builds to arm64-only for the Pi cluster—I had to make the same change in 7 different places. This was unsustainable.

## The Solution: Centralized Reusable Workflows

GitHub Actions has a feature called [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) that lets you define a workflow once and call it from multiple repositories. Instead of copying YAML everywhere, you reference a single source of truth.

I created a new repository: **[github-workflows](https://github.com/raolivei/github-workflows)**

## The Workflows

After analyzing the patterns across all my repos, I identified 8 reusable workflows:

### Docker Builds

**`docker-build.yml`** - The workhorse. Builds and pushes arm64 Docker images to GHCR with:
- Automatic version extraction from `VERSION` file
- Smart tagging (semver, branch, SHA)
- GitHub Actions cache for faster builds
- Job summary with build details

**`docker-matrix.yml`** - For multi-service projects like ollie (5 services) and canopy (2 services). Builds all services in parallel using a matrix strategy.

### CI Pipelines

**`python-ci.yml`** - Python testing with:
- Support for both Poetry and pip
- Ruff linting
- Mypy type checking
- Pytest testing
- Configurable via inputs (skip what you don't need)

**`node-ci.yml`** - Node.js CI with linting, testing, and optional build step.

### Deployment

**`static-site-pages.yml`** - Builds and deploys VitePress/static sites to GitHub Pages. Used by the blog you're reading right now.

**`terraform-pr.yml`** and **`terraform-apply.yml`** - Terraform plan on PR with automatic comments showing the plan, and manual apply trigger.

**`gitops-image-update.yml`** - Updates Kubernetes manifests with new image tags and creates auto-merge PRs. The glue between CI and GitOps.

## The Migration

The migration was surprisingly smooth. Here's what a typical before/after looks like:

### Before (94 lines)

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, dev]
    tags: ["v*"]
  # ... 90 more lines of duplicated logic
```

### After (20 lines)

```yaml
name: Build and Push

on:
  push:
    branches: [main, dev]
    tags: ["v*"]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    uses: raolivei/github-workflows/.github/workflows/docker-build.yml@main
    with:
      image-name: pitanga-website
    secrets:
      REGISTRY_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Repos Migrated

| Repository | Workflows Used |
|------------|----------------|
| pitanga-website | docker-build |
| ollie | docker-matrix, python-ci |
| pi-fleet-blog | static-site-pages |
| eldertree-docs | static-site-pages, docker-build |
| canopy | docker-build (x2), python-ci, node-ci |
| us-law-severity-map | docker-build |

**Not migrated:**
- **pi-fleet** - Terraform workflow is heavily customized for Cloudflare/Terraform Cloud integration
- **docker-pi-hole** - Forked repo with upstream-specific workflows

## Key Decisions

### arm64 Only

All Docker builds now target `linux/arm64` only. Why?

1. Everything deploys to the Pi cluster (arm64)
2. No more QEMU emulation slowness
3. Faster CI builds
4. Simpler configuration

If I ever need amd64, I can override the `platforms` input.

### Versioning Strategy

The workflows repo uses tags:
- `@main` - Latest stable (what most repos use)
- `@v1` - Major version tag
- `@v1.0.0` - Specific version for pinning

### Secrets Handling

Reusable workflows require secrets to be explicitly passed. I standardized on:
- `REGISTRY_TOKEN` for Docker builds (usually `GITHUB_TOKEN`)
- Cloud provider secrets passed through for Terraform

## Lessons Learned

1. **Start with the most common pattern** - I built `docker-build.yml` first since 7 repos needed it. Quick wins build momentum.

2. **Keep workflows focused** - Each workflow does one thing well. Composition happens at the caller level.

3. **Inputs have sane defaults** - You shouldn't need to specify 10 parameters for a simple build. Most inputs have sensible defaults.

4. **Not everything needs migration** - pi-fleet's Terraform workflow is heavily customized. Fighting to make it generic would've been wasted effort.

5. **Multi-stage Dockerfiles are your friend** - Some repos (like pitanga-website) needed Dockerfile changes to work with the reusable workflow. Multi-stage builds made them self-contained.

## The Numbers

**Before:**
- ~1,500 lines of workflow YAML across 8 repos
- Changes required editing 7+ files

**After:**
- ~200 lines in calling workflows
- ~1,000 lines in reusable workflows (maintained once)
- Changes require editing 1 file

## What's Next

The infrastructure is now standardized. Future projects just need a 20-line workflow file that references the central repo. When I need to update build logic, I do it once.

The workspace conventions documentation has been updated to recommend reusable workflows for all new projects.

---

*The best infrastructure is the kind you don't have to think about. Reusable workflows aren't exciting, but they remove friction from the development loop. And in a homelab where I'm the only engineer, every bit of automation pays dividends.*
