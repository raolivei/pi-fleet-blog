# Chapter 9: The Tailscale Treachery

"Let me just verify the SwimTO deployment real quick."

Famous. Last. Words.

It was January 20, 2026. Evening. The deployment from a few days ago should have been stable by now. I'd fixed all the issues (see Chapter 8 for that saga). The pods showed "Running." The services showed "Active." Everything looked healthy in that deceptive way Kubernetes has mastered—like a cat sitting next to a knocked-over vase, pretending nothing happened.

But when I tried to actually use the app? The API was stuck in an eternal loop of `CrashLoopBackOff`, desperately trying to connect to PostgreSQL like a text message left on read.

Here we go again.

## The Database URL Debacle

First suspect: the `DATABASE_URL`. It's always the environment variables.

The logs showed:

```python
sqlalchemy.exc.OperationalError: could not connect to server: Connection timed out
```

I checked the secret. The URL looked fine: `postgres-service.swimto.svc.cluster.local`. Service DNS name, not a pod IP. That's correct.

But the connection was timing out. Not failing immediately (wrong credentials, wrong host). Timing out. That means the TCP connection isn't completing. Network issue.

I tried `kubectl exec` into the API pod and curled the PostgreSQL service. Timeout. DNS resolution worked fine—the name resolved to the service ClusterIP. But the connection timed out.

Then I did what any reasonable engineer would do: started scheduling pods on specific nodes to isolate the problem.

- API on node-2, PostgreSQL on node-3? **Timeout.**
- API on node-3, PostgreSQL on node-3? **Works perfectly.**

Wait. Same-node communication works. Cross-node communication fails.

This wasn't a database problem. This wasn't a DNS problem (well, it was related, but as a symptom). This was a **networking problem**. The kind that makes you question your life choices at 9 PM on a Tuesday.

## The Cross-Node Conspiracy

I SSH'd into node-2. Time to go deeper.

```bash
ip route show
```

Normal routes. Flannel (K3s's default CNI) looked fine. The VXLAN interface existed. Pod CIDR routes were there. Nothing obviously wrong.

But cross-node traffic was broken. So something was intercepting packets destined for other nodes' pod IPs.

Then a hunch. Check the policy routing tables.

```bash
ip route show table 52
```

And there it was. The smoking gun.

```
10.42.0.0/16 dev tailscale0
10.43.0.0/16 dev tailscale0
```

Tailscale. My beloved Tailscale, the VPN that makes remote access magical, had decided that the K3s pod network (`10.42.0.0/16`) and service network (`10.43.0.0/16`) looked interesting and **claimed them for itself**.

Every packet destined for a pod or service on another node was being hijacked and sent through the Tailscale interface instead of Flannel's VXLAN tunnel.

It's like your GPS routing you through a cornfield because technically it's shorter on the map, ignoring the fact that there's no road.

## The Routing Table Lesson

Here's what was happening:

1. SwimTO API pod on node-2 tries to connect to PostgreSQL service (`10.43.x.x`)
2. Kernel checks the routing tables
3. Finds a route in table 52 (Tailscale's policy routing table): `10.43.0.0/16 dev tailscale0`
4. Sends packet to Tailscale interface
5. Tailscale has no idea what to do with it (it's not a Tailscale peer)
6. Packet dropped
7. Connection timeout

Meanwhile, same-node traffic worked because it never hit the routing table—localhost communication stays local.

Tailscale adds these routes automatically when you configure it as a subnet router (which I did, to allow remote access to the cluster networks). The intent is good: advertise these subnets to other Tailscale peers so they can reach the cluster.

The problem: Tailscale assumed it should route ALL traffic to those subnets, including traffic originating from within the cluster. That's not what I wanted. Internal cluster traffic should use Flannel. Only external (Tailscale peer) traffic should use the VPN.

## The Surgical Strike

The fix was almost anticlimactic:

```bash
sudo ip route del 10.42.0.0/16 table 52
sudo ip route del 10.43.0.0/16 table 52
```

Two commands. Hours of debugging for two commands.

I ran them on all three nodes. Tested cross-node communication. It worked. API connected to PostgreSQL. Pods could talk to each other. The cluster was whole again.

But these routes would come back after a reboot—Tailscale is persistent like that. So I needed a systemd service to delete them automatically on boot.

```bash
cat <<EOF | sudo tee /etc/systemd/system/fix-tailscale-k3s-routes.service
[Unit]
Description=Fix Tailscale routes that conflict with k3s
After=tailscaled.service k3s.service

[Service]
Type=oneshot
ExecStart=/bin/bash -c "sleep 30 && ip route del 10.42.0.0/16 table 52 2>/dev/null || true; ip route del 10.43.0.0/16 table 52 2>/dev/null || true"
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable fix-tailscale-k3s-routes.service
```

Yes, there's a `sleep 30` in there. Yes, it's a hack. But it works. Tailscale and K3s start up, the routes get added, then 30 seconds later the service deletes them. Kubernetes and Tailscale coexist peacefully.

Is it elegant? No. Does it work? Yes. At 9 PM on a Tuesday, "it works" is the most beautiful phrase in the English language.

## The Plot Twist: It's Not Over

Network fixed. Pods talking to each other. Database connected. Time to test the full app.

I opened the browser. Navigated to `https://swimto.eldertree.local`. Clicked "Login with Google."

```
Login Failed
```

*Why. Why does the universe do this.*

I checked the browser console:

```
GET https://swimto.eldertree.local/api/auth/google-url 404 Not Found
```

The ingress! The Traefik IngressRoute was routing `/api/auth`, but the middleware wasn't stripping the `/api` prefix correctly. The API was receiving `/api/auth/google-url` instead of `/auth/google-url`.

I created a proper `stripPrefix` middleware:

```yaml
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: strip-api-prefix
spec:
  stripPrefix:
    prefixes:
      - /api
```

Applied it. Tested again. Google OAuth worked. Redirects back to the app.

```
Login Failed
```

*WHAT. NOW.*

This time, the `/auth/callback` endpoint was being routed to the API instead of the frontend. The ingress path order matters—Traefik matches routes top to bottom. I needed an explicit route for `/auth/callback` pointing to the frontend, placed before the `/api` catch-all.

Fixed the order. Tested again. Login worked!

I clicked around. Checked the schedule page.

```
404 Not Found
```

You have got to be kidding me.

The API routes were defined with trailing slashes (`/facilities/`, `/schedule/`), but the frontend was calling them without (`/facilities`, `/schedule`). FastAPI is strict about trailing slashes by default.

I changed the route definitions from `"/"` to `""` (which makes them match without trailing slashes).

Deployed. Tested. **It worked.**

## The Aftermath

Final tally of issues fixed in one debugging session:

1. **Tailscale routing table conflict** — Routes in table 52 intercepting k3s traffic
2. **Traefik middleware** — `/api` prefix not being stripped correctly
3. **Ingress path routing** — `/auth/callback` going to wrong service
4. **API route definitions** — Trailing slash mismatches

Time from "let me verify" to "it works": Several hours.  
Lines of code changed: Maybe 20.  
Routing tables inspected: 3.  
Lessons learned: At least 1.  

## The Moral

When same-node communication works but cross-node fails, check your VPN routing tables. Tailscale and K3s can coexist peacefully, but they need boundaries. Like roommates who both want to use the bathroom at 7 AM.

Also, always check the ingress path routing. And the middleware. And the trailing slashes. And... you know what, just check everything. Networking issues are rarely just one thing. They're layers of things, stacked on top of each other, each one hiding the next.

But when you finally isolate the root cause—when you see that route in table 52 and realize "that's it, that's the problem"—there's a specific satisfaction that comes from understanding the system deeply enough to fix it.

You're not just applying patches. You're understanding how the kernel routes packets, how Tailscale configures policy routing, how Flannel expects internal traffic to flow. You're understanding the system.

And that understanding is what makes you a good operator.

---

*Next: [Chapter 10: Building Ollie](/chapters/10-building-ollie) - When your cluster gets a brain, and that brain needs memory.*
