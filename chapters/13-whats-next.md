# Chapter 13: What's Next

It's June 2026. Seven months since I flashed the first SD card. Seven months since that first `kubectl get nodes` showed "Ready" and I realized this might actually work.

The cluster is running. Three Raspberry Pi 5s, humming quietly in my living room, serving production applications, surviving node failures, recovering from hangs, deploying updates automatically. It's infrastructure that mostly takes care of itself.

But "what's next" isn't really about adding more features. It's about looking back at what worked, what didn't, and what patterns emerged from seven months of building and operating this thing.

## The Patterns That Emerged

Here's what I learned about building infrastructure:

**Start simple, then add complexity.** I started with one node, K3s, and a test nginx pod. No HA. No GitOps. No monitoring. Just: does it work? Once it worked, I added a second node. Then a third. Then high availability. Then Vault. Then GitOps. Each addition built on a solid foundation.

If I'd tried to build everything at once—three-node HA cluster with Vault, monitoring, GitOps, applications, and autoscaling—I would have drowned in complexity. Small steps let you understand each piece before adding the next.

**Automation from day one pays off forever.** The Ansible playbooks I built for node setup, NVMe boot, and K3s installation saved me hours every time I added a node or recovered from a failure. The GitOps setup with FluxCD meant deployments happened automatically. The reusable CI/CD workflows meant new projects could plug in with minimal setup.

Every hour spent on automation in November paid dividends in every month after. The ROI is absurd.

**Explicit configuration beats defaults.** Kubernetes has defaults for storage classes, resource limits, network policies. I learned to ignore them and be explicit. Specify `storageClassName: local-path`. Set resource requests and limits. Define network interfaces for MetalLB. Defaults work until they don't, and when they fail, you waste time debugging "why did Kubernetes choose *that* value?"

**Monitoring is essential, not optional.** Every time I caught an issue via Prometheus alert before it became a user-visible outage, I felt vindicated. The SwimTO API OOMKill at 2 AM? Caught by monitoring. The node-1 hang? Detected within seconds. Synthetic checks failing? Alert fired.

Without monitoring, you're flying blind. With it, you see problems before they become disasters.

**Secrets belong in Vault.** Not in Git. Not in environment variables. Not in a password manager you manually copy-paste from. In Vault, synced to Kubernetes via External Secrets, with policy-based access control. The near-miss with the API key in November taught me this. I'm glad I learned it early.

**High availability is about eliminating single points of failure.** Three-node etcd. Kube-vip VIP for API access. Vault Raft replication. Hardware watchdog for node hangs. Each one removes a failure mode. Not everything needs HA (I removed Longhorn), but critical infrastructure does.

**Test your assumptions.** The watchdog worked in tests but failed during real hangs. The ingress routing worked for simple cases but broke with trailing slashes. The Tailscale routes looked fine until cross-node traffic broke. Testing assumptions means: actually break things and see if your mitigations work.

**Documentation is for future you.** Every time I wrote a runbook entry or updated a README, I thought "I'll remember this." I never did. Three months later, I'd search my own docs to remember how to unseal Vault or fix DNS. Write it down. Future you will thank present you.

**Troubleshooting is pattern recognition.** After debugging 92 problems across 212 commits, I started recognizing patterns. Pod in CrashLoopBackOff? Check logs, then resource limits, then secrets. Cross-node networking broken? Check routes, then firewall, then CNI config. DNS failing? Check Pi-hole, then CoreDNS, then ExternalDNS. Patterns speed up debugging.

**Failures are learning opportunities.** The deployment disaster in January taught me about JSON serialization in shell scripts. The Tailscale routing issue taught me about policy routing tables. The watchdog failures taught me about userspace vs kernel-level protection. Every failure left the system better than before.

## The Lessons from Seven Months

If I were starting over, here's what I'd do differently:

**Set resource limits from day one.** I spent too much time debugging "resource limits higher than node capacity" errors because I didn't set them upfront. Define limits early, tune later.

**Document architecture decisions in ADRs (Architecture Decision Records).** I have commit messages and PRs, but a dedicated "why we chose X over Y" document would have been useful. Why K3s instead of full Kubernetes? Why Vault instead of Sealed Secrets? Write it down while the reasoning is fresh.

**Test reboots before they're forced.** Every major change should include a "reboot all nodes and verify" step. I learned this the hard way during the SD card recovery incident. Test the failure modes before they happen in production.

**Automate Vault unsealing earlier.** I typed the unseal keys manually way too many times before automating it. If you're doing something repetitive, automate it.

**Build the Control Center sooner.** Having one interface for all operations is transformative. I wish I'd built it in January instead of April.

But honestly? I wouldn't change much. The mistakes were part of the learning. The detours taught me things I wouldn't have learned otherwise. The infrastructure is better because it evolved through real problems, not hypothetical ones.

## What's Actually Next

So, what's next for Eldertree?

**Enhanced security.** Network policies to isolate namespaces. Pod security standards to restrict container capabilities. Maybe even a service mesh (Linkerd?) for mTLS between services. Security layers, not just perimeter defense.

**Disaster recovery plan.** I have backups. I have runbooks. But I don't have a documented, tested recovery procedure for "the entire cluster burned down." That's next. Document it, test it, sleep better.

**Canopy deployment.** The personal finance dashboard has been "coming soon" for months. It's resource-heavy, which is why it's not deployed yet. But with better autoscaling (KEDA), it should fit. Time to make it real.

**Voice interface for Ollie.** Integration with Qwen3-TTS for voice interactions. Ask questions while away from the keyboard. It's a nice-to-have, but it would be fun.

**Expand the application portfolio.** More apps mean more learning. More edge cases. More opportunities to improve the platform. I have ideas. Time to build them.

**Maybe add a fourth node?** Three nodes is good for HA. Four nodes gives more capacity and better load distribution. But it also means more complexity. We'll see.

But honestly? The cluster is in a good place. It runs apps. It survives failures. It deploys automatically. It monitors itself. The infrastructure is solid.

The goal now is to *use* the infrastructure, not just build it. Run more applications. Serve more users. Solve real problems. That's the whole point of building a platform: to enable things you haven't thought of yet.

## The Meta Lesson

Seven months ago, I wanted to learn Kubernetes, own my infrastructure, and build something that mattered. I've done all three.

But the real lesson isn't about Kubernetes or Raspberry Pis or any specific technology. It's about this:

**You can build infrastructure that works.** Not perfect infrastructure—that doesn't exist. But infrastructure that's good enough, resilient enough, automated enough to actually be useful.

You don't need a massive data center. You don't need enterprise hardware. You don't need a team. You need clear goals, solid fundamentals, willingness to debug failures, and patience to iterate.

Three Raspberry Pis can run production applications. They can serve real users. They can survive node failures and recover automatically. They can deploy updates via GitOps without manual intervention.

Is it AWS-scale? No. But it's my-scale. And it works.

## The Reflection

Every time I open the Control Center and see all nodes green, all pods running, all applications healthy, there's a specific feeling. Not pride, exactly. More like: satisfaction. The kind that comes from building something, learning from failures, iterating, and ending up with a system that just works.

The cluster isn't perfect. Node-1 still hangs sometimes (though the watchdog catches it now). Resource limits are still too tight for some apps. The documentation could be better.

But it runs. It serves applications. It survives failures. It's infrastructure I trust.

And seven months ago, I had three Raspberry Pis in boxes and a vague idea that "it might be cool to run Kubernetes at home."

Look at how far we've come.

The infrastructure is solid. The automation works. The monitoring catches issues. The deployments are seamless. The platform enables applications.

Now it's time to build on it.

The cluster is ready. The platform is ready. The next chapter is: what will we build?

That's the exciting part. The foundation is done. The infrastructure works. Now we get to actually use it.

**What's next?**

Everything.

---

*Epilogue: This is the end of the infrastructure journey, but the beginning of the application journey. The cluster is a platform now. Time to build things that matter.*

*Thank you for reading. If you found this useful, consider building your own homelab. Start small. Learn deeply. Iterate constantly. You'll surprise yourself with what you can build.*

*— Rafael, June 2026*
