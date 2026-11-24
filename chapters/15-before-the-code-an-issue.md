---
description: How a SwimTO epic, a discovery issue and a merged PR preserve the scope and limits of a larger engineering change.
---

# Chapter 15: Before the Code, an Issue

The November backlog audit made me look at how work ends. A closed ticket could mean a fix, an explanation, or a merge that still needed checking in the environment where it would run.

There is another part of that story: how the work gets onto the list in the first place.

“Add the missing pools” sounds like a feature I can start implementing. In SwimTO, it also means deciding which source identifies a pool, how to match its schedules, what to do when a location has no published programs, and how to keep the list current. Those are different questions. If I hand the whole request to an assistant as one task, I still have to decide which answer would count as finishing it.

Looking back at the June work, the useful record starts before the feature PR. An epic held the larger goal. Child issues made pieces of it concrete. The PR linked the implementation back to both.

## The epic keeps the bigger question

On June 12, 2026, I opened [SwimTO epic #178](https://github.com/raolivei/swimTO/issues/178) for full Toronto public pool coverage and an auto-discovery pipeline.

The ticket recorded a baseline, targets, phases and an implementation order. Discovery came first. Database identifiers and schedule matching followed. A registry, periodic discovery and coverage reporting were further pieces of the plan.

Those targets were the work I wanted to achieve. Writing them into an issue didn't establish that I had achieved them.

That is what makes the epic useful to me. It holds the reason for several changes without asking one pull request to stand in for the whole result. I can inspect a discovery script and still ask what happened to matching, registration and recurring checks.

## A smaller issue asks a smaller question

The [discovery issue, #179](https://github.com/raolivei/swimTO/issues/179), explicitly says it is part of #178. It was opened the same day.

Its scope was specific: read the city's facility and location data, identify pool locations, check for swim programs, probe the schedule endpoint, classify the results, and produce a report against the existing lists. It also described report-only and registry-writing options and a probe limit.

The acceptance criteria named a runtime target and an approximate inventory size. Those were criteria to check, not measurements I can claim simply because the issue later closed.

That smaller question matters before implementation. A report gives me something to inspect before treating every discovered location as a facility the application should publish. Finding a location and deciding how to register it are related, but they need different evidence.

The timestamps show that the issues preceded the feature commits and PR. They don't tell me when I first experimented locally. I don't need to turn a documented sequence into a claim that I have always written the perfect issue before touching code.

## The PR carries the connection back

On June 20, [PR #211](https://github.com/raolivei/swimTO/pull/211) described the discovery work and changes to outdoor pool coverage. Its body included a small, useful sentence:

> Closes #179, advances #178 (Phase 1).

That distinguishes two scopes. The PR claims to complete the child issue while advancing part of the larger effort. It doesn't claim to close the epic.

The PR merged that day, and the child issue is closed. At this November review, the epic remains open.

The record also shows where my process was less tidy. That PR included mobile schedule fixes alongside discovery and coverage work. Linking an issue doesn't automatically make the change focused. A reviewer still has to understand what belongs together and what could have been reviewed separately.

Its test plan has checked items for type checking and sample schedule fetches. It also has unchecked staging, API and mobile checks. I can describe the merged implementation and the checks recorded there. I can't turn those unchecked boxes into a verified production result.

This is one reason I want the links to survive. They let the next review question the summary instead of inheriting it as fact.

## Leaving something the next session can use

I work across repositories and AI assistants. A conversation is useful for exploring an approach, but the next session needs the decision and the remaining question somewhere it can find them.

For pool coverage, the issue belongs in SwimTO because that repository owns the application and pipeline. Cluster deployment work belongs with the infrastructure that owns it. A cross-repository change needs explicit links between those records; moving all the context into one long chat doesn't establish ownership.

An epic preserves the goal and relationships. A child issue preserves the bounded question and acceptance criteria. A PR preserves the proposed implementation and review. Checks and deployment observations add evidence about the result.

None of those records replaces the others. The benefit is being able to follow the thread without asking an assistant to reconstruct it from a summary that may have lost the qualification “still needs checking.”

## What I want to do more consistently

The June example gives me a pattern to improve, rather than a process I can declare finished.

Before a substantial change, I want to record the observation, the evidence I already have, and what would establish a useful result. If several independently reviewable changes serve one goal, an epic can hold that goal while smaller issues hold the work. A small correction doesn't need an epic just to follow a template.

In a PR, I want to distinguish the issue it completes from the larger work it only advances. During review, I want acceptance criteria checked against evidence, with outstanding checks named explicitly. After merge, I still need the running version and the behavior that started the work checked in the target environment.

That last part connects back to [the November audit](/chapters/14-the-ticket-was-real). Issue closure and deployment verification had not always moved together. Better linking makes the gap easier to see; it doesn't close it by itself.

For this blog, the same discipline starts before a new story. I want a clear question, sources, overlap with existing chapters, and the claims I can support. An issue can keep those decisions while the draft changes. A PR can then show the actual editorial change instead of becoming the first place anyone asks what the story is about.

The useful outcome is a trail I can continue: why the work exists, which part this change addresses, and what remains to be demonstrated. That is more valuable than a backlog full of confident titles.

*Written November 2026, revisiting the June 2026 SwimTO work. Operational procedures live in the [runbook](https://docs.eldertree.xyz/).*
