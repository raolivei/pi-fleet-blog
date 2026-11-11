## Chapter 17: The Tailscale Treachery (Or: How I Learned to Stop Worrying and Love Routing Tables)

> **Date:** January 20, 2026  
> **Time spent:** An entire evening  
> **Debugging depth:** Kernel routing tables  
> **Plot twists:** 4  
> **Pods sacrificed:** Too many to count

### The Innocent Beginning

"Let me just verify the swimTO deployment real quick."

Famous last words.

The app should have been running. The pods were "Running." The services were "Active." Everything looked healthy in that deceptive way that Kubernetes has mastered—like a cat sitting next to a knocked-over vase, pretending nothing happened.

But the API? The API was stuck in an eternal loop of `CrashLoopBackOff`, desperately trying to connect to PostgreSQL like a text message left on read.

---

### Act I: The Database URL Debacle

First suspect: the `DATABASE_URL`. Of course it was. It's always the environment variables, isn't it?

```python
sqlalchemy.exc.OperationalError: could not connect to server: Connection timed out
```

Checked the secret. The URL contained... a pod IP. Not a service name. A pod IP. From a pod that no longer existed. Because pods are ephemeral. Because that's their whole thing.

**Fix attempt #1:** Update `DATABASE_URL` to use `postgres-service.swimto.svc.cluster.local`.

*Still broken.*

But now with a different error:

```
DNS resolution failed: [Errno -3] Temporary failure in name resolution
```

Oh, DNS. My old nemesis. We meet again.

---

### Act II: The Cross-Node Conspiracy

Here's where it gets interesting. I did what any reasonable engineer would do: started scheduling pods on specific nodes to isolate the problem.

- API on node-2, PostgreSQL on node-3? **Timeout.**
- API on node-3, PostgreSQL on node-3? **Works perfectly.**

Wait. What?

Same-node communication: ✅  
Cross-node communication: ❌

This wasn't a database problem. This wasn't a DNS problem (well, it was, but as a symptom). This was a networking problem. The kind that makes you question your career choices.

---

### Act III: The Tailscale Trap

Time to go deeper. SSH into node-2. Start checking routes.

```bash
ip route show
```

Normal routes. Flannel looks fine. VXLAN interface exists. Nothing suspicious here, officer.

But then... a hunch. A whisper from the networking gods. Check the policy routing tables.

```bash
ip route show table 52
```

And there it was. The smoking gun. The betrayal.

```
10.42.0.0/16 dev tailscale0
10.43.0.0/16 dev tailscale0
```

Tailscale. My beloved Tailscale, the VPN that makes remote access magical, had decided that k3s pod and service networks looked interesting and claimed them for itself.

Every packet destined for `10.42.x.x` (pods) or `10.43.x.x` (services) was being hijacked and sent through the Tailscale interface instead of Flannel's VXLAN tunnel. It's like having a GPS that routes you through a cornfield because technically it's shorter.

---

### Act IV: The Surgical Strike

The fix was almost anticlimactic:

```bash
sudo ip route del 10.42.0.0/16 table 52
sudo ip route del 10.43.0.0/16 table 52
```

Two commands. That's it. Hours of debugging for two commands.

But wait—these routes would come back after a reboot. Tailscale is persistent like that. So, systemd to the rescue:

```bash
cat <<EOF | sudo tee /etc/systemd/system/fix-tailscale-k3s-routes.service
[Unit]
Description=Fix Tailscale routes that conflict with k3s
After=tailscaled.service k3s.service

[Service]
Type=oneshot
ExecStart=/bin/bash -c "sleep 30 && ip route del 10.42.0.0/16 table 52 2>/dev/null; ip route del 10.43.0.0/16 table 52 2>/dev/null"
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
```

Yes, there's a `sleep 30` in there. Yes, it's a hack. But it works, and at this point, "it works" is the most beautiful phrase in the English language.

---

### The Plot Twist: It's Not Over Yet

Network fixed. Pods can talk to each other. Database connected. Time to test the frontend.

Click "Login with Google."

```
Login Failed
```

*Why.*

Check the browser console:

```
GET https://swimto.app/api/auth/google-url 404 Not Found
```

The ingress! The ingress was routing `/api/auth` but the Traefik middleware wasn't stripping the `/api` prefix correctly. The API was receiving `/api/auth/google-url` instead of `/auth/google-url`.

**Fix:** Create a proper `stripPrefix` middleware.

Test again. Google OAuth works. Redirects back to the app.

```
Login Failed
```

*WHAT NOW.*

The `/auth/callback` was being routed to the API instead of the frontend. Ingress path order matters. Added explicit route for `/auth/callback` → frontend.

Test again. Login works!

Click around. Check the schedule.

```
404 Not Found
```

The `/api/facilities` and `/api/schedule` endpoints were defined with trailing slashes, but the frontend was calling them without. Changed route definitions from `"/"` to `""`.

Deploy. Test. 

**It works.**

---

### The Aftermath

Final tally of issues fixed:

1. **Tailscale routing table conflict** - Routes in table 52 intercepting k3s traffic
2. **Traefik middleware** - `/api` prefix not being stripped
3. **Ingress path routing** - `/auth/callback` going to wrong service
4. **API route definitions** - Trailing slash mismatches

Time from "let me verify" to "it works": Several hours.
Lines of code changed: Maybe 20.
Routing tables inspected: 3.
Lessons learned: At least 1.

---

### The Moral of the Story

When same-node works but cross-node fails, check your VPN routing tables. Tailscale and k3s can coexist peacefully, but they need boundaries. Like roommates who both want to use the bathroom at 7 AM.

Also, always check the ingress path routing. And the middleware. And the trailing slashes. And... you know what, just check everything.

---

### Technical Reference

For future me (and anyone else who encounters this):

**The Problem:** Tailscale adds routes in routing table 52 for advertised subnets, including k3s pod/service CIDRs.

**The Solution:**
```bash
# Immediate fix
ip route del 10.42.0.0/16 table 52
ip route del 10.43.0.0/16 table 52

# Persistent fix: systemd service that runs after Tailscale
```

**See Also:** 
- Runbook entry `NET-006` for full diagnosis steps
- SwimTO `TROUBLESHOOTING.md` for application-specific fixes

**Remember:** Routing table 52 is Tailscale's policy routing table. If cross-node communication breaks mysteriously, that's where the bodies are buried.

---

*Next up in Chapter 18: Whatever breaks next. Because something always does.*
