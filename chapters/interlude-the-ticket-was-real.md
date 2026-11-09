# Interlude: The Ticket Was Real. The CI Failure Wasn't.

One line in my Eldertree backlog said that four of the last five pi-fleet CI runs had passed. It sat beside similar concerns about SwimTO and a quieter one about Canopy: no workflow activity since June.

That sounded like three broken pipelines. It turned out to be three different questions.

On November 6, 2026, I took 21 observations from my workspace review and turned them into 23 GitHub Issues. The CI item became three tickets, one in each repository. I wanted the investigation beside the code it might change, rather than buried in a conversation about the whole workspace.

Opening the tickets was the easy part. The useful work started when I checked whether their premises were true.

## Four successes and a cancellation

The [pi-fleet investigation](https://github.com/raolivei/pi-fleet/issues/328) started with that four-out-of-five summary. The issue asked for the actual runs, their failed jobs, and a distinction between code, runner, and infrastructure problems. Those were sensible questions. Its acceptance criteria also asked for a correction and a green run, which already leaned too far toward assuming a defect existed.

The sample contained four successful runs and one cancelled run. None had a conclusion of `failure`.

The [cancelled run](https://github.com/raolivei/pi-fleet/actions/runs/40901997358) was created on October 29 at 15:28:55 UTC. The validation and version-check jobs were cancelled before they ran any steps; the build was skipped. A [second run](https://github.com/raolivei/pi-fleet/actions/runs/40901998313), created one second later for the same commit, passed validation, the version check, and the build.

That changed the job. I no longer needed to find the broken code. I needed to understand why an earlier execution had been replaced.

The [workflow configuration at that commit](https://github.com/raolivei/pi-fleet/blob/344700ed75d9a9a398e435bec0f94ef7f7a59a40/.github/workflows/build-openclaw-arm64.yml) groups concurrent runs by workflow and Git ref, and enables cancellation of older runs for pull-request events. The timing was consistent with that behavior. I didn't have independent proof of the cancellation's exact cause, so the conclusion stopped there: this sample showed a cancelled execution followed by a successful one for the same code, not a code or runner failure requiring a fix.

I closed the investigation with the run links and the explanation. No corrective PR was needed. The separate, broader runner and GitOps tickets stayed separate.

Writing a patch just to satisfy the ticket's original wording would have answered the wrong question. The issue had done its job by giving the question somewhere to be answered.

## A quiet pipeline can be doing its job

[Canopy's ticket](https://github.com/raolivei/canopy/issues/106) needed a different check. Its most recent main-branch commit was from June 23. The corresponding [push build](https://github.com/raolivei/canopy/actions/runs/28061279412) had passed. At the November audit, there were no later PRs, the three workflows were active, and their triggers didn't include a periodic schedule.

There hadn't been a new push or PR that called for another run.

I closed that investigation too. I was careful about what the result meant: it explained the lack of activity. It didn't prove that a runner had been tested again in November, or that the next build would pass.

I can get useful evidence from an old green build. I can't quietly turn it into a fresh health check.

## Some tickets really do need fixes

The [SwimTO investigation](https://github.com/raolivei/swimTO/issues/321) stayed open. Its evidence was different: one [Web E2E run](https://github.com/raolivei/swimTO/actions/runs/41191135899) failed while installing Playwright browsers. In a separate [build run](https://github.com/raolivei/swimTO/actions/runs/41191135906), the API's build-and-push step failed while the web build passed.

Those were actual failed steps. The audit established where they failed, but didn't establish their detailed causes or deliver a validated correction. Passing version checks and unrelated successful runs couldn't answer those questions.

That ticket needed more investigation. Closing it alongside the other two would have turned a useful audit into housekeeping theater.

## What the issues kept that the conversation couldn't

The original tickets carried their source observations, stated that those observations still needed revalidation, and supplied acceptance criteria. The follow-up comments recorded the evidence and the decision. A later session could pick up SwimTO's unresolved steps without reconstructing why the ticket existed. It could also see why pi-fleet's investigation had ended without a patch.

That is how I want GitHub Issues to work across my repositories. A conversation helps me notice a problem and explore explanations. The issue preserves the question, what I know, what I'm guessing, and what evidence would let me stop.

The audit also exposed a weaker boundary in that workflow: a merge can close a ticket before the running application has been checked. I encountered merged work and a deployment still running an older image. That observation was enough to keep deployment verification outstanding; it wasn't evidence that the fix had failed.

For a code change, the sequence I want to make explicit is observation, evidence and reproduction, an issue with acceptance criteria, investigation, a focused PR, review and checks, merge, deployment verification, then closure. That is a standard I'm tightening, not a claim that every past ticket followed it. A PR proves what was proposed. A merge proves what reached the branch. Neither tells me what image is running or whether the original behavior has changed there.

An investigation can finish earlier. If the evidence establishes expected behavior, closure needs a clear explanation, not a ceremonial code change.

## The result was a more honest backlog

At the end of the November 6 audit, two investigations were newly closed, two tickets had already closed through a merge, and 19 remained open. Those are the results of that dated audit, not a live count of today's backlog.

I hadn't fixed 23 problems. I'd separated work that needed a correction from work that needed evidence, and from concerns that the evidence had already explained.

The next improvement is small: write investigation criteria that allow either a demonstrated defect or a documented explanation. “Identify the failed run” is the wrong starting point when I haven't established that a run failed.

The detailed operational procedures still belong in the [runbook](https://docs.eldertree.xyz/). This part belongs in the diary because it changed how I decide what work to do. Before I let a ticket tell me to fix something, I need to know what actually happened.
