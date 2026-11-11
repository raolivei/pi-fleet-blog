# Chapter 14: The Ticket Was Real. The CI Failure Wasn't.

I managed to put a working CI pipeline on my fix list.

The summary said four of the last five pi-fleet runs had passed. I turned that into a GitHub Issue asking me to investigate the failure, fix the cause, and get a green run.

Reasonable enough. Except I hadn't checked whether anything had actually failed.

This was part of a bigger cleanup on November 6, 2026. I'd collected 21 observations about the Eldertree workspace and turned them into 23 issues. One concern about CI became three tickets, because pi-fleet, SwimTO, and Canopy each needed their own investigation. Keeping everything in one long conversation wasn't going to help the next time I picked it up.

Getting the work out of chat was useful. Calling it all broken was getting ahead of myself.

## The fifth run

The [pi-fleet ticket](https://github.com/raolivei/pi-fleet/issues/328) asked me to separate a code problem from a runner or infrastructure problem. But its acceptance criteria already wanted a correction. I'd left room to investigate which thing was broken, without really leaving room for nothing to be broken.

Then I opened the runs.

Four successes. One cancellation. No `failure` in that sample.

The [cancelled run](https://github.com/raolivei/pi-fleet/actions/runs/40901997358), from October 29, hadn't even executed its validation or version-check steps. The build was skipped. A [second run](https://github.com/raolivei/pi-fleet/actions/runs/40901998313) was created one second later, against the exact same commit, and passed validation, the version check, and the build.

There was already a green run. I just hadn't looked at it closely enough.

The [workflow at that commit](https://github.com/raolivei/pi-fleet/blob/344700ed75d9a9a398e435bec0f94ef7f7a59a40/.github/workflows/build-openclaw-arm64.yml) groups runs by workflow and Git ref, and allows newer PR runs to cancel older ones. The timing fits that explanation. I couldn't independently prove the exact reason for the cancellation, but I could establish that this wasn't evidence of a failed build needing a patch.

So I put the run links and the explanation in the issue and closed it. No PR. The broader runner and GitOps issues stayed open; answering this particular question didn't answer those.

I'd written acceptance criteria that could have sent me looking for a code change to justify a bad summary. Checking the runs saved me from following through on that.

## The other tickets didn't get the same answer

[Canopy's CI ticket](https://github.com/raolivei/canopy/issues/106) was about silence: nothing had run since June. Its latest main-branch commit was from June 23, and the [build for that push](https://github.com/raolivei/canopy/actions/runs/28061279412) had passed. At the audit, there were no later PRs. The three workflows were active, and none had a periodic schedule.

There hadn't been a new push or PR to trigger anything. I closed that investigation too, with that explanation. It didn't tell me whether a runner would work if I pushed something in November. I hadn't tested that.

[SwimTO](https://github.com/raolivei/swimTO/issues/321) was different. Its [Web E2E run](https://github.com/raolivei/swimTO/actions/runs/41191135899) failed while installing Playwright browsers. In a separate [build run](https://github.com/raolivei/swimTO/actions/runs/41191135906), the API's build-and-push step failed while the web build passed.

Those needed more work. I had the failed steps, but I didn't yet have their causes or a tested correction. A passing version check elsewhere wasn't going to fix either of them. The ticket stayed open.

Same original concern about CI. Different evidence, different work to do.

## Why I bother with the issues

I use AI assistants across this workspace, and a conversation can cover a lot of ground. We find something odd, discuss a possible cause, look at another repo, and suddenly the original problem is several screens back. The next session gets a summary. Somewhere along the way, “this might be broken” can become “fix this bug.”

For this cleanup, the issues kept the original observations and explicitly said they still needed checking. They had acceptance criteria. As I investigated, I added the evidence and the decision beside the code it concerned.

That gives me somewhere to continue. I don't have to reconstruct why SwimTO is still on the list, or wonder whether the pi-fleet ticket was closed because somebody fixed it or because there was no failure to fix. The explanation is there.

I also found a different kind of unfinished work: a correction had been merged, but the deployment I checked was still running an older image. The code had moved forward. That environment hadn't caught up. I kept deployment verification outstanding.

That's a gap I want to be more consistent about. For a confirmed bug, I want the observation and reproduction in the issue, a focused PR, review and checks, then a merge. After that, I still need to check the target environment and the behavior that started the whole thing before I call it finished.

I haven't followed that sequence perfectly. Some tickets closed automatically when their PRs merged. The audit made it pretty clear why I shouldn't treat that as the end of every investigation.

## What I actually finished

By the end of the November 6 audit, I'd closed two investigations. Two other tickets had already closed through a merge. Nineteen remained open.

That's the count from that audit, not today's backlog. And it certainly wasn't 23 fixes.

But the next session had a better starting point. The real failures were still there, with evidence attached. The cancelled run had an explanation. The merged work still needing a deployment check hadn't quietly disappeared into a claim that everything was done.

I'll change how I write investigation tickets after this. Ask what happened and what would establish the answer. Leave room to find expected behavior. Don't ask for a fix before I've established a bug.

The commands and recovery procedures belong in the [runbook](https://docs.eldertree.xyz/). This one belongs here because I nearly gave myself a repair job on something that was working, and the issue history is what lets me explain why I stopped.
