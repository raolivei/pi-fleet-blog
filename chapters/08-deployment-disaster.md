# Chapter 8: The Great Deployment Disaster

It started, as all good disasters do, with a simple question: *"Why isn't SwimTO deploying?"*

That was January 16, 2026. Morning. Coffee in hand. I'd merged a PR to SwimTO the night before—just a small fix, nothing fancy. The GitHub Actions workflow ran green. The Docker image built successfully. The `pi-fleet` GitOps repository should have updated automatically with the new image tag. FluxCD should have reconciled. Pods should have restarted.

Except none of that happened.

The pods were still running the old image. No update. No restart. Nothing.

I checked the workflow logs. Green checkmarks. I checked GHCR. New image, tagged correctly. I checked the `pi-fleet` repo. No new commit.

That's when I knew: this was going to be one of those days.

## Act I: The JSON That Wasn't

The SwimTO deployment workflow uses a GitHub repository dispatch event to trigger an update in `pi-fleet`. The idea is simple: after building the image, fire a webhook to `pi-fleet` with the new image tag. A workflow there creates a PR updating the Kubernetes manifest.

Except the webhook wasn't working. The error message in the logs:

```
For 'properties/client_payload', "{\"project\":\"swimto\"...}" is not an object.
```

Ah. Of course. JSON.

The problem: GitHub CLI's `-f` flag treats everything as a string. Even when you lovingly craft your JSON with escaped quotes like you're defusing a bomb. The payload was being sent as a string, not an object.

**Fix attempt #1:** Change `-f` to `-F` (which handles JSON values).

I pushed the fix. Reran the workflow. Still broken. Different error, same problem.

Turns out, shell quoting and the GitHub CLI have a complicated relationship. The single quotes around the JSON were being interpreted in ways that would make a parser cry.

**Fix attempt #2:** Use a heredoc.

```bash
gh api repos/raolivei/pi-fleet/dispatches --method POST --input - <<EOF
{
  "event_type": "deploy-image",
  "client_payload": {
    "project": "swimto",
    "image": "ghcr.io/raolivei/swimto-api:v0.5.2"
  }
}
EOF
```

Heredocs don't care about quoting. They're a boundary. Everything inside is literal. This is how civilized people handle JSON in shell scripts.

Third try. The dispatch finally worked. Progress!

## Act II: The StorageClass Catastrophe

With the webhook fixed, surely the deployment would work now, right?

*Narrator voice: It did not.*

FluxCD showed the SwimTO kustomization as "Not Ready" with a delightfully unhelpful message:

```
StorageClass/local-path dry-run failed: provisioner: Required value
updates to provisioner are forbidden
```

Translation: "Your YAML is bad and you should feel bad."

I dug into the `pi-fleet` manifests. Someone (definitely not me, surely) had created a patch for the `local-path` StorageClass that was missing the `provisioner` field. Because Kubernetes requires that field. Because of course it does.

The patch looked like this:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-path
# ... missing provisioner field
```

Kubernetes saw this and said: "You're trying to update a StorageClass, but you're not specifying the provisioner, which is required and immutable." Fair point, Kubernetes. Fair point.

**Fix #3:** Add the missing `provisioner: rancher.io/local-path` field.

Pushed the fix. FluxCD reconciled. The StorageClass was happy. Resources started appearing.

We were making progress. Slowly. Painfully. But progress nonetheless.

## Act III: The Authentication Apocalypse

Pods were now being created! Celebration! Confetti! I could almost hear the sound of success.

Then I checked the pod status:

```
ImagePullBackOff
Error: 403 Forbidden
```

*Record scratch.*

The GHCR Personal Access Token had expired. All four applications using it (SwimTO, Pitanga, OpenClaw, docs) simultaneously decided they couldn't pull images anymore. Because of course they all used the same token. And of course it expired on the same day I was debugging something completely unrelated.

The ExternalSecret was pointing to `secret/canopy/ghcr-token` in Vault. Why `canopy`? Who knows. Historical reasons. The kind of path that made sense six months ago and now just confuses everyone.

I generated a new PAT in GitHub (read:packages, write:packages), updated Vault, forced the ExternalSecrets to refresh.

**Fix #4:** New token, correct path, secrets synced.

Images started pulling! Progress! Surely this was the last issue.

*Narrator voice: It was not.*

## Act IV: The Nginx Nemesis

Status check:
- **swimto-postgres:** Running ✅
- **swimto-redis:** Running ✅
- **swimto-api:** Running ✅
- **swimto-web:** CrashLoopBackOff ❌

So close.

I checked the logs:

```
nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
```

Right. Security best practices. The container runs as non-root (UID 1000), which is good. But nginx wants to write to cache directories, which don't exist and aren't writable, which is bad.

The fix: add emptyDir volumes for nginx's cache directories.

```yaml
volumes:
  - name: nginx-cache
    emptyDir: {}
  - name: nginx-run
    emptyDir: {}
  - name: nginx-tmp
    emptyDir: {}

volumeMounts:
  - name: nginx-cache
    mountPath: /var/cache/nginx
  - name: nginx-run
    mountPath: /var/run
  - name: nginx-tmp
    mountPath: /tmp
```

EmptyDir volumes are ephemeral storage created when the pod starts and deleted when the pod stops. Perfect for temp files. Nginx gets writable directories. The container stays non-root. Everyone's happy.

**Fix #5:** EmptyDir volumes for nginx.

I pushed the fix. Waited for FluxCD to reconcile. Watched the pods restart.

All green.

## Act V: The Resurrection

After five fixes, four PRs to `pi-fleet`, three PRs to `swimTO`, two expired tokens, and a partridge in a pear tree, the final status:

| Service       | Status      |
|---------------|-------------|
| postgres      | ✅ Running  |
| redis         | ✅ Running  |
| swimto-api    | ✅ Running  |
| swimto-web    | ✅ Running  |

The cluster lived. The deployment worked. The pipeline was whole again.

I tested the app. Login worked. Google OAuth worked. Pool schedules loaded. Everything functional.

It was done.

## The Tally

Looking back at the debugging session:

| Metric                                  | Value      |
|-----------------------------------------|------------|
| PRs created                             | 7          |
| PRs merged                              | 7          |
| Root causes discovered                  | 5          |
| Times I questioned my career choices    | 12         |
| Times FluxCD said "Not Ready"           | Lost count |
| Hours spent                             | Too many   |
| Coffee consumed                         | Not enough |
| Current pod status                      | Green ✅   |

## The Lessons (Learned the Hard Way)

**JSON in shell scripts is a war crime.** Seriously. Use heredocs. Always. The 30 seconds you save with inline JSON will cost you 30 minutes of debugging escaped quotes.

**Kubernetes patches need to be valid resources.** If you're creating a patch that Kubernetes treats as a full resource, it needs all required fields. "It's just a patch" doesn't exempt you from schema validation.

**Tokens expire.** Set calendar reminders. Or use something that auto-rotates. Or just accept that you'll be debugging this again in 90 days. (I chose acceptance.)

**Nginx and non-root containers are frenemies.** They'll work together, but only if you provide the right emptyDir offerings. Treat it like a sacrifice to the container gods.

**"Quick fix" is a myth.** Every quick fix has three more fixes hiding behind it, waiting to jump out and yell "surprise!"

**Automation is only as good as your last edge case.** The workflow worked perfectly for months. Then one small assumption (JSON serialization) broke, and the whole pipeline stopped.

## Epilogue

As I write this, SwimTO hums along quietly. Pods running. Images pulling. Secrets... secreting? The pipeline is automated. The deployment is GitOps-driven. Everything is as it should be.

Until the next token expires.

*See you in 90 days.*

---

*Next: [Chapter 9: The Tailscale Treachery](/chapters/09-tailscale-treachery) - When the VPN decided Kubernetes traffic looked interesting and claimed it for itself.*
