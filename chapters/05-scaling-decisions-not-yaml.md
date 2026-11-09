# Chapter 5: Scaling Decisions, Not YAML

By January 2026 I had a tell: I'd open a new repo, create `.github/workflows/build-and-push.yml`, and then go hunting through four other repos trying to remember which one had the version of that file I actually liked. Not the oldest one. Not the one with the bug in the tag logic. The good one.

That's how it goes when you bootstrap every project by copying the last project. Each repo had a Docker build workflow that was 90% the same as the others and 10% quietly different — this one built multi-platform, that one was arm64-only, one had the build cache wired up and one had it commented out with a `# TODO: fix` I'd written months earlier and never looked at again.

It worked fine until I wanted to change something everywhere at once. I'd decided to stop building amd64 images — everything on Eldertree is arm64, so every multi-platform build was spending real minutes producing an artifact that nothing would ever pull. Simple decision, thirty seconds to make. Then seven repos, seven branches, seven PRs, seven reviews of a diff I'd already read six times.

The decision was cheap. Applying it was the expensive part. That ratio is the whole chapter.

## Git as the source of truth

Before the CI side makes sense, the deploy side has to: Eldertree is GitOps, which means nothing reaches the cluster except through Git. No `kubectl apply` from my laptop. No "I'll just patch this one thing on the live deployment and fix it properly later," which is a sentence that has never once been followed by fixing it properly later.

FluxCD runs in-cluster and watches the `pi-fleet` repo. It checks the Git source every minute and reconciles the `clusters/eldertree/` path every ten, with pruning on — so a resource I delete from Git gets deleted from the cluster, not orphaned there forever haunting `kubectl get all`. Everything under that path is a Kustomization or HelmRelease describing what should exist: `core-infrastructure/` for cert-manager and issuers, `secrets-management/` for Vault and External Secrets, `dns-services/` for BIND, external-dns, and the Cloudflare Tunnel, `observability/` and `monitoring/` for the metrics stack, `arc-controller/` and `arc-runners/` for the self-hosted GitHub runners, then one directory per app.

The first time I watched it work — edited a Helm values file, pushed, walked away, came back to a pod running the new config — the appeal wasn't the automation. It was that I no longer had to remember what I'd done to the cluster. The repo remembers. If the cluster disagrees with the repo, the cluster is wrong and Flux fixes it.

But Flux only governs what's *in* the cluster. It had nothing to say about the eight copies of the pipeline that built the images the cluster was running.

## One workflow, many callers

GitHub Actions has reusable workflows: define a workflow once with `workflow_call`, reference it from another repo with a `uses:` line, pass inputs. I'd known about the feature for a while in the way you know about a feature you haven't needed yet.

So I made a repo called `github-workflows` and moved the Docker build into it. `docker-build.yml` is about 300 lines now — version extraction from a `VERSION` file, semver and branch and SHA tagging, `dev-<timestamp>-<sha>` tags off the dev branch, build cache, an optional annotated git tag after a successful push, a job summary so I can see what got built without reading logs. It's more thorough than any of the copies it replaced, because thoroughness is affordable when you only write it once.

The callers got boring, which is the point. Pitanga's entire build pipeline:

```yaml
jobs:
  build:
    uses: raolivei/github-workflows/.github/workflows/docker-build.yml@main
    with:
      image-name: pitanga-website
    secrets:
      REGISTRY_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Twenty-six lines with the triggers, permissions, and concurrency group included. Around fifteen repos call that one workflow today — SwimTO, Canopy, Ollie, Elder, Journey, the websites, the repo template new projects get cloned from.

Two defaults do most of the work. `platforms` defaults to `linux/arm64`, so the decision I'd wanted to roll out across seven repos is now just what happens unless a caller says otherwise. And `runs-on` defaults to the self-hosted ARC runners on the cluster, which are arm64 hardware — so arm64 images build natively instead of under QEMU emulation. The cluster builds the images the cluster runs.

Alongside it: `python-ci.yml` (Ruff, mypy, pytest, Poetry or pip), `static-site-pages.yml` (which deploys this blog), and `version-check.yml`, which fails a PR that changes code without bumping `VERSION`. That last one exists because I kept forgetting, and a lint rule is cheaper than discipline.

## I built too many of them

I originally wrote eight. Three of them nobody ever called.

`docker-matrix.yml` was for multi-service repos like Ollie and Canopy, and it turned out to be a worse version of a job matrix in the caller — four lines of `strategy: matrix:` next to the existing `uses:` does the same thing with nothing new to learn. `node-ci.yml` never got adopted; the JavaScript projects here are mostly static sites whose build step is already handled by `static-site-pages.yml`. `terraform-pr.yml` and `terraform-apply.yml` were abstracted out of pi-fleet's Terraform pipeline, which is the only Terraform pipeline I have — generalizing a sample size of one is just moving code to a worse address. And `gitops-image-update.yml` was going to open a PR against `pi-fleet` with each new image tag, until I found out Flux does this itself: an `ImageRepository` watching the registry, an `ImagePolicy` picking the tag, and an `ImageUpdateAutomation` committing the new tag straight back into Git. OpenClaw, Elder, and Bolao update that way now. No glue workflow required.

So I deleted all five. The commit is called `chore: remove unused reusable workflows`, which undersells it — writing a shared abstraction for a pattern you have exactly one instance of is the easiest mistake in this whole genre, and I made it three times in one afternoon. The surviving four earned their place by having callers.

pi-fleet's own Terraform workflow and the `docker-pi-hole` fork stayed custom and will stay custom. One is genuinely one-of-a-kind, the other is somebody else's repo. Uniformity is a means, not a score.

## The multiplier

The part I didn't expect was how the incentives changed.

When the build logic lived in fifteen places, improving it meant fifteen PRs, so I didn't improve it. I'd think "the cache config here is wrong" and then think about the fifteen PRs and decide it was fine, actually. Now the same fix is one PR in one repo and every project picks it up on its next build. Better cache behavior, clearer failure output, a tag-extraction bug I'd been working around in two repos — all of it landed once and applied everywhere, and I only bothered because it was one PR instead of fifteen.

Most repos track `@main` and take updates automatically, which is a real tradeoff: a bad push to `github-workflows` breaks everyone's builds at once. The mitigation is small — `actionlint` runs on every PR to that repo, and anything I actually need frozen gets pinned to a commit SHA — but the risk is genuinely there. Centralizing failure is the cost of centralizing fixes. I've decided a blast radius I can repair in one commit beats drift I'd have to go find.

Which is the thing I'd tell myself a year ago. You can scale the work — more repos, more PRs, more copies of a file you have to keep in sync by hand — but you're the bottleneck and you don't scale. Or you can scale the decisions: make the call once, encode it somewhere every project reads, and let the next fifteen projects inherit it for free. Flux does that for deployments. Reusable workflows do it for CI. Helm does it for configuration, Ansible does it for the nodes.

Starting a new project now mostly means picking a name. The pipeline comes with it.

---

*Next: [Chapter 6: Running Real Apps](/chapters/06-running-real-apps) — what changed when the cluster started hosting things other people actually used.*
