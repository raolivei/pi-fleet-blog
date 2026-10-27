## Chapter 16: The Great Deployment Disaster of January 2026

> **Date:** January 16, 2026  
> **Time spent:** Way too many hours  
> **Coffee consumed:** Not enough  
> **Sanity remaining:** Questionable

### The Day Everything Decided to Break Simultaneously

It started, as all good disasters do, with a simple question: *"Why isn't swimTO deploying?"*

Ah, the innocence. The naivety. Little did I know I was about to embark on a debugging odyssey that would make Homer proud—if Homer was a DevOps engineer with a Raspberry Pi cluster and an unhealthy relationship with YAML files.

---

### Act I: The JSON That Wasn't

The deployment pipeline looked fine. PRs merged. Workflows green. Life was good.

Except the pods weren't updating. So I checked the deployment workflow, which was supposed to trigger `pi-fleet` via a `repository_dispatch` event. The error?

```
For 'properties/client_payload', "{\"project\":\"swimto\"...}" is not an object.
```

*Chef's kiss.*

Turns out, the GitHub CLI's `-f` flag treats everything as a string. Even when you lovingly craft your JSON with escaped quotes like you're defusing a bomb. The fix? Use `-F` for JSON values.

**Fix #1:** Change `-f` to `-F`.

*Still broken.*

Apparently, shell quoting and the GitHub CLI have a relationship status of "it's complicated." The single quotes around the JSON were being interpreted in ways that would make a parser cry.

**Fix #2:** Use heredoc like a civilized person.

```bash
gh api repos/raolivei/pi-fleet/dispatches --method POST --input - <<EOF
{
  "event_type": "deploy-image",
  "client_payload": { ... }
}
EOF
```

Three PRs later, the dispatch finally worked. Moving on.

---

### Act II: The StorageClass Catastrophe

With the dispatch working, surely now things would deploy, right?

*Narrator: They did not.*

Flux was showing the kustomization as "Not Ready" with this helpful message:

```
StorageClass/local-path dry-run failed: provisioner: Required value, updates to provisioner are forbidden
```

Translation: "Your YAML is bad and you should feel bad."

Someone (definitely not me) had created a "patch" for the local-path StorageClass that was missing the `provisioner` field. Because Kubernetes requires that field. Because of course it does. The patch was being applied as a full resource, not an actual kustomize patch.

**Fix #3:** Add the missing `provisioner` field to make it a valid StorageClass.

Flux reconciled. Resources appeared. Progress!

---

### Act III: The Authentication Apocalypse

Pods were now being created! Celebration! Confetti! 

```
Error: ImagePullBackOff
403 Forbidden
```

*Record scratch.*

The GHCR Personal Access Token stored in Vault had expired. All four applications using it (swimTO, Pitanga, etc.) simultaneously decided they couldn't pull images anymore.

The ExternalSecret was pointing to `secret/canopy/ghcr-token` (because why would it be called something obvious like `secret/ghcr`?). Updated the token in Vault, forced the ExternalSecrets to refresh.

**Fix #4:** Generate new PAT, update Vault at the correct path.

Images started pulling! Victory was within reach!

---

### Act IV: The Nginx Nemesis

swimTO API: Running ✅  
swimTO Web: `CrashLoopBackOff` ❌

```
nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
```

Because the container runs as non-root (UID 1000), and nginx insists on writing to directories that don't exist and aren't writable. Security best practices meet nginx's assumptions about the world.

**Fix #5:** Add `emptyDir` volumes for nginx's cache directories.

```yaml
volumes:
  - name: nginx-cache
    emptyDir: {}
  - name: nginx-run
    emptyDir: {}
  - name: nginx-tmp
    emptyDir: {}
```

---

### Act V: The Resurrection

After five fixes, four PRs to `pi-fleet`, three PRs to `swimTO`, two expired tokens, and a partridge in a pear tree:

| Service | Status |
|---------|--------|
| postgres | ✅ Running |
| redis | ✅ Running |
| swimto-api | ✅ Running |
| swimto-web | ✅ Running |

The cluster lives. The deployment works. The pipeline is whole again.

---

### Lessons Learned (The Hard Way)

1. **JSON in shell scripts is a war crime.** Use heredoc. Always.

2. **Kubernetes patches aren't magic.** They need to be valid resources if you're treating them as resources.

3. **Tokens expire.** Set calendar reminders. Or use something that auto-rotates. Or just accept you'll be doing this again in 90 days.

4. **Nginx and non-root containers are frenemies.** They'll work together, but only if you provide the right emptyDir offerings.

5. **"Quick fix" is a myth.** Every quick fix has three more fixes hiding behind it.

---

### The Final Tally

| Metric | Value |
|--------|-------|
| PRs created | 7 |
| PRs merged | 7 |
| Root causes discovered | 5 |
| Times I questioned my career choices | 12 |
| Times Flux said "Not Ready" | Lost count |
| Current pod status | Finally green |

---

### Epilogue

As I write this, the cluster hums along quietly, pods running, images pulling, secrets... secreting? The pipeline is automated. The deployment is GitOps-driven. Everything is as it should be.

Until the next token expires.

*See you in 90 days.*

---

**Commits from this adventure:**
- `fix(ci): use -F flag for client_payload JSON object` (swimTO #59)
- `fix(ci): use heredoc for repository_dispatch JSON payload` (swimTO #61)
- `fix(ci): use native ARM64 runners instead of QEMU` (swimTO #60)
- `fix(flux): add required fields to local-path StorageClass patch` (pi-fleet #103)
- `fix(swimto): add emptyDir volumes for nginx cache` (pi-fleet #104)
