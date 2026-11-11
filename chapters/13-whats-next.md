# Chapter 13: What's Next

I first drafted this chapter in June 2026, about seven months after the first Eldertree setup. I was trying to take stock: three Raspberry Pis, applications, deployment automation, monitoring, and a growing collection of notes about what had broken.

By November, the incidents had made the next priorities more specific. I had tools for deployment, monitoring, and recovery. I also had examples of why their presence wasn't enough: a watchdog that hadn't restarted a hung node, a logging setting that hadn't produced the expected logs, and applications whose desired configuration differed from their running state.

The work is still worth writing about. It just needs a less convenient ending.

## What I would keep

I would keep the infrastructure in code. Ansible gives me a repeatable way to configure the nodes. Flux reconciles Kubernetes resources from Git. The shared charts and workflows save me from rebuilding the same deployment setup for each application.

They also leave a record I can inspect when my memory is wrong. A commit can tell me when a setting entered the repository. A PR can preserve the reason for it and the checks performed. Neither establishes that every machine received the change, but both give the investigation somewhere to start.

I would keep the division between tools. Traefik handles ingress. BIND9 now provides the LAN DNS service that earlier chapters describe using Pi-hole. Vault and External Secrets handle secret storage and synchronization. Prometheus, [Grafana](https://grafana.eldertree.xyz/), and the logging stack let me investigate behavior over time. KEDA has configured scaling rules for particular workloads; it doesn't remove the need to understand their resource use.

The Control Center gives me another view of that system. Its first tracked SPA implementation arrived on June 1. The [operating guide added that day](https://github.com/raolivei/pi-fleet/blob/c60db92/docs/CONTROL_CENTER.md) describes the node and workload view, with links into the tools I use to investigate further.

That view is useful because it reduces the work of finding the next question. A Ready node or a healthy-looking workload still doesn't establish that a request can travel through every dependency and reach the user. I need to check that path too.

And I would keep writing things down. The shared notes behind Ollie help carry conventions and project context between sessions. The retrieval service helps find supporting documents. GitHub Issues hold investigations and unfinished work that need an outcome. Those jobs overlap, but each has a reason to exist.

## The distinctions I want to keep making

The first is between a configuration and its effect.

In May, setting up the watchdog involved checking more than whether the daemon was running. It needed to own the hardware device. Later, the logging investigation showed that setting `Storage=persistent` hadn't been enough either: an OS override prevented the intended result. The effective configuration and the stored journal mattered more than the line I'd written.

The same applies to secrets. Vault is the source of truth, and External Secrets synchronizes values into Kubernetes Secrets for applications to consume. Some applications receive those values through environment-variable references. Saying that secrets must never appear in environment variables would misdescribe my own setup. The important distinction is between putting a value directly into source code or a manifest and referencing a Secret at runtime. That delivery method still needs appropriate care; using Vault doesn't make every access boundary correct automatically.

The second distinction is between having deployed something and having it running now.

Canopy is a good example. It wasn't simply “coming soon” throughout this period. Its [public routing work was committed in February](https://github.com/raolivei/pi-fleet/commit/31aa2de01666b702e2b043a4e9728d9afb454300), and there was further [Flux deployment work in June](https://github.com/raolivei/pi-fleet/commit/e2026db9e523cc27e85611f34c671267535b3a21). At the November review, its API, frontend, and Redis Deployments existed but were scaled to zero, while PostgreSQL was Ready.

Those observations describe different states. Deployment manifests don't prove that an application was continuously available. Scaled-down Deployments don't mean it was never deployed. I also can't infer from that state alone that resource pressure was the reason.

The third distinction is between a useful mitigation and a guarantee.

Three control-plane and etcd members give the cluster redundancy. They still share dependencies, including power and networking. The September incident affected all three nodes and led to the watchdog being disabled during investigation. That belongs alongside the May hardening story. Leaving it out would make the platform look simpler and more dependable than the record supports.

## The next work I want to earn

I want recovery to be something I can demonstrate for a defined failure, rather than infer from the presence of backups and automation.

A useful recovery exercise needs a scope: which data, which services, which surviving hardware, and which checks establish that the result works. It also needs a record of what happened. Until I have that, a recovery-time estimate is a target, not an achievement. I don't want a timed claim in the blog to substitute for a restore test.

I want deployment verification to be more consistent too. A merged PR establishes what reached a branch. A published image establishes what became available to deploy. The running version and its observed behavior answer later questions. Keeping those steps visible makes an issue more useful to the next person—or assistant—who picks it up.

For Canopy, that means starting from its actual deployment and data state before deciding what to run next. It means checking the application, migrations, dependencies, and resource needs together. Autoscaling can be part of the answer, but it can't make those decisions for me.

For the cluster, I want to investigate shared failure modes as carefully as individual services. Adding another replica doesn't help if both copies depend on the same unavailable resource. Another node could add capacity, but a fourth control-plane member wouldn't increase the number of failures a three-member etcd cluster can tolerate: [both tolerate one unavailable member](https://etcd.io/docs/v3.6/faq/#what-is-failure-tolerance). Capacity and quorum are separate reasons to change the hardware.

Security work needs the same specificity. Policies, credentials, application access, and network reachability each need verification at the layer they control. Adding another tool is useful only when it addresses a defined problem and I can check the result.

There are still experiments I'd like to explore, including voice interaction for Ollie. I can keep those as experiments without putting them on the critical path for making the existing services dependable.

## A platform I can use and question

The goal is still to run applications on infrastructure I understand well enough to operate. That includes being able to explain why it works, where it has failed, and what I haven't demonstrated yet.

The [Control Center](https://control.eldertree.xyz/) is a starting point for current status. The [runbook](https://docs.eldertree.xyz/) holds procedures. This blog holds the decisions and investigations behind them. I want those views to support each other without pretending that any one of them is the whole system.

I can build more applications on Eldertree while continuing to improve it. I don't need to declare the foundation finished first. I do need to leave the next investigation a usable trail: the observation, the evidence, the change, and the result of checking it.

That is the ending I trust more than “everything works now.” There is a platform here, and there is more work to do with it. The next chapter can start from both facts.

---

*— Rafael. First drafted June 2026; revised November 2026.*
