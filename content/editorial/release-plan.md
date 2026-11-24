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

## Executable release queue

Technical prerequisites are code/build dependencies. Editorial order is a reading preference. Navigation ships independently; its existing fixes are merged. Marketing can promote Chapter 14 now because it is a self-contained dated investigation; that does not renumber or reorder the build diary.

| Sequence / priority | Release | PR and prerequisites | Acceptance criteria | Rafael's action | Deployment/public verification | LinkedIn draft | Timing | Status/blocker |
|---|---|---|---|---|---|---|---|---|
| 0 / high | Public navigation | Blog [#52](https://github.com/raolivei/pi-fleet-blog/pull/52), [#54](https://github.com/raolivei/pi-fleet-blog/pull/54); Docs [#10](https://github.com/raolivei/eldertree-docs/pull/10); Elder [#30](https://github.com/raolivei/elder/pull/30); independent | Public destinations, usable labels, mobile layout; Grafana sign-in acknowledged | No repeat merge; review deployed Elder/Docs | Check each public deployment, all corrected Docs targets and Grafana login; merged is not verification | None | Before promoting the ecosystem | All merged; blog footer verified live; fresh full Elder/Docs production sweep remains |
| 1 / high | Launch readiness and Chapter 14 | [#57](https://github.com/raolivei/pi-fleet-blog/pull/57); story #53/#55/#56 already merged | Correct social title/description, evidence-based copy, no private provenance | Review/merge this small PR; choose draft A | Successful Pages deployment; Chapter 14 HTTP 200 with correct heading, metadata and working source links | A in linkedin-drafts.md | After metadata is live and verified | Article already HTTP 200; metadata improvement awaits review |
| 2 / high | Chapter 7 promotion | [#24](https://github.com/raolivei/pi-fleet-blog/pull/24) merged; same launch-readiness PR | No unsupported 2 AM scene; metrics, probes and notification limits retained | Review draft B and publish when ready | Chapter 7 HTTP 200, responsive text, footer and article-specific social card | B | About one week after A; adjust to capacity | Article already HTTP 200 |
| 3 / medium | Chapter 8 | [#25](https://github.com/raolivei/pi-fleet-blog/pull/25); integrate current main first | Resolve conflicts without losing corrections; accurate dispatch/ARC chronology; build and links pass | Review diff and merge | Wait for Pages success; open /chapters/08-deployment-disaster and next/previous links | Not drafted in this release | After first two-post review; narrative continuation | Open, conflicting at check |
| 4 / medium | Chapter 9 | [#26](https://github.com/raolivei/pi-fleet-blog/pull/26); #25 first for current stacked branch | Correct route acceptance, ingress priority and redirect explanation; build passes | Integrate main, review, merge | Verify /chapters/09-tailscale-treachery | Not drafted | After Chapter 8 is verified | Open, conflicting |
| 5 / medium | Chapter 10 | [#27](https://github.com/raolivei/pi-fleet-blog/pull/27); #26 first | Source/index limits, no invented time savings; issue workflow complements Chapter 14 | Integrate main, review, merge | Verify /chapters/10-building-ollie and Chapter 14 cross-link | Prepare only when this chapter is ready | After Chapter 9; potential next featured story | Open, conflicting |
| 6 / medium | Chapter 11 | [#28](https://github.com/raolivei/pi-fleet-blog/pull/28); #27 first | June chronology, actual health API, readiness limits; public Grafana | Integrate main, review, merge | Verify /chapters/11-the-control-center, image and ecosystem links | Not drafted | After Chapter 10 | Open, conflicting |
| 7 / medium | Chapter 12 | [#29](https://github.com/raolivei/pi-fleet-blog/pull/29); #28 first | Preserve missing-evidence caveat; no unperformed timed recovery test | Integrate main, review, merge | Verify /chapters/12-tuesday-night-apocalypse and incident references | Not drafted | After Chapter 11 | Open, conflicting |
| 8 / medium | Chapter 13 | [#30](https://github.com/raolivei/pi-fleet-blog/pull/30); #29 first | Distinguish plans from observed deployment and verified outcomes | Integrate main, review, merge | Verify /chapters/13-whats-next and transition to Chapter 14 | Not drafted | After Chapter 12 | Open, conflicting |
| 9 / optional | Banner refresh | [#45](https://github.com/raolivei/pi-fleet-blog/pull/45); independent of stories | Preserve public endpoints, accessible refresh and honest stale/error states; inspect overlapping changes | Review separately; merge only after conflict resolution and tests | Verify refresh, failure handling and mobile layout | None | Whenever ready | Open, conflicting; not included in editorial changes |

Use merge commits to update branches; append commits only. Do not force-push or amend existing commits. The current chapter stack carries preceding chapters: do not merge a later branch merely to bypass an earlier blocked chapter. Resolve and review one at a time after its predecessor merges, so the final diff stays focused.

If a deployment fails, hold the associated LinkedIn post and preserve the failure evidence. Continue reviewing independent drafts, Docs or Control Center work. Recheck the public URL and deployed content after a successful retry; an HTTP 200 alone can still serve an older page. A blocked chapter does not prevent promoting already verified Chapters 7 and 14.

Start with one substantial LinkedIn launch per week. This leaves time to answer technical comments and verify the next release; it is a capacity recommendation, not an algorithm or audience-activity claim. Do not publish either draft again if it has already been posted; record the actual post URL instead.

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
