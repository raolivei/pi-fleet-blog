# Chapter 12: The Tuesday Night Apocalypse

May 26, 2026. 6:33 PM.

I was making dinner when my phone buzzed. Prometheus alert: **"NodeDown - node-1"**. Not the notification you want while stirring pasta.

I opened the laptop. Kubernetes dashboard showed node-1 as NotReady. SSH failed—connection reset. But the node responded to ping. It was alive... technically. Just completely unresponsive.

This wasn't the first time. In February, node-1 had hung for four days straight. Pingable but dead. No SSH. No services. No kubelet. Just a blinking cursor at the TTY asking for credentials I couldn't provide remotely. Manual power cycle was the only fix.

That incident prompted Issue #153: **implement hardware watchdog**. A safety net. If the node hangs, the watchdog detects it and triggers a reboot automatically. No manual intervention. No four-day outages.

I'd deployed the watchdog that morning. Eight hours ago. Full Ansible playbook, tested on all three nodes, verified with `lsof /dev/watchdog`. It worked perfectly.

Except now node-1 was hung. Again.

## The First Fix

I physically rebooted node-1. Held the power button. Waited. It came back online. Kubernetes marked it Ready. Pods rescheduled. Crisis averted.

But why didn't the watchdog work?

I SSH'd into node-1 and checked: `systemctl status watchdog`. Active. Running. But then I checked device access: `lsof /dev/watchdog`. Nothing. The daemon was running but didn't have the device open.

That's when I found it: `/usr/lib/systemd/system.conf.d/40-rpi-enable-watchdog.conf`. A systemd configuration file specific to Raspberry Pi OS that enables systemd's built-in watchdog. It claims `/dev/watchdog` before my userspace daemon can access it.

Node-2 and node-3 didn't have this file. Node-1 did. That's why the watchdog worked on two nodes but not the one that needed it most.

The fix: delete the conflicting config, reboot, verify device access. This time, `lsof /dev/watchdog` showed PID 2054—my watchdog daemon. Success.

I ran verification tests. Load spike tests. Network isolation tests. The watchdog responded correctly: when the node was in trouble, it rebooted automatically. When peers were unreachable, it stayed up (correct behavior—only reboot if the local node is broken).

Perfect. Fixed. Time to finish dinner.

## The Second Hang

Three hours later. 9:59 PM.

Another alert: **"NodeDown - node-1"**.

*You have got to be kidding me.*

I opened the laptop. Same symptoms: NotReady, SSH fails, ping works. Node-1 was hung again. Three hours after I fixed the watchdog. Three hours after verification tests passed.

I checked the logs from node-3 (which stayed healthy):

```
May 26 21:11:23 node-3 watchdog[6090]: no response from ping (target: 10.0.0.1)
May 26 21:11:33 node-3 watchdog[6090]: no response from ping (target: 10.0.0.1)
[repeated for ~10 minutes]
```

Node-3's watchdog detected node-1 was unreachable. It logged it. But it didn't reboot itself—correct behavior. Node-3's job is to watch itself, not reboot when a peer fails.

But node-1's watchdog should have detected the hang. It should have rebooted automatically. It didn't.

Why?

## The Forensic Analysis

The next morning, I manually rebooted node-1 again (power cycle, no other choice). Then I collected the logs from the previous boot:

```bash
journalctl --boot=-1 | tail -200
```

The kubelet stopped posting status at 21:59:06. Kubernetes marked the node NotReady 41 seconds later. But the watchdog daemon? Silent. No errors. No warnings. No "triggering reboot" messages.

The hang was subtle. ICMP worked (node-3 could ping it). But userspace services froze. Kubelet stopped. SSH stopped. The watchdog daemon probably stopped too, or at least stopped checking health.

That's the problem with userspace watchdogs: they're userspace. If the OS hangs in a way that keeps the network stack alive but freezes processes, the watchdog daemon freezes too. It can't detect a hang it's part of.

I needed a better design.

## The Fix (For Real This Time)

I made several changes:

**1. K3s health check** — Added a custom script that checks if k3s is running and healthy. If it's not, the watchdog triggers a reboot. This catches kubelet failures before they become hangs.

**2. Peer-only ping checks** — Changed the ping targets. Each node now pings only its peers, not itself. If you can't reach your peers, you're probably network-isolated—reboot. This prevents the "node is pingable but dead" scenario.

**3. Persistent journald logs** — Enabled persistent logging so boot logs survive reboots. Forensic analysis requires data.

**4. Prometheus alerts** — Added alerts for unexpected reboots, OOM kills, and high memory pressure. If the watchdog triggers, I'll know why.

**5. Systemd conflict prevention** — Added Ansible tasks to detect and remove the conflicting systemd watchdog config on all nodes (not just node-1).

The new watchdog configuration looks like this:

```bash
# watchdog-k3s-health.sh (runs every 10 seconds)
if ! systemctl is-active --quiet k3s; then
  echo "k3s not running, watchdog will trigger reboot"
  exit 1
fi
```

If k3s stops, the watchdog notices within 10 seconds and reboots the node. No more "hung but technically alive" state.

The deployment went cluster-wide via Ansible. All three nodes got the updated configuration. All three nodes verified with `lsof /dev/watchdog`. All three nodes showing their watchdog daemon holding the device.

## The Test

I needed to verify this actually worked. So I simulated a kubelet failure on node-2 (the least critical node—node-1 and node-3 are control plane):

```bash
sudo systemctl stop k3s
```

Within 10 seconds, the watchdog detected it. Within 15 seconds, the node rebooted. By the time the node came back online, k3s restarted automatically, kubelet rejoined the cluster, pods rescheduled.

Total outage: ~60 seconds. Zero manual intervention. The watchdog worked.

## The Reflection

Looking back at that Tuesday night, here's what I learned:

**"Service running" doesn't mean "system protected."** The watchdog daemon showed as active both times node-1 hung. But the first time, it didn't have device access. The second time, it probably froze along with the rest of userspace. You have to verify the watchdog is actually functioning, not just running.

**Userspace watchdogs have limits.** If the hang is deep enough (kernel-level deadlock, hardware issue), a userspace daemon can't detect it. You need kernel-level or hardware-level protection. But for most hangs (kubelet failures, service crashes), userspace is enough.

**Health checks need to be explicit.** Pinging the network interface isn't enough. Check the critical services: k3s, kubelet, API server. If they're dead, reboot. Don't wait for a full system hang.

**Automation earns trust through failure.** The watchdog failed twice before it worked. That's not a reason to abandon it—it's a reason to improve it. Each failure teaches you what wasn't covered. Each fix makes the system more resilient.

**Logs are forensics gold.** Without persistent journald logs from the previous boot, I wouldn't have known what failed or when. Always keep logs across reboots.

**Redundancy matters.** Multiple independent health checks (ping, k3s status, memory pressure) are better than a single check. If one misses the issue, another might catch it.

## The Aftermath

Since the fix on May 27, node-1 hasn't hung again. Neither have node-2 or node-3. The watchdog sits quietly in the background, checking health every few seconds, ready to reboot if something goes wrong.

It's invisible infrastructure. You don't think about it when it works. You're grateful for it when it saves you.

And that's the whole point of automation: build systems that handle failures without you. Build monitoring that catches issues before they become outages. Build watchdogs that reboot nodes before you even notice.

The Tuesday night apocalypse was rough. Two hangs in one evening. Manual reboots. Late-night debugging. But the result? A cluster that can recover from failures automatically. A system that's more resilient than it was before.

Node-1 used to hang for four days. Now it reboots itself in 15 seconds.

That's progress.

---

*Next: [Chapter 13: What's Next](/chapters/13-whats-next) - Reflections on the journey, lessons learned, and where the cluster goes from here.*
