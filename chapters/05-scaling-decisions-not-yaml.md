# Chapter 5: Scaling Decisions, Not YAML

There's a moment in every infrastructure journey when you realize you're solving the same problem for the third time. You open a file, scroll through some configuration, think "I've definitely done this before," and then spend twenty minutes hunting through other repos to find the version you wrote last month.

For me, that moment came in early 2026. I'd just spun up my fifth project on the cluster—SwimTO, OpenClaw, Pitanga, the docs site, monitoring—and each one had its own slightly different Docker build workflow. One used multi-platform builds. Another used arm64-only. A third had caching enabled. A fourth didn't. And when I needed to change something fundamental (like switching all builds to arm64-only for the Pi cluster), I had to edit seven different files.

This wasn't scaling. This was copy-paste hell with version control.

## The GitOps Foundation

Before we get to workflows, let's talk about GitOps. Because none of this automation matters if your deployment process is "SSH into the cluster and kubectl apply some stuff."

GitOps is a simple idea: **Git is the source of truth for your infrastructure**. Everything that runs in the cluster is defined in a Git repository. When you merge a PR, the cluster automatically reconciles to match. No manual kubectl commands. No "I'll just fix this real quick on production." If it's not in Git, it doesn't exist.

For Eldertree, the tool is FluxCD.

FluxCD watches the `pi-fleet` repository, specifically the `clusters/eldertree/` directory. Every 5 minutes, it checks for changes. If it finds any, it applies them. New HelmRelease? Deployed. Updated config? Rolled out. Deleted resource? Removed.

The directory structure looks like this:

```
clusters/eldertree/
├── core-infrastructure/
│   ├── cert-manager/
│   ├── issuers/
│   ├── kube-vip/
│   └── storage/
├── secrets-management/
│   ├── vault/
│   └── external-secrets/
├── dns-services/
│   ├── pihole/
│   ├── external-dns/
│   └── cloudflare-tunnel/
├── observability/
│   ├── keda/
│   └── monitoring-stack/
├── apps/
│   ├── swimto/
│   ├── openclaw/
│   ├── pitanga/
│   └── eldertree-docs/
└── kustomization.yaml
```

Each directory has a HelmRelease or Kustomization that defines the desired state. FluxCD ensures the cluster matches. It's declarative infrastructure: you describe what you want, not how to get there.

The first time I saw FluxCD reconcile a change—I updated a Helm values file, pushed to main, and watched the pod restart automatically five minutes later—I felt like I'd unlocked a superpower. No kubectl commands. No manual deployments. Just Git, commits, and a cluster that updates itself.

## The Copy-Paste Problem

GitOps solved deployment. But it didn't solve the workflow problem. Because while FluxCD made sure the cluster matched Git, I still had to maintain all the CI/CD pipelines that built the images Git references.

Here's what I had by January 2026:

- **8 repositories** with Docker build workflows
- **3 slightly different Python CI configurations**
- **2 Terraform PR workflows** that were almost identical
- Multiple static site deployments with minor variations

Every new project started with "copy a workflow from another repo and tweak it." Which worked fine until I needed to make a change across all of them.

When I decided to switch from multi-platform builds to arm64-only (because everything deploys to the Pi cluster, why waste time building amd64?), I had to update seven workflows. Seven PRs. Seven versions of the same change. That's when I knew: this doesn't scale.

## The Solution: Reusable Workflows

GitHub Actions has a feature called reusable workflows. Instead of copying the same workflow into every repo, you define it once in a central location and call it from other repos with a single reference.

I created a new repository: **github-workflows**. It holds all the reusable CI/CD patterns. Now, instead of maintaining dozens of workflow files, I maintain a handful of reusable workflows that every project references.

### The Workflows

After analyzing the patterns across all my repos, I identified eight core workflows:

**Docker Builds**
- `docker-build.yml` — The workhorse. Builds and pushes arm64 images to GHCR with automatic version extraction from a `VERSION` file, smart tagging (semver, branch, SHA), build cache, and job summaries.
- `docker-matrix.yml` — For multi-service projects like Ollie (5 services) or Canopy (2 services). Builds all services in parallel using a matrix strategy.

**CI Pipelines**
- `python-ci.yml` — Python testing with support for both Poetry and pip, Ruff linting, Mypy type checking, Pytest, and configurable inputs (skip what you don't need).
- `node-ci.yml` — Node.js CI with linting, testing, and optional build step.

**Deployment**
- `static-site-pages.yml` — Builds and deploys VitePress/static sites to GitHub Pages. The blog you're reading? Deployed with this.
- `terraform-pr.yml` and `terraform-apply.yml` — Terraform plan on PR with automatic comments, and manual apply trigger.
- `gitops-image-update.yml` — Updates Kubernetes manifests with new image tags and creates auto-merge PRs. The glue between CI and GitOps.

### The Transformation

Here's what a typical migration looked like.

**Before (94 lines):**
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, dev]
    tags: ["v*"]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Extract version
        id: version
        run: |
          if [[ "${{ github.ref }}" == refs/tags/* ]]; then
            echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/heads/main ]]; then
            echo "version=latest" >> $GITHUB_OUTPUT
          else
            echo "version=${GITHUB_REF#refs/heads/}-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
          fi
      
      # ... 70 more lines of Docker setup, QEMU, buildx, caching, pushing ...
```

**After (20 lines):**
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

That's it. One reference to the central workflow. All the logic—version extraction, tagging, caching, pushing—lives in the reusable workflow. If I need to change how builds work, I change it once. All projects get the update.

### Key Decisions

**ARM64 Only**

All Docker builds now target `linux/arm64` only. Why?
1. Everything deploys to the Pi cluster (arm64)
2. No more QEMU emulation slowness
3. Faster CI builds (30% faster without multi-arch)
4. Simpler configuration

If I ever need amd64 (spoiler: I won't), I can override the `platforms` input.

**Versioning Strategy**

The workflows repo uses tags:
- `@main` — Latest stable (what most repos use)
- `@v1` — Major version tag
- `@v1.0.0` — Specific version for pinning

Most projects use `@main` for automatic updates. Critical projects (like infrastructure) pin to a specific version for stability.

**Secrets Handling**

Reusable workflows require secrets to be explicitly passed. I standardized on:
- `REGISTRY_TOKEN` for Docker builds (usually `GITHUB_TOKEN`)
- Cloud provider secrets passed through for Terraform

## The Numbers

**Before:**
- ~1,500 lines of workflow YAML across 8 repos
- Changes required editing 7+ files
- Copy-paste drift (workflows slowly diverged)

**After:**
- ~200 lines in calling workflows
- ~1,000 lines in reusable workflows (maintained once)
- Changes require editing 1 file
- Zero drift (everyone uses the same workflow)

## The GitOps Loop

Here's how the whole system works end-to-end:

1. **I push code** to a project repo (e.g., SwimTO)
2. **GitHub Actions** runs the reusable Docker build workflow
3. **Image is built** (arm64-only, cached, versioned) and pushed to GHCR
4. **GitOps workflow** creates a PR in `pi-fleet` updating the image tag
5. **FluxCD** detects the change and reconciles the cluster
6. **New pods** roll out automatically

Zero manual steps. Push code, wait a few minutes, new version is live.

The first time this worked end-to-end—from code commit to production deployment without touching kubectl—I just sat back and watched the automation run. It felt like magic. But it's not magic. It's just good automation.

## What Didn't Get Migrated

Not everything needs to fit the pattern. Two repos stayed unique:

**pi-fleet** — The Terraform workflow is heavily customized for Cloudflare and Terraform Cloud integration. Trying to make it generic would have been wasted effort. Sometimes custom is the right choice.

**docker-pi-hole** — Forked repo with upstream-specific workflows. I don't control the workflow, and that's fine.

The lesson: don't fight to make everything uniform. Some things deserve custom workflows.

## The Lessons

Here's what I learned from consolidating CI/CD across a dozen projects:

**Start with the most common pattern.** I built `docker-build.yml` first because seven repos needed it. Quick wins build momentum.

**Keep workflows focused.** Each workflow does one thing well. Composition happens at the caller level. Don't build a mega-workflow that tries to handle every edge case.

**Inputs have sane defaults.** You shouldn't need to specify 10 parameters for a simple build. Most inputs have sensible defaults. Override only when needed.

**Not everything needs migration.** Some workflows are legitimately custom. Don't fight it.

**Multi-stage Dockerfiles are your friend.** Some repos needed Dockerfile changes to work with the reusable workflow. Multi-stage builds made them self-contained.

**Documentation matters.** The workflows repo has a README explaining each workflow, its inputs, and examples. Future me (and anyone else) can figure out how to use them.

## The Multiplier Effect

The beauty of this system is the multiplier effect. Every improvement to a reusable workflow benefits every project that uses it.

When I added build cache optimization to `docker-build.yml`, every project's builds got faster. When I added better error messages, every project's failures got clearer. When I fixed a bug in version extraction, every project's tags got more consistent.

One change, many benefits. That's scaling.

## The Meta Lesson

This chapter is really about a bigger idea: **scale decisions, not work**.

You can scale work: more repos, more PRs, more manual updates. But that doesn't scale well. You're the bottleneck. You have finite time.

Or you can scale decisions: figure out the right pattern once, encode it in automation, and let every project benefit. One decision, N applications. That's how you build a platform instead of a collection of projects.

GitOps scales deployment decisions. Reusable workflows scale CI/CD decisions. Helm charts scale configuration decisions. Ansible playbooks scale infrastructure decisions.

The best infrastructure isn't the most complex. It's the most reusable.

Now, when I start a new project, I don't copy workflows. I reference them. I don't write Kubernetes manifests from scratch. I use Helm. I don't manually deploy. I commit to Git and let FluxCD handle it.

The infrastructure is standardized. The patterns are proven. Future projects just plug in.

That's scaling.

---

*Next: [Chapter 6: Running Real Apps](/chapters/06-running-real-apps) - From Hello World to production applications that actually matter.*
