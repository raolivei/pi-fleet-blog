# Chapter 10: The Four-Hour Debugging Marathon

## Or: How I Learned to Love (and Hate) GitHub Actions Runner Controller

**June 4th, 2026 - 9:54 PM EST**

The Ollie build has been queued for 4 hours. Six Docker images sitting in limbo, waiting for a runner that will never come. The GitHub Actions log just says "Waiting for a runner to pick up this job..."

I should probably do something about that.

---

## The Problem: Storage Limits and Broken Dreams

Ollie—my AI workspace assistant—is a beast. Six services, six Docker images, six parallel builds. On GitHub's hosted runners, each one gets its own ephemeral VM with... not enough storage. The builds fail halfway through with cryptic disk space errors.

The solution seemed obvious: self-hosted runners on Eldertree. I've got 116GB of NVMe storage per node. Plenty of room for Docker layer caching, build artifacts, and the inevitable mess.

I deployed Actions Runner Controller (ARC) v0.14.2 via FluxCD. The controller came up. The listener pod started. Everything looked green.

Except nothing worked.

## Hour 1: The Mystery of the Missing Scale Set ID

The symptoms were clear:
- Listener pod crashlooping every 3 seconds
- Logs showing: `404 Not Found: No runner scale set found with identifier 1`
- No `runner-scale-set-id` annotation on the AutoscalingRunnerSet CRD

The controller was trying to connect to scale set ID 1, which didn't exist. But why ID 1? Where did that come from?

I checked everything:
- GitHub token? ✅ Valid, correct scopes (`repo`, `workflow`, `admin:org_hook`)
- Helm configuration? ✅ Looked correct
- Controller logs? 📝 Just "Registering scale set metrics" but no actual registration

The scale set was there. The controller could see it. But it had never registered with GitHub's Actions API.

**First theory:** Maybe the controller couldn't reach GitHub's API.

```bash
TOKEN=$(kubectl get secret ollie-runner-github-secret -n arc-runners -o jsonpath='{.data.github_token}' | base64 -d)
curl -H "Authorization: token $TOKEN" https://api.github.com/repos/raolivei/ollie/actions/runners
```

Response: `200 OK`. Token works. API is reachable. Theory: busted.

## Hour 2: The RBAC Rabbit Hole

**Second theory:** Missing RBAC permissions.

I checked the controller's ClusterRole:

```yaml
rules:
  - apiGroups: [actions.github.com]
    resources: [autoscalingrunnersets]
    verbs: [get, list, watch, create, update, patch, delete]
```

Wait. The controller **has** full permissions for AutoscalingRunnerSets. So why isn't it reconciling them?

I grepped the controller logs for "AutoscalingRunnerSet":

```
2026-06-05T05:20:21Z	INFO	AutoscalingRunnerSet	Deleting resources
2026-06-05T05:20:21Z	INFO	AutoscalingRunnerSet	Deleting the listener
2026-06-05T05:20:21Z	INFO	AutoscalingRunnerSet	deleting runner scale set
```

**Deleting?!**

The controller wasn't creating. It was *destroying*.

## The Smoking Gun: Stuck in Deletion

I checked the AutoscalingRunnerSet YAML:

```yaml
metadata:
  deletionTimestamp: "2026-06-05T01:35:22Z"
  finalizers:
  - autoscalingrunnerset.actions.github.com/finalizer
```

There it was. The CRD had been marked for deletion—probably from my earlier troubleshooting attempts—but the finalizer kept it alive. The controller kept trying to delete it, failing on an RBAC error, and retrying forever.

It was zombie infrastructure. Not quite alive, not quite dead.

**Why the deletion kept failing:**

```
ERROR: Failed to remove finalizers on dependent resources
Error: serviceaccounts "ollie-eldertree-gha-rs-no-permission" is forbidden
User cannot patch resource "serviceaccounts" in namespace "arc-runners"
```

The controller needed to patch ServiceAccounts to remove finalizers, but my custom ClusterRole only gave it permissions for secrets and roles. Not service accounts.

## The Fix (Part 1): Breaking Free

Two options:
1. Fix the RBAC and wait for the deletion to complete naturally
2. Nuke it from orbit and start fresh

I chose violence:

```bash
kubectl patch autoscalingrunnerset ollie-eldertree -n arc-runners \
  --type=json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
```

The finalizer vanished. The CRD deleted immediately. The listener pod disappeared.

Then Flux did what Flux does best: reconciled the desired state. A fresh AutoscalingRunnerSet appeared, clean and ready.

The controller logs changed:

```
2026-06-05T05:37:20Z	INFO	AutoscalingRunnerSet	Creating resources
2026-06-05T05:37:20Z	INFO	AutoscalingRunnerSet	Creating listener
```

**Creating!** Finally!

And then:

```yaml
metadata:
  annotations:
    actions.github.com/runner-scale-set-id: "2"
```

**It had an ID.** The scale set was registered with GitHub.

## Hour 3: RBAC Whack-a-Mole

The listener was stable. The scale set was registered. Runner pods should start appearing any second now.

Any second...

Still waiting...

I checked the EphemeralRunner resources:

```bash
kubectl get ephemeralrunner -n arc-runners
```

```
NAME                                 STATUS   MESSAGE
ollie-eldertree-bxbzh-runner-dkm9c   Failed   pods is forbidden: cannot create resource "pods"
```

*Of course.*

The controller couldn't create pods. I updated the RBAC:

```yaml
- apiGroups: [""]
  resources: [pods]
  verbs: [get, list, create, delete, watch]
```

Applied it. Deleted the failed EphemeralRunners. Waited.

New EphemeralRunners appeared:

```
NAME                                 STATUS   MESSAGE
ollie-eldertree-bxbzh-runner-8h27l   Failed   secrets is forbidden: cannot create resource "secrets"
```

*Double of course.*

The controller needed to create JIT configuration secrets for each runner. Updated RBAC again:

```yaml
- apiGroups: [""]
  resources: [secrets]
  verbs: [get, list, create, update, patch, delete]
```

Applied. Deleted failed runners. Waited.

Third time's the charm?

## Hour 4: Victory at the Buzzer

```bash
kubectl get pods -n arc-runners
```

```
NAME                                 READY   STATUS    RESTARTS   AGE
ollie-eldertree-bxbzh-runner-b6262   2/2     Running   0          30s
ollie-eldertree-bxbzh-runner-8h27l   0/2     Pending   0          15s
ollie-eldertree-bxbzh-runner-8mbt4   0/2     Pending   0          15s
```

**RUNNER PODS!**

One running, two pending (the cluster was at CPU/memory capacity—Raspberry Pis have limits).

I checked the running pod's logs:

```
[WORKER 2026-06-05 05:42:42Z INFO] Working directory: '/home/runner/_work/ollie/ollie'
[WORKER 2026-06-05 05:42:42Z INFO] Starting upload of step log file to results service
```

**IT WAS EXECUTING THE JOB.**

Four hours after the build was queued, a self-hosted runner finally picked it up.

## The Lessons (Or: What I Should Have Known)

### 1. CRDs Can Get Stuck in Deletion Hell

Kubernetes finalizers are useful for cleanup, but they create dependency chains. If something in that chain breaks (like RBAC), the resource gets stuck in limbo.

**The fix:** Check for `deletionTimestamp` when resources act weird:

```bash
kubectl get <resource> -o jsonpath='{.metadata.deletionTimestamp}'
```

If it's set and the resource won't delete, check the events and controller logs for the blocking error.

### 2. Controllers Need More RBAC Than You Think

The official ARC Helm chart includes a full ClusterRole for the controller. I thought I was being clever by creating a minimal custom ClusterRole for cross-namespace operations.

I was not clever. I was creating more work for myself.

The controller needs:
- **Secrets:** create (JIT runner tokens)
- **Pods:** create (runner pods)
- **ServiceAccounts:** patch (finalizer removal)
- **Roles/RoleBindings:** full CRUD (listener pod permissions)

If any of these are missing, runners won't provision. The errors are buried in controller logs, not surfaced to the user.

### 3. GitHub Token Scopes Matter (But Weren't the Problem)

I spent time verifying the token had `repo`, `workflow`, and `admin:org_hook` scopes. It did. The token worked fine.

The registration failure wasn't an auth issue—it was the stuck deletion preventing registration from ever happening.

**But:** if your token is wrong, you'll see `401 Unauthorized` or `403 Forbidden` in listener logs. Mine showed `404 Not Found: scale set ID 1 doesn't exist` because it was using a default/fallback ID.

### 4. Listener Logs Tell the Real Story

The listener pod's logs were a goldmine:

```
time=2026-06-05T05:28:30.692Z level=DEBUG msg="performing request" 
method=POST url="https://broker.actions.githubusercontent.com/rest/_apis/runtime/runnerscalesets/1/sessions"

2026/06/05 05:28:30 Application returned an error: 
failed to create message session: 404 Not Found: 
No runner scale set found with identifier 1
```

That URL—`runnerscalesets/1/sessions`—was the clue. The listener was trying to connect using ID 1, which meant the controller had never assigned a real ID.

If the listener is crashing with a 404, the scale set never registered. Check the AutoscalingRunnerSet for the `runner-scale-set-id` annotation.

### 5. Flux Saves You From Yourself

After I removed the finalizer and the CRD deleted, I didn't have to manually recreate anything. Flux saw the drift and reconciled:

```
✔ HelmRelease annotated
◎ waiting for HelmRelease reconciliation
✔ applied revision 0.14.2
```

Fresh AutoscalingRunnerSet, clean state, successful registration.

GitOps means your mistakes are fixable. Just delete the broken thing and let Flux bring it back.

## The Aftermath: Runners in Production

The Ollie build completed 6 hours after it was queued. All six Docker images built successfully on the self-hosted runner. No storage errors. Docker layer caching worked perfectly.

Current state:
- **Scale set registered:** ✅ (ID: 2)
- **Listener stable:** ✅ (1/1 Running)
- **Runners auto-scaling:** ✅ (0-3 based on queue)
- **Cluster capacity:** ⚠️ (1 runner running, 2 pending—Pi limits)

The pending runners are expected. Three parallel Docker builds on Raspberry Pi 5s max out the CPU and memory. The runners queue up and execute sequentially.

That's fine. The queue sorts itself out. The builds complete. And I don't pay GitHub for runner minutes.

## The Real Cost

**Time invested:** 4 hours of debugging + 1 hour of RBAC fixes  
**Coffee consumed:** 3 cups (cold by the end)  
**Dignity remaining:** Questionable  

**Was it worth it?**

For Ollie's build workload alone? Probably not. I could have just purchased more GitHub Actions minutes.

But I didn't do this for Ollie. I did it because:
1. I wanted to learn ARC's architecture
2. I needed to understand CRD deletion mechanics
3. I enjoy debugging things at 2 AM (I may need help)

And now I have a reusable pattern for all my repos. The next runner scale set will take 10 minutes to deploy, not 5 hours.

That's the infrastructure game: spend 5 hours so the next person (future me) spends 5 minutes.

## The Documentation That Didn't Exist

After solving this, I added comprehensive docs to the pi-fleet repo:

**`docs/ARC_RUNNERS.md`**
- Architecture diagram
- Installation guide
- RBAC requirements (the full list)
- Troubleshooting section (including the deletion hell fix)
- How to add runners for additional repos

**`clusters/eldertree/arc-controller/controller-secrets-clusterrole.yaml`**
- The complete RBAC manifest
- Comments explaining *why* each permission is needed
- Reference to the GitHub issue where I learned this the hard way

Because the next time I break this (and there will be a next time), I want to spend 5 minutes reading my own docs, not 5 hours rediscovering the same lessons.

## What's Next

Now that runners work, the next challenges:

1. **Runner scale optimization** - Can I squeeze more than 1 concurrent build on the cluster?
2. **Build time improvements** - Docker layer caching is working, but can I preload base images?
3. **Multi-repo support** - Add runner scale sets for other projects (canopy, swimTO, personal-website)
4. **Monitoring** - Export ARC metrics to Prometheus/Grafana
5. **Failure handling** - What happens when a runner crashes mid-build?

But those are problems for another night.

For now, the runners work. The builds complete. And I can finally close the 92 browser tabs I opened during this debugging session.

Maybe.

Probably not.

---

**Commit:** `feat: deploy ARC for self-hosted runners`  
**PR:** [#217](https://github.com/raolivei/pi-fleet/pull/217)  
**Lines changed:** +422, -563  
**Lessons learned:** Several. Most of them painful.  

**Status:** ✅ Merged to main

---

*Next: Chapter 11 - Monitoring the Chaos (Or: Grafana Dashboards for Everything)*
