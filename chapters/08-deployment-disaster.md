# Chapter 8: The Great Deployment Disaster

The January 15–16 commit history is a fairly good account of how a deployment can be broken in several places at once.

SwimTO's pipeline was supposed to build an image, tell the infrastructure repository which tag to use, and let Flux reconcile the change. That description fits in a sentence. The fixes spread across two repositories and several different layers of the system.

The annoying part was that each fix was small. There was no giant design error to remove and be done with. There was a JSON value passed as a string, a StorageClass definition missing required fields, and a web container that couldn't write where nginx expected to write. Getting past one exposed the next.

## The message between repositories

At the time, SwimTO used GitHub's `repository_dispatch` API to request an image update in `pi-fleet`. The receiving workflow took a project, a component and an image tag, then opened a PR changing the corresponding deployment manifest.

The January 15 fixes show the trouble at that boundary. The caller was passing `client_payload` through `gh api` as a string when the API expected an object. One attempt changed the CLI's `-f` flag to `-F`. That still didn't produce the intended request, so the [next change supplied a JSON body through standard input](https://github.com/raolivei/swimTO/commit/bfb853ad638a6fe5ca9e354d6bee803df72b01c3).

A static example of the payload the receiving workflow expected looks like this:

```bash
gh api repos/raolivei/pi-fleet/dispatches --method POST --input - <<'JSON'
{
  "event_type": "deploy-image",
  "client_payload": {
    "project": "swimto",
    "component": "api",
    "image_tag": "v0.5.4"
  }
}
JSON
```

The field names mattered as much as the JSON shape. The workflow required `component` and `image_tag`; sending a complete image reference under a different field wouldn't satisfy its validation.

The quoted delimiter in this static example prevents shell expansion. The real workflow inserted the version produced by an earlier job, so it also had to account for how that value entered the request. A heredoc made the body easier to read. It didn't absolve the caller of understanding shell expansion or JSON encoding.

This was a new deployment arrangement, still being put together in January. It hadn't run unchanged for months and then mysteriously stopped. The history is messier, and more familiar: I was connecting the pieces while finding out where the assumptions between them didn't match.

## A patch that was being applied as a resource

The next recorded infrastructure fix came just after midnight on January 16. Flux couldn't complete its dry-run because the `local-path` StorageClass definition lacked a `provisioner`.

The filename called it a patch. The Kustomization listed it under `resources`.

That distinction explained why a small file changing a default-storage annotation was being validated as a StorageClass resource. Its name didn't change what Kustomize and Kubernetes did with it. [The fix](https://github.com/raolivei/pi-fleet/commit/942bf533861150bdacf65a9b91100b690e15f780) supplied `provisioner: rancher.io/local-path`, along with the other resource fields.

This wasn't an argument for copying a full object into every patch. It was a mistake in how this particular file was composed and applied. Looking at the little YAML file in isolation had hidden the important part: where it entered the build.

## Nginx needed somewhere to write

The web container had a more ordinary problem. It ran as a non-root user, while nginx expected writable cache, PID and temporary directories.

The [January 16 deployment change](https://github.com/raolivei/pi-fleet/commit/47444d9d7bc7d8552377eb3ebccc764b5ec60b90) mounted `emptyDir` volumes at `/var/cache/nginx`, `/var/run` and `/tmp`. Those were runtime files, so there was no reason to keep them on a persistent volume. The container could stay non-root and still have the writable paths it needed.

An `emptyDir` lasts for the life of its Pod, including container restarts inside that Pod. A replacement Pod gets a new one. That was the behaviour these directories needed.

Registry authentication was another part of getting images into the cluster. On January 15, I added a GHCR login before the pipeline's image-verification step. The Kubernetes deployments also needed their own pull credentials. Authenticating the build job didn't authenticate a node pulling the resulting image; those were separate places to check when the image existed but couldn't be used.

Nor does a final list of running pods establish that every application flow was correct. The OAuth and route fixes that followed on January 20 get their own chapter. There was still work between “the containers start” and a working login.

## June brought a different kind of deployment problem

In early June, I tried moving GitHub Actions builds onto Eldertree. Ollie's multiple images were putting pressure on hosted runner storage, and the cluster offered native ARM64 builds and local NVMe space. The old runner guide described roughly 116GB available per node at that point. It seemed a reasonable place to do the work.

My first version managed the runner lifecycle in a Kubernetes deployment. Registration state and workspace persistence immediately became awkward.

Mounting a volume over `/home/runner` hid the runner binaries already present in the image. Moving the workspace mount avoided that, but the registration files needed separate handling. The [June 4 fix](https://github.com/raolivei/pi-fleet/commit/5b1613812b3f7b88f590a9b67b28f886f7ea94fc) records 139-plus restarts while dealing with that arrangement. I had wanted somewhere to build containers and ended up maintaining the machine that was supposed to build them.

I then replaced the manual deployment with [Actions Runner Controller](https://github.com/raolivei/pi-fleet/pull/215). ARC manages runner scale sets and ephemeral runner pods, with a listener handling queued work. An individual runner can execute its job and disappear, rather than carrying its registration through the restart behaviour of my long-lived deployment.

That was a better fit, but it still had to be installed into this cluster.

The controller and Ollie scale set were defined as HelmReleases managed by Flux. The initial scale set allowed zero to three runners and used Docker-in-Docker. Repository registration, the authentication secret, controller identity and Kubernetes permissions were part of the configuration. Two short `helm install` commands wouldn't have described what I deployed.

And the first commit wasn't the end. On June 5, I added a missing permission to create runner pods. Another fix corrected the controller service-account name used in the runner RoleBinding. The mismatch had blocked JIT secret and pod creation, as well as cleanup. The scale-set chart being installed didn't mean it could already provision a working runner.

I had removed a registration lifecycle I didn't want to maintain. I hadn't removed networking, permissions, scheduling or the need to run an actual build through the result.

## Following the change all the way through

These were different incidents, months apart, but they exposed the same weakness in how I checked my work.

The application build could succeed while the dispatch body was wrong. A manifest could look plausible while the Kustomization applied it in an unexpected way. A runner controller could exist while its permissions prevented it from creating a runner.

I needed to follow the handoff: built image, accepted deployment request, changed manifest, successful reconciliation, ready workload, then the application flow I actually cared about. For CI, that meant watching a queued job acquire a runner and finish, rather than stopping at the Helm release.

The commits are mostly a few lines each. Reading them together makes the work look much smaller than it felt. But they also show why there wasn't one fix that could have finished the whole thing.

---

*Next: [Chapter 9: The Tailscale Treachery](/chapters/09-tailscale-treachery) — when reaching the database depended on which node the application landed on.*
