# Chapter 1: The Moment I Decided to Own My Infrastructure

It started with an AWS bill. Not a scary one — double digits that month — but I'd gotten into the habit of opening the billing console the way you poke a bruise. My personal finance dashboard was running there. So were a couple of half-finished side projects and a pile of experiments I kept meaning to clean up. None of it made money. All of it charged me rent.

What actually got under my skin wasn't the number, it was realizing I couldn't fully account for it. A bit of egress here, a storage tier there, a NAT gateway I'd spun up for some tutorial months earlier and never killed. My own data, sitting on hardware I'd never see, priced in a way I'd need a spreadsheet to predict.

So I asked a slightly dumb question: what if I just owned the thing?

Not "owned" in the marketing sense. Actual hardware I could unplug. Data that didn't leave the apartment unless I sent it somewhere on purpose. And, if I'm honest, a way to find out whether I could really run production infrastructure or whether I just knew enough to talk about it in an interview.

I started reading about Raspberry Pis that night.

## The math, and the part that wasn't math

The money case was easy to make on paper. Three Raspberry Pi 5s ran me around $600 with the boring accessories, roughly half a year of the cloud setup I was replacing, except I pay it once. The whole cluster idles at less than an old incandescent bulb used to pull. No metered anything, no surprise charge because a test box stayed up over a weekend.

But the money was mostly an excuse. What I wanted was to understand the entire stack instead of the slice of it I touched day to day.

You can read about Kubernetes for months and still not know it. Tutorials hand you clean problems with the answer printed at the bottom. They don't hand you the night DNS quietly stops resolving, every dashboard goes red, and you have no idea which of the seventeen moving parts is lying to you. That night teaches you more than the months did. I wanted more of those nights, on hardware that was mine, where the only person to escalate to was me.

There was a privacy piece too. My finance data is real — real balances, real transactions — and I'd never been comfortable with it living behind someone else's "industry-standard security practices." Same for anything users might eventually trust me with. Self-hosting doesn't make that automatically safer, but at least the trade-offs become mine to make.

## Why Raspberry Pi

Once I'd committed to self-hosting, the hardware question mostly answered itself: Pi 5, 8GB.

It isn't the fastest thing I could have bought. A used mini PC would have out-muscled it for similar money. But the Pi hit a balance I cared about more than raw speed: cheap enough that three of them didn't hurt, quiet and low-power enough to leave running on a shelf all year, and just constrained enough to keep me honest.

That last part mattered more than I expected. ARM64 means not every image just works. Sometimes there's no arm64 build and you go find one, or build it yourself, and somewhere in that you finally learn what's actually inside the container you've been shipping for a year. The 8GB ceiling does the same thing from the other side. You can't run everything, so you're forced to decide what's worth running and to set real resource limits. In the cloud, the fix for "it's slow" is "give it more." On a Pi, the fix is "go find out why."

## Why K3s

Three Pis did not need full upstream Kubernetes, and I had no interest in babysitting a control plane I'd hand-assembled. K3s was the obvious pick: Rancher's lightweight distribution, more or less built for hardware like this. One binary, ingress and a storage provisioner already wired in, embedded etcd so three nodes could do HA without a separate etcd cluster to feed and water.

It does make decisions for you. Traefik instead of NGINX, local-path storage out of the box, an embedded datastore instead of external etcd. For a three-node cluster in my living room those were the right defaults, and the few I outgrew I swapped later. (The storage one gets its own chapter, and it isn't a happy story.)

The thing that sold me is that K3s is real Kubernetes, not a teaching toy. It's CNCF-certified, same APIs, same `kubectl`, same debugging loop. Whatever I learned here would carry straight to a "serious" cluster. It's just tuned not to fall over on 8GB of RAM.

## What I thought I was building, versus what I built

There was no master plan. There was one question: could I run Canopy, my finance dashboard, on a cluster of Raspberry Pis?

Then that question had kids. Could I run more than one app? Could I survive a node dying? Could I deploy without SSHing in and pulling git by hand? Could I handle secrets like an adult instead of a `.env` file I was afraid to grep? Could I see what was actually happening, metrics and logs, the way I would in production? Could I reach the whole thing from outside without punching holes in my router?

Every answer raised the next question. "A few Docker containers" turned, fairly quietly, into a GitOps-managed Kubernetes platform with HA, Vault, monitoring, and a VPN. Which is roughly how every infrastructure project I've ever touched tends to go.

The apps were the point, though, not the cluster for its own sake:

- **Canopy** — personal finance, the reason any of this started; self-hosted because that data shouldn't live anywhere else.
- **SwimTO** — Toronto pool schedules, a public project I keep partly so I'm learning in the open.
- **Ollie** — a local-first assistant with a long memory.
- **Eldertree Docs** — the runbook, treated as infrastructure rather than a drawer full of notes.

Plus the usual graveyard of half-finished things in various states of done.

## The name

I called it Eldertree. I wanted something that sounded like it had been around a while and intended to stay: an old tree that holds up the patch of forest around it, takes the weather, and gets a little tougher each season. That was the job I was handing the cluster, to be the quiet foundation everything else gets to stand on. It also read better on a dashboard than `homelab-prod-01`.

## How it actually went

Six months on, the timeline turned out far less tidy than the goals were:

- **October 2025** — one Pi, one app (the US Law Severity Map). Barely a "cluster."
- **November 2025** — K3s, Terraform, FluxCD. The boring, load-bearing layer.
- **December 2025** — Vault, monitoring, DNS, and a long stretch of tightening screws.
- **January 2026** — three nodes for real HA, plus Tailscale so I could reach it from anywhere.
- **February 2026** — pulled Longhorn back out (too heavy for 8GB Pis) and finally centralized the CI/CD I'd been copy-pasting between repos.
- **March–June 2026** — production apps, the Control Center, and a few incidents I'd rather not relive but learned the most from.

None of that was planned in advance. Each piece showed up because the one before it broke or fell short, which I've come to think is just what building looks like when you're honest about it.

## What owning it taught me

A few things stuck.

Start small and let it grow. My instinct was to architect the full multi-node, HA, fully-monitored thing on day one. Good thing I didn't, or I'd have been debugging five abstractions at once instead of one. One node, then two, then the hard parts.

The breakages were the curriculum. I've got something north of 90 documented issues now, and nearly everything I actually understand traces back to one of them. The runbook at docs.eldertree.xyz is mostly just me refusing to solve the same problem twice.

Write it down or relive it. Every time I skipped the note, I paid for it later, usually at a worse hour.

And the big one: ownership is responsibility and freedom in the same package, and you don't get to keep only the half you like. When a node wedges itself at 3 a.m., there's nobody to page. It's me. But when I want to tear the network apart and rebuild it on a Tuesday out of pure curiosity, there's also nobody to ask. After a few months I stopped resenting the first part, because it's the price of the second.

## I'm not telling you to do this

To be clear, this isn't a pitch for self-hosting everything. The cloud is good at what it's good at: absorbing complexity you'd rather not think about, scaling past anything I can manage with three Pis, paying whole teams to worry about security and compliance so you don't have to. For most people, most of the time, that's the right call.

I just wanted the other side of the trade. I gave up effortless scale, managed databases, and anyone to call when it breaks. In return I got a real understanding of the stack, my data under my own roof, a bill that doesn't move, and the freedom to experiment without asking permission first. For what I was trying to learn, that was a deal worth making.

## Where this goes

This is Chapter 1 because it's the start, not the summary. The cluster is up. The apps are running. GitOps and monitoring work. The question just changed shape, from "can I build this?" to "how far can I push it before it pushes back?"

The rest of this blog is that: the decisions, the war stories, the late nights, the times automation quietly saved me, and the times I was elbow-deep in `journalctl` trying to work out why a node wouldn't come back.

---

*Next: [Chapter 2: First Boot](/chapters/02-first-boot) — the first time I ran `kubectl get nodes` and watched all three come up ready.*
