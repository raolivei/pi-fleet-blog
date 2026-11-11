# Chapter 12: The Tuesday Night Apocalypse

On Tuesday, May 26, 2026, node-1 hung. It answered pings, but SSH connections failed and Kubernetes couldn't rely on it. A manual reboot brought it back.

I'd added a hardware watchdog that afternoon. The point was to avoid another incident like February's, when node-1 had remained stuck for days until a power cycle. Now I had automation intended to recover a frozen node, and I was still recovering it myself.

The first useful discovery was a small one: `watchdog.service` being active didn't mean my watchdog daemon had control of the hardware.

## Running without the device

After the reboot around 18:33 EDT, the watchdog log reported that it couldn't open `/dev/watchdog`: the device was busy.

Raspberry Pi OS had a systemd drop-in, `40-rpi-enable-watchdog.conf`, that enabled systemd's own use of the hardware watchdog. Systemd had claimed the device before the separate watchdog daemon could open it. My service could show as running while the checks I'd configured weren't controlling that timer.

I disabled the conflicting configuration on node-1, rebooted, and checked the device owner. This time, `lsof /dev/watchdog` showed the watchdog daemon holding it.

That was evidence of a specific repair. It was easy to give it a bigger meaning: the watchdog was fixed, so the node was protected.

There was another mistake in the initial investigation. I thought node-2 and node-3 didn't have the same conflict. The follow-up on May 27 found the drop-in on **all three nodes**. The [corrected incident record](https://github.com/raolivei/pi-fleet/blob/6a9608ff0511f56a6de11f2318060abfcec813fb/docs/NODE-1-HANG-ROOT-CAUSE-2026-05-26.md#L40) keeps both the initial conclusion and its correction. The correction matters more than the tidy version of the story.

## It happened again

Later that evening, node-1 hung again. Its last recorded kubelet heartbeat was around 21:59 EDT. It could still answer ICMP on one network path, but SSH failed and the node stopped reporting healthy Kubernetes status. The hardware watchdog didn't restart it.

The surviving node's logs supplied another observation: node-3 had recorded failed peer pings earlier that evening. Those entries weren't proof of what happened inside node-1, and their timestamps preceded the final kubelet heartbeat. They were part of the investigation, not an explanation by themselves.

Node-1 needed another manual reboot, around 13:26 EDT on May 27. Then I hit the limit of the available evidence: **the journal from the hung boot hadn't been retained**.

I couldn't read that missing journal and conclude that the watchdog daemon had frozen, crashed, or kept feeding the timer. I couldn't establish the exact sequence that prevented the reset. The [second-incident notes](https://github.com/raolivei/pi-fleet/blob/6a9608ff0511f56a6de11f2318060abfcec813fb/docs/NODE-1-HANG-2026-05-26-SECOND.md) record the symptoms and the missing evidence. They don't turn a plausible explanation into a confirmed cause.

That gap changed what I could honestly call the next round of work. I had weaknesses to address. I didn't have a complete explanation for the second failure.

## What the timer does, and what the checks decide

The distinction between the daemon and the hardware is important here.

The BCM2835 watchdog is a hardware timer. A userspace daemon periodically feeds it. If the timer is armed and those keepalives stop, the timer is intended to expire and reset the machine. The [Linux watchdog API](https://docs.kernel.org/watchdog/watchdog-api.html) describes that arrangement. The timer doesn't need the daemon to notice its own freeze first.

The health checks answer a different question: should the daemon keep feeding the timer while the machine is still running? A node can have working network responses and a manageable load average while a service I depend on has failed. A check that never looks at that service can miss the problem.

Before the May 27 hardening, this configuration had no custom application check for k3s, kubelet health, or the API listener. Adding those checks closed a real gap. It didn't prove that this gap alone caused the second hang.

## The changes I could verify

The [hardening PR](https://github.com/raolivei/pi-fleet/pull/184) made the checks more explicit and dealt with the systemd conflict across the cluster.

I added a health script that checks three things: whether the k3s service is active, whether the local kubelet health endpoint responds, and whether the API port is listening. A failure returns an unsuccessful result to the watchdog daemon. These are useful local checks; an open port still isn't proof that an application works for its users.

I also changed the ping targets so each node checked its peers instead of including itself. In this configuration, losing all peers is a reason to consider the local node isolated. That is a recovery policy, not a guarantee that a reboot will repair the network or explain which part failed.

The Ansible work disabled the conflicting systemd watchdog configuration, installed the health script, and added journal-persistence settings. The verification script checked the drop-in and device ownership as well as service status. Monitoring rules covered the watchdog service being down and a node reporting unhealthy Kubernetes status while metrics remained reachable.

The recorded validation was concrete: the playbook ran across all three nodes, the verification script passed, the health script returned success on each node, and the configured ping targets contained peers rather than self-pings. The PR also records rolling reboots of node-3 and node-2. All three machines were control-plane and etcd members; none was a disposable test worker.

Those checks showed that the deployed setup matched the intended design. They didn't measure how quickly it would recover from the next real hang.

The configuration used a five-second daemon interval and a 15-second hardware timeout, with a separate timeout for the health test. Those are configuration values. They aren't a measurement of how long it takes for Kubernetes, storage, and applications to become useful again after a failure.

## What September added to the story

This chapter would be shorter if the May changes had ended node trouble permanently. They didn't establish that, and later incidents made the limits clearer.

On September 15, all three nodes became unreachable at different points during a wider incident. The [incident record](https://github.com/raolivei/pi-fleet/blob/5b20d95245f4410608bc3c4a565cff0ed4fcac1d/docs/POE-POWER-INCIDENT-2026-09-15.md) points toward a shared power problem. That called for a different investigation from May's confirmed configuration conflict. A watchdog can't keep a machine running when its power disappears. During that investigation, I disabled it across the cluster to remove another source of reboots.

September also exposed an uncomfortable detail about the logging fix. The May playbook had set `Storage=persistent`, but an OS drop-in overrode that setting. Writing the desired value into a configuration file hadn't proved that persistent logging was actually working. The later fix checked the effective configuration and the journal's actual storage path.

That was the same lesson again, one layer deeper. First I had trusted a running service without checking the device. Then I had trusted a logging setting without checking where the logs went.

## The part I would repeat

The useful outcome of May 26–27 was a set of specific improvements: correct device ownership, checks for services that mattered, verification across all nodes, and a better record of what remained unknown.

I would keep those improvements. I would drop the claim that a green verification script means the next hang is solved.

The watchdog is one recovery mechanism. Its value depends on the timer being armed, the checks covering the failure I care about, and the machine still having the power and hardware it needs to recover. The [runbook](https://docs.eldertree.xyz/) is where the operating procedure belongs. The diary needs to preserve the reason for it, including the part where my first conclusion was wrong.

Node-1 answered a ping while the services I needed were unavailable. Later, a service answered “active” while it didn't own the device. Neither answer was false. I had asked each one to tell me more than it could.

---

*Next: [Chapter 13: What's Next](/chapters/13-whats-next) — what I want from the platform now, and what still needs evidence.*
