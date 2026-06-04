---
title: "Chapter 23: The Tuesday Night When Everything Broke (And One Thing Worked Perfectly)"
date: 2026-06-03
author: Rafael Oliveira
tags: [kubernetes, automation, hardware-watchdog, homelab, war-stories]
description: "A story about phantom pods, missing images, a node that rebooted itself at the worst possible moment—and why that was actually the best thing that happened all night."
---

# Chapter 23: The Tuesday Night When Everything Broke (And One Thing Worked Perfectly)

It's 10 PM on a Tuesday. I type `kubectl get pods -A` and immediately regret my life choices.

```
ollie-core                0/1     ImagePullBackOff
ollie-ui                  0/1     ImagePullBackOff
ollie-training            0/1     ImagePullBackOff
svclb-pi-hole             0/7     Pending
```

This is fine. Everything is fine.

I'm in that special place every homelab owner knows—that moment when you realize your evening of "just checking on things" has turned into a full-blown incident response. My cluster is having a moment. Multiple moments, actually.

First, the phantom pods. Turns out I'd been confidently deploying images that... don't exist. `ollie-ui` and `ollie-training` were pulling from GHCR with the enthusiasm of someone who believes the images are real. They are not real. They were never built. I'd planned to build them, which in my mind was basically the same thing. Kubernetes disagreed.

Delete. Gone. Sometimes the best code is no code.

Then I notice node-3 has decided it's done with life. `SchedulingDisabled`. It's just sitting there, refusing to take any new work, like a server that's quietly quit but hasn't told management yet. `kubectl uncordon node-3.eldertree.local` and it's back, but I'm starting to see a pattern here.

The HelmRelease for Ollie is in what I can only describe as a philosophical crisis. It's not just failed—it's achieved `Stalled` status. The error? `spec.selector: Invalid value: field is immutable`. Translation: I changed my mind about some labels and Kubernetes is having none of it. The only fix is to delete everything and let FluxCD start over. This is fine. I'm fine.

While I'm cleaning up that mess, I realize the *actual* problem: the images I'm trying to deploy—`ollie-core:v0.4.0` and `ollie-frontend:v0.2.0`—don't exist either. I check GitHub Actions. The last build ran for **65 minutes** before timing out due to disk space issues.

Sixty. Five. Minutes. To build a Python FastAPI app.

I've had shorter relationships that were more successful.

And then, right in the middle of all this chaos, I see it:

```
LAST SEEN   TYPE     REASON    MESSAGE
67s         Warning  Rebooted  Node node-1.eldertree.local has been rebooted
```

My heart sinks. Node-1 just rebooted. In the middle of fixing everything else, node-1 decided to restart itself.

But then I look at the timestamps.

Node-1 hung at 22:54. Three minutes later—22:57—it rebooted. Exactly 15 seconds after it stopped responding.

That's not a bug. That's the hardware watchdog working *exactly* as designed.

---

Let me tell you about node-1.

Back in February—February 13th, to be specific—node-1 hung. The system was pingable, SSH responded, but Kubernetes was dead. Kubelet frozen. Services unresponsive. It was the computing equivalent of a coma.

I didn't notice for hours. When I finally checked, I had to physically go to the Pi, unplug it, and restart it. 

The next day, it happened again.

And again.

It took **four days** of this before I finally had time to dig into it properly. Four days of manual reboots, lost pods, and a cluster running on two nodes instead of three.

So in late May—just 8 days ago—I deployed a hardware watchdog. The BCM2835 watchdog with a 15-second timeout. If the system doesn't check in with the watchdog every 15 seconds, the watchdog forces a hardware reset. No questions asked. No waiting for services to respond. Just a hard reboot.

I added boot loop protection (max 5 consecutive reboots, so it doesn't reboot infinitely), hooked it into k3s health monitoring, integrated it with systemd. Two hours of work to build a safety net I hoped I'd never need.

Tonight was the third time it saved me.

Here's what happened:

At 22:54, while I was busy deleting phantom pods and fixing HelmReleases, node-1 hung. The system froze. Network still worked—I could ping it—but Kubernetes was gone. Kubelet stopped posting heartbeats.

Fifteen seconds later, the watchdog noticed. No check-in. No heartbeat. Just silence.

At 22:57, the watchdog triggered a forced reboot.

By 22:58, node-1 was back up. K3s started, rejoined the cluster, pods rescheduled.

**Total downtime: 3 minutes. Zero manual intervention. I didn't even notice until I reviewed the logs.**

Compare that to February: 4 days, 20 hours of downtime. Multiple manual reboots. Lost pods everywhere.

The watchdog didn't fix the *cause* of the hang. Node-1 still has issues. It's that one server in the cluster that just can't stay stable. But the watchdog turned a multi-day outage into a 3-minute blip that happened while I was busy with other things.

This is exactly what automation should be: fixing problems faster than you can notice them.

---

While all this was happening, I had an epiphany about those 65-minute Docker builds.

What if—and hear me out here—what if we cached the dependencies?

Revolutionary, I know.

Docker has this feature called "multi-stage builds" where you separate dependency installation from code copying. Install all the heavy Python packages in one stage, copy the application code in another stage. When the code changes (which is 99% of commits), Docker only rebuilds the second stage. The dependencies are cached until `poetry.lock` changes.

```dockerfile
# Stage 1: Builder (cached until dependencies change)
FROM python:3.11-slim AS builder
COPY pyproject.toml poetry.lock ./
RUN poetry install

# Stage 2: Runtime (rebuilds in seconds when code changes)
FROM python:3.11-slim
COPY --from=builder /app/.venv ./
COPY src/ ./
```

Code-only changes now build in 1-2 minutes instead of 65. That's a 97% improvement. 

Sometimes the best solutions come from pure rage and sleep deprivation.

---

By 11 PM, the dust settled. All three nodes were running. Critical services were up. The phantom pods were deleted, the real images were building (with the optimized Dockerfile), and the Pi-hole namespace was consistently named `pi-hole` instead of the schizophrenic mix of `pihole` and `pi-hole` it had been before.

I created three PRs:
- One to standardize the Pi-hole naming
- One to update Ollie to v0.4.5 with the now-existent images
- One to make Docker builds 97% faster

And then I sat back and thought about that watchdog.

The thing I deployed 8 days ago. The thing I built proactively, not in response to an immediate fire. The thing that just saved me tonight while I was busy with seven other issues.

**That's the goal, right?**

Build systems that detect problems faster than you can, fix them faster than you would, and let you focus on the interesting problems instead of the repetitive ones.

Node-1 will probably hang again in a few weeks. It's got issues. But thanks to that watchdog we deployed back in May, I won't lose four days to it. I won't lose four hours. I probably won't even notice.

The cluster will just... handle it.

And that's the real win here. Not the fixed pods or the optimized builds or the renamed namespaces. The win is automation that works so well you don't even realize it's working.

At 11:30 PM, I closed my laptop. Three hours of firefighting, seven issues fixed, three PRs created, and one moment of realizing that something I built two months ago just saved my evening.

Not bad for a Tuesday.

Node-1 is still that one dramatic server that hangs every few weeks. But now it's the dramatic server that *automatically recovers* every few weeks.

I can live with that.

---

**Next time**: Probably something else will break. It's always something.

But at least I'll have a watchdog watching my back.
