# Eldertree release and conversation plan

Status checked November 12, 2026. Recheck GitHub before each merge; this is a review queue, not a deployment record.

## Audience and purpose

For engineers operating small Kubernetes platforms, self-hosters moving beyond installation tutorials, and developers using AI assistants across repositories. Eldertree is a first-person account of decisions, mistakes and investigations on real Raspberry Pi infrastructure. Its value is showing what the evidence established, what changed, and what still needs checking. The blog explains decisions; Docs holds procedures; Control Center shows reported operational state.

## Ranked candidates

| Rank | Story, audience and lesson | Evidence and dates | Overlap, format and recommendation |
|---|---|---|---|
| 1 | The Ticket Was Real. The CI Failure Wasn't. For engineers using CI and AI assistants: investigate the observation before prescribing a repair. | November 6 audit; [pi-fleet #328](https://github.com/raolivei/pi-fleet/issues/328), [Canopy #106](https://github.com/raolivei/canopy/issues/106), [SwimTO #321](https://github.com/raolivei/swimTO/issues/321). | Published Chapter 14, #53/#55/#56 merged. Strong evidence and a distinct, current lesson. Promote next; avoid a duplicate article. |
| 2 | Watching It All. For self-hosters: installing monitoring leaves coverage and notification questions unanswered. | April 29 [observability work #160](https://github.com/raolivei/pi-fleet/pull/160), [scrape adjustment #161](https://github.com/raolivei/pi-fleet/pull/161), June [retention work #200](https://github.com/raolivei/pi-fleet/pull/200). | Published Chapter 7, #24 merged. Specific tradeoffs, clear sources, and ready public page. Promote second; complements rather than repeats the audit. |
| 3 | Building Ollie. For engineers sharing context across assistants: retrieval needs source boundaries and durable issues. | May–June workspace documentation; November source review and citation correction; [existing #27](https://github.com/raolivei/pi-fleet-blog/pull/27). | Improve/review existing Chapter 10; strong reader value but overlaps Chapter 14's issue workflow. Develop after Chapters 8–9; retain the retrieval focus. |
| 4 | Running Wasn't Protected. For operators: a healthy daemon is weaker evidence than demonstrated recovery. | May 26–27 incident records, [hardening #184](https://github.com/raolivei/pi-fleet/pull/184), September incident follow-up. | Existing Chapter 12, #29. Distinct lesson but missing journal evidence limits the causal claim. Develop the existing chapter; procedures belong in Docs. |
| 5 | The Merge Wasn't the Deployment. For GitOps users: code, artifacts, reconciliation and observed behavior are separate milestones. | November audit; November 11 blog artifact-upload failure followed by November 12 [successful deployment](https://github.com/raolivei/pi-fleet-blog/actions/runs/43260631464). | Already covered in Chapter 14. Use a short follow-up discussion; defer a new article until it offers a distinct, fully verified investigation. |

Selection: Chapters 14 and 7 are already developed, evidence-backed and publicly available. This release prepares their launch copy and improves their social metadata rather than inventing two more articles. Existing narrative corrections and chapter numbering are retained.

## Issues as working memory

The observed workflow starts with a repository-specific issue, an observation and acceptance criteria. The audit attached evidence and differentiated a cancelled run (pi-fleet), expected inactivity without scheduled triggers (Canopy), and failed workflow steps requiring more investigation (SwimTO). Closing an investigation can mean expected behavior, not a code fix. These examples are dated audit findings, not claims about current issue status.

An issue preserves the question, source links, hypotheses and next action across sessions and assistants. Chapter 14 explicitly says this was imperfect: some tickets closed automatically at merge, and one observed deployment still used an older image. The recommended lifecycle is observation → evidence/reproduction → issue with acceptance criteria → investigation → focused PR → review/checks → merge → deployed-version and behavior verification → closure. This full sequence is an improvement to apply consistently, not a claim that every historical ticket followed it. Link PRs and deployment evidence back to the issue; leave an explicit follow-up when verification is pending. Operational commands stay in the runbook.

## Executable release queue — refreshed November 23, 2026

Chapters 1–10 and 14, navigation PRs #52/#54, editorial PR #57, Docs #10 and Elder #30 have merged. Prior rows describing them as open are superseded by this snapshot. Recheck checks and main before merging.

| Order | PR | Purpose and dependency | Acceptance and user action | Public verification and promotion |
|---|---|---|---|---|
| Infrastructure first | [#58](https://github.com/raolivei/pi-fleet-blog/pull/58) | Publication check; #57 is already merged | Review workflow, build and revision-check behavior; merge independently | Confirm the post-deploy job validates the actual revision and Chapters 7/14. Holds sharing on stale pages; never posts automatically. |
| Optional, independent | [#45](https://github.com/raolivei/pi-fleet-blog/pull/45) | Banner refresh; no story dependency | Review public endpoints, manual refresh and polling; local build passed, browser interaction review still needed | Verify mobile refresh, stale/error labels and no overlapping requests before promotion of this UI change. No LinkedIn story required. |
| Story 1 | [#28](https://github.com/raolivei/pi-fleet-blog/pull/28) | Chapter 11: Control Center follows published Ollie Chapter 10 | Review June chronology and readiness limits; merge | Verify /chapters/11-the-control-center, screenshot and Grafana/runbook links. |
| Story 2 | [#29](https://github.com/raolivei/pi-fleet-blog/pull/29) | Chapter 12: watchdog investigation; editorial prerequisite #28 | Review missing-journal uncertainty and bounded recovery claims; merge after #28 | Verify /chapters/12-tuesday-night-apocalypse and chapter navigation. No timed recovery claim without evidence. |
| Story 3 | [#30](https://github.com/raolivei/pi-fleet-blog/pull/30) | Chapter 13: dated reflection; editorial prerequisite #29 | Preserve June plans vs November observations; merge after #29 | Verify /chapters/13-whats-next and transition to already published Chapter 14. |
| Already live | Chapter 14, no open PR | November audit connects diagnosis, issues and closure | Existing launch draft A remains available; record whether already posted | Reverify public page before using draft A. Do not duplicate a previous LinkedIn post. |
| Story 4 | [#59](https://github.com/raolivei/pi-fleet-blog/pull/59) | Chapter 15: epic → issue → PR; follows Chapter 14 | Review public SwimTO evidence and observed vs recommended practice; merge after the numbered gap is filled | Verify /chapters/15-before-the-code-an-issue. Use chapter-15-launch.md only after publication. |
| Story 5 | [#60](https://github.com/raolivei/pi-fleet-blog/pull/60) | Dated OpenClaw interlude: tests and replies vs completed work; follows the issue/PR definition in Chapter 15 | Review benchmark qualifications, pending fixes and private-source boundaries; merge after #59 editorially | Verify /chapters/interlude-the-bot-replied and social metadata. Use the existing PR-comment LinkedIn draft after verification. |

All seven branches have been refreshed against current main with new merge commits. Story PRs now contain only their own story and discovery/navigation changes, rather than carrying earlier unmerged chapters. They are technically independent; the story order above is an editorial preference. Future merges can still require a small index/changelog conflict resolution: preserve all published entries, the incoming entry and future review links.

Keep Chapter 15 numbered and the OpenClaw account an interlude. The numbered diary follows build and operating lessons; the interlude is a bounded November 19–20 investigation with its own evidence, not a new claim about the order in which the tools were introduced. Chapters 12 and 15 explicitly revisit earlier evidence. Do not renumber already shared URLs to force strict event chronology.

If a story is blocked, continue independent infrastructure review or promote an already verified article. Do not publish a later numbered chapter merely because its branch builds. Start with one launch post per week after verified publication, leaving room to answer substantive questions. This is a capacity recommendation, not a claim about audience activity or algorithms.

## Lightweight measurement

No article analytics or LinkedIn analytics were accessible in this research. Baselines are unknown, not zero. No tracking was installed. Public page reachability is verified, but it is not an engagement metric.

| Release | Verified public date | LinkedIn post URL/date | Article visits, period/source | Impressions, same observation window | Outbound clicks, if available | Substantive comments/questions | Follow-up decision |
|---|---|---|---|---|---|---|---|
| A — Chapter 14 | HTTP 200 checked Nov 12; deployment date tracked separately | Pending user entry | Unknown | Unknown | Unknown | Pending | Pending |
| B — Chapter 7 | HTTP 200 checked Nov 12; deployment date tracked separately | Pending user entry | Unknown | Unknown | Unknown | Pending | Pending |

Capture available values before posting and seven days after each post, using the same windows. Record whether article visits include other traffic; do not attribute all visits to LinkedIn. Impressions indicate visibility. Useful questions, experience-sharing replies and informed disagreements indicate meaningful engagement. Clicks describe movement toward the article, not proof it was read.

After both observation windows, review the actual questions and the work required to maintain the cadence. If context continuity dominates discussion, prioritise Chapter 10 within its narrative prerequisites. If coverage or recovery testing dominates, develop the monitoring/watchdog follow-up. Two posts are too small a sample for strong audience or timing conclusions; retain the cadence unless workload or a clear recurring question suggests a change.

## Validation and source limits

Earlier private research notes contain the chat provenance and factual audit; they remain outside this public repository. Saved memories and local conversation searches supplied leads, while public code, issues and dated incident records support the articles. No claim of complete Claude, Codex or Ollie archive coverage is made. Memories include superseded conclusions, particularly about watchdog recovery and deployment state.

Homepage and both selected articles returned HTTP 200 on Nov 12, with Blog/Runbook/Control Center navigation. Their live social tags were generic homepage tags, motivating this PR. Earlier desktop/mobile screenshots cover the unchanged prose/layout, including 390px mobile rendering and the corrected Docs hero. This PR changes metadata and excluded editorial files, not layout. Build output must confirm unique article-specific OG tags before merge. LinkedIn's actual cached preview still needs checking after deployment; no claim is made that its scraper has refreshed.
