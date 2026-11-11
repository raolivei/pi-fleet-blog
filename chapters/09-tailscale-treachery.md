# Chapter 9: The Tailscale Treachery

The most useful detail in the January 20 troubleshooting notes is where the application worked.

SwimTO's API could reach PostgreSQL when they were on the same node. Put them on different nodes and the connection timed out. That gave the investigation a direction that a database error alone hadn't supplied.

There were several problems around that deployment, including DNS and ingress symptoms. It would have been easy to keep changing application settings until one of them appeared to help. The difference between same-node and cross-node traffic was a better clue: something about the path between machines needed attention.

## The route I wasn't looking at

Tailscale had just joined the cluster's networking. The January 20 Ansible setup configured the nodes as subnet routers, advertising networks that a remote client should be able to reach. It also enabled `--accept-routes` on those nodes.

Those are different settings. Advertising a route offers a path to other devices. Accepting routes lets a device use paths advertised by peers. With several routers advertising overlapping networks, enabling both can lead a node to send traffic through another router even when it has a local path it should use instead.

The [same-day troubleshooting record](https://github.com/raolivei/swimTO/commit/285927e) identifies conflicting routes in table 52, Tailscale's policy-routing table. The entries covered the default K3s pod and service ranges:

```text
10.42.0.0/16 dev tailscale0
10.43.0.0/16 dev tailscale0
```

I had been thinking about the extra access the VPN gave me. These routes were a reminder that it could also change where the nodes sent their own traffic.

Checking the main routing table wasn't enough. Policy rules can select another table, so the relevant inspection was:

```bash
ip rule show
ip route show table 52
```

The recorded diagnosis was that those entries interfered with the K3s path between nodes. Flannel's cross-node networking and Tailscale were no longer operating on the separate traffic I had intended.

The same-node success narrowed the failure. Those pods still had separate network namespaces and used the node's networking; they weren't communicating over localhost. Colocation avoided the failing path between hosts. That was enough to make the host routing worth investigating before changing the database configuration again.

## The workaround I wrote down

The immediate fix in the January notes was to remove the conflicting table-52 entries:

```bash
# Historical workaround for the default K3s CIDRs in this incident.
sudo ip route del 10.42.0.0/16 table 52
sudo ip route del 10.43.0.0/16 table 52
```

The notes also recorded a boot-time systemd service that waited for startup and deleted those routes again. It included a 30-second delay. That was an attempt to keep the workaround in place after a restart, rather than relying on remembering two commands.

It was still a workaround. A timed deletion doesn't control every later change a networking daemon might make, and it leaves the unwanted route configuration underneath. I wouldn't present that service as a general way to integrate Kubernetes with Tailscale.

The later Ansible configuration takes a more direct approach: it keeps the pod and service CIDRs out of the advertised routes and disables route acceptance on the cluster's subnet-router nodes. Remote clients can use the intended ingress path without asking the nodes to import overlapping routes to their own cluster networks.

That distinction is the part I would keep if I had to set it up again. The useful remote-access feature was real. So was the extra routing behaviour I had enabled alongside it.

## Then there were the HTTP routes

The January troubleshooting record didn't end at database connectivity. It also documents three problems higher up the request path: stripping the API prefix, sending the OAuth callback to the frontend, and matching the API's trailing slashes.

These belonged to different layers. Fixing the host route couldn't correct an HTTP path, even if both failures reached me as an application that didn't work.

The frontend requested API endpoints under `/api`. The backend routes didn't include that prefix, so ingress needed to remove it before forwarding the request. The middleware in the runbook used Traefik's `stripPrefix`:

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: strip-api-prefix
  namespace: swimto
spec:
  stripPrefix:
    prefixes:
      - /api
```

That describes the path transformation. The ingress also needed to reference the middleware; creating an unused middleware object wouldn't change a request.

OAuth had a separate destination problem. The `/auth/callback` page belonged to the frontend, which handled the browser returning from Google. Routing that page to the API produced the wrong response. The runbook records adding an explicit frontend path for it.

The callback needed the right destination and matching rule. Moving entries around in the YAML wasn't enough: Traefik's [default router priority comes from rule length](https://doc.traefik.io/traefik/v3.3/routing/routers/#priority), and explicit priority can override it. A literal `/api` prefix wouldn't match `/auth/callback` in the first place. I had to check the rules actually selected for each request, including the frontend fallback.

## One slash, after a deliberate change

The slash problem has a particularly clear commit trail.

Earlier on January 20, I [disabled FastAPI's automatic slash redirects](https://github.com/raolivei/swimTO/commit/94812b124252796a38ef961093c9c33a18cfdb60) to address auth requests whose 307 redirects were causing browser/CORS trouble. FastAPI normally redirects a slash mismatch; the strict behaviour here followed that explicit application setting.

Later that day, requests to facilities and schedules exposed another mismatch. The routers registered their base endpoints with `"/"`, while the frontend called them without the trailing slash. With automatic redirects disabled, those requests returned 404s.

The [v0.7.3 fix](https://github.com/raolivei/swimTO/commit/c98ffd0c630b7294286ecd8a6e2a3122f55c087b) changed the base route definitions from `"/"` to `""`, matching the frontend's requests. It didn't make every possible spelling of a URL equivalent. It made these two sides agree.

That sequence explains more than saying FastAPI was strict by default. An earlier fix had changed behaviour, and the remaining route definitions hadn't caught up.

## The difference that mattered

Looking back, I can separate the investigation into manageable pieces. Cross-node database access pointed toward the host network. The table-52 entries explained a route conflict. API 404s needed an ingress-path check. The OAuth callback needed the right service. The later 404s needed route definitions consistent with the application's redirect setting.

The same January 20 record contains all of them, but that doesn't make them one bug with one clever solution. It was several pieces of the request path disagreeing with one another.

What I want from the next investigation is the same useful distinction that started this one: a concrete difference between the case that works and the case that fails. Here, knowing where the pods ran was more useful than another look at the database connection string.

---

*Next: [Chapter 10: Building Ollie](https://github.com/raolivei/pi-fleet-blog/pull/27) — finding the documentation again when the details stop fitting in my head.*
