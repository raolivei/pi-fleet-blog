# Chapter 7: Watching It All

A working application is a surprisingly poor way to tell whether you have working infrastructure.

SwimTO could serve a page while something underneath it was running out of space. A pod could be ready while the public hostname was broken. And a dashboard could look reassuring because the thing it was supposed to measure wasn't being scraped at all.

By April 2026, Eldertree had Prometheus and Grafana, along with enough dashboards to make finding the right one a small task of its own. The missing piece was knowing what those dashboards actually covered. Installing monitoring had been easier than checking whether it answered the questions I needed it to answer.

The [April 29 observability changes](https://github.com/raolivei/pi-fleet/pull/160) were an attempt to close that gap. Traefik scraping, synthetic checks, log collection, a dashboard inventory. Less exciting than adding another application, but increasingly necessary as the existing ones acquired users.

## What the stack could tell me

Prometheus collected the numbers: node resources, Kubernetes object state, application metrics, and the exporters configured for services such as PostgreSQL, Redis and Vault. Grafana gave me somewhere to read them; the [public Grafana entry point](https://grafana.eldertree.xyz) is available now. Pushgateway handled metrics from batch work that might finish before Prometheus came around to scrape it.

Those tools weren't interchangeable. A deployment's available replica count told me something different from its request latency. Node memory usage could explain pressure without identifying which request caused it. Getting a useful picture meant putting several signals next to one another, then following the one that looked wrong.

Alerting added another distinction I needed to get right. Prometheus evaluates the alert rules. Alertmanager receives the firing alerts and handles grouping and delivery through configured notification receivers. Having an alert visible in Prometheus doesn't establish that a notification reached a phone. That last part needs its own configuration and test.

The same applied to timing. The April work initially used 30-second scrapes, then [changed the interval to 60 seconds](https://github.com/raolivei/pi-fleet/pull/161) to reduce load on the Pis. I gave up some detail between samples in exchange for doing less work on machines with 8GB of RAM. A minute was a reasonable compromise for the cluster, but it meant I couldn't expect the graphs to reconstruct every short interruption.

## The URL was a separate question

The part I had been missing was outside the application process.

An API can be healthy while users get a certificate error. Kubernetes can have the right endpoints while DNS points somewhere else. Traefik can route traffic correctly and still sit behind a broken public tunnel configuration. None of those failures requires the application pod to crash.

Blackbox exporter gave Prometheus another way to look. It requested the configured URLs and reported whether the checks passed, how long they took, and which HTTP status came back. The exporter ran inside the cluster, so this was a check from that location through the public hostname, not an independent monitor on someone else's network. Still, it exercised more of the path than looking at a ready pod.

The public targets included SwimTO and Pitanga. Internal dashboards had a separate module with relaxed certificate verification. That made those checks useful for reachability, but they couldn't prove certificate trust was correct when verification was disabled.

The original `BlackboxProbeFailing` rule waited five minutes before firing. That matters. A short blip could appear in the probe metrics without becoming a firing alert. I wanted the rule to avoid treating every brief interruption as something requiring attention; I couldn't then describe it as a detector for every interruption.

Nor was an HTTP probe a test of the whole product. A successful response didn't prove that Google login worked, that pool schedules were current, or that a user could save a favourite. It answered a narrower question, and that was useful enough to keep.

## Fixing the dashboards I already had

Traefik was a good example of the gap between having a metrics feature and having usable metrics. The April pass added a static scrape for its Prometheus endpoint and exposed the metrics port in the K3s Traefik configuration. Until the scrape path was wired correctly, an ingress dashboard couldn't tell me much about the traffic actually passing through it.

Grafana had its own housekeeping problem. Its dashboard sidecar was searching every namespace for labelled ConfigMaps. I scoped that search to `observability`, where I could control the dashboard collection, instead of letting unrelated charts decide what appeared in the list.

I also added an inventory in `DASHBOARDS.md`. That sounds like documentation work you do after the interesting part. In practice, being able to identify the maintained dashboard was part of making the monitoring usable.

The Eldertree Ops Home dashboard became a way into the collection. From there I could follow a probe failure to ingress metrics, or a resource problem to the node and workload views. The hardware dashboard had a different job: temperatures, memory, disk and throttling signals. Rising temperature was a reason to investigate cooling; it wasn't evidence that throttling had started. Raspberry Pi's documented thermal limits are around 80–85°C, rather than the much lower temperature at which I might choose to pay attention.

## Keeping the logs long enough to use them

The same April changes added Loki and Promtail. Promtail collected pod logs and sent them to Loki; Grafana could then query those logs alongside the metrics.

That made an investigation less dependent on whether a particular pod still existed when I looked. It didn't make the logs a guaranteed explanation. I still had to have collected the relevant messages, kept them, and know roughly where to search. A graph could narrow the time window considerably.

Storage put a limit on how far back any of this worked. In April, Prometheus was configured for seven days of retention on an 8Gi volume. That was a disk constraint, not a declaration that a week of history would always be enough.

On June 1, I [changed the desired configuration](https://github.com/raolivei/pi-fleet/pull/200) to 90 days of metrics on a 64Gi NVMe volume, with a 58GB size cap, and 30 days of Loki logs. The accompanying runbook included a volume migration; changing a retention value in Git wasn't enough to complete it. The earlier seven-day setup belongs to this part of the story, rather than to an undated description of Eldertree today. So does Pi-hole's place in the metric collection, before the later BIND9 cutover.

I came out of that work with a more useful monitoring system and a less tidy definition of “monitored.” I could see resource history, search collected logs, and check configured URLs. I still needed to test notification delivery and cover the application flows a probe couldn't see.

That was enough progress to matter. When the next deployment misbehaved, there would be more to work with than its current pod status.

---

*Next: [Chapter 8: The Great Deployment Disaster](https://github.com/raolivei/pi-fleet-blog/pull/25) — the deployment problems that made those extra signals worth having.*
