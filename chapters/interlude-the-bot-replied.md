---
description: "An OpenClaw recovery, a local Qwen–Nemotron comparison, and the failed coding task that changed what I meant by working."
head:
  - - meta
    - property: og:title
      content: "The Bot Replied. The Work Wasn't Done."
  - - meta
    - property: og:description
      content: "An OpenClaw recovery, a local Qwen–Nemotron comparison, and the failed coding task that changed what I meant by working."
  - - meta
    - property: og:type
      content: "article"
  - - meta
    - property: og:url
      content: "https://blog.eldertree.xyz/chapters/interlude-the-bot-replied"
---

# The Bot Replied. The Work Wasn't Done.

I asked my Telegram assistant to work on a GitHub issue. It read the repository, described the problem, and gave me a detailed plan. I told it to go ahead.

It gave me another plan and asked whether I wanted it to execute.

I said yes again. About 46 minutes later, I got an error about context compaction. There was no pull request.

Earlier that day, I had verified normal replies, tested compaction, and compared three local models. Those checks were real. So was the failed task. I had to stop treating them as answers to the same question.

## The assistant had another computer attached

Eldertree is my K3s cluster on three Raspberry Pis. OpenClaw provides the assistant gateway and Telegram connection. Elder supplies operational and repository capabilities. Ollie, the workspace assistant I described in [Chapter 10](/chapters/10-building-ollie), handles a different part of the problem: shared context and finding my own documentation.

For OpenClaw's main language model, I was using Qwen 3.6 35B MLX through Ollama on my 48GB Apple Silicon Mac. The gateway ran in Kubernetes; the substantial inference work ran on the Mac. Tailscale connected them.

That distinction became visible on November 19. Telegram commands arrived, but ordinary messages failed. Starting a new conversation didn't help.

The gateway first tried a Mac LAN address it couldn't reach. Its Tailscale route couldn't help while Tailscale was stopped on the Mac. A cluster-local fallback then received a prompt estimated at 27,684 tokens against a 16,384-token context window. Compaction tried the unreachable LAN address again.

The first thing to fix wasn't the conversation history. It was the route to a model that could process the conversation at all.

[The routing correction](https://github.com/raolivei/pi-fleet/pull/336) put both primary inference and compaction on the reachable Tailscale endpoint. There was another mismatch on the Mac: OpenClaw declared a 65,536-token context, but Ollama had actually loaded 32,768. I corrected the model configuration and checked the loaded window rather than trusting the declaration.

Then I checked the layers separately. A model request returned. A full agent turn completed. An isolated conversation compacted. The deployment and Helm release became healthy. Telegram confirmed delivery, and I confirmed that the bot replied normally.

That was a useful recovery. The Mac was still a dependency, and a successful reply was still only one completed turn.

## A local chat model didn't make image generation local

Next I asked for an image. The bot said generation was running, then reported a billing problem.

The logs showed an OpenRouter image request to `google/gemini-3.1-flash-image-preview`, rejected for insufficient credits. Qwen on my Mac wasn't generating that image. A separate capability had selected a separate service.

I had been too loose about calling the setup free. Local inference avoids a model provider's per-request bill, but attaching a paid tool puts that dependency back into the workflow. Even the configured chat fallbacks included removed models and an endpoint that needed credits.

We discussed local image-generation options. We hadn't integrated one. That distinction belonged in the explanation as much as the billing error did.

## I tried Nemotron against the work I actually wanted done

The new Nemotron models were worth investigating. I downloaded Nano 4B and Lightning 30B in MLX variants and compared them with Qwen through the existing Mac Ollama server. No paid inference endpoint was used for these tests.

The small direct suite covered arithmetic, a Kubernetes disk eviction, reporting deployment status without inventing evidence, choosing a tool, summarizing an incident, and finding a marked code inside a roughly 42,000-token prompt. Each case ran twice with thinking disabled and the same configured context and output budget.

All three found the code in the long prompt and selected the correct synthetic pod-listing tool. That was encouraging, but the answers were more revealing than a pass count.

Nano got the arithmetic wrong without reasoning enabled, then corrected it when reasoning was enabled. Its summary mixed causes and fixes. Lightning described a node free-space eviction threshold as though it were a pod storage limit, then suggested using `hostPath` to bypass quotas. A reasoning-enabled retry used its output budget without producing a final answer.

Qwen wasn't clean either. Its disk answer invented other workloads as the consumer and missed the storage-request correction I wanted. Its summary incorrectly linked the stopped Tailscale connection to the separate LAN failure.

These were synthetic questions, but the mistakes mattered for the intended job. A fluent explanation of an eviction can still lead me toward the wrong change.

I also gave each model the same real task through OpenClaw: use a read-only tool to check the OpenClaw pods and report their names and readiness.

| Model | Observed full agent turn | Outcome |
| --- | ---: | --- |
| Qwen 3.6 35B MLX | 44 seconds | Used the tool and reported live readiness |
| Nemotron 3 Nano 4B MLX | 63 seconds | Eventually reported live readiness; later trace review found recovery behavior |
| Nemotron 3.5 Lightning 30B MLX | 126 seconds | Used the tool and reported live readiness |

Those are observations from one turn per model, not a speed ranking. Qwen used thinking off because the runtime rejected the requested low setting; the Nemotron runs used low. Loading and cache state varied. Repeated direct prompts benefited from caching, and inferred context metadata for model overrides didn't always match the backend window.

The reported model GPU allocation was about 24.4GB for Qwen, 5.6GB for Nano, and 20.6GB for Lightning during the direct suite. Those weren't measurements of peak total Mac memory. Nano's smaller footprint was interesting, but it didn't make its weaker answers disappear.

My initial summary said the tool tests had passed. Looking further into Nano's trace showed a stream ending without a finish reason and a turn that needed final-answer recovery. The eventual answer was accurate. The path to it was less reassuring than my summary suggested.

I kept Qwen as the default. That was a provisional decision from this workload, with known weaknesses, rather than a verdict on the Nemotron family. Transport, reasoning settings, context configuration and the task all affected what I was measuring.

## The plan was the easy part

Later on November 19, I asked Elder to find issues in Canopy, then chose one about bounding financial query resources without truncating totals. I wanted it to follow the repository's patterns, do the work, and open a linked PR.

The assistant produced a plausible assessment and an extensive plan. It named files, classified query paths and proposed tests. After I approved execution, the turn eventually failed.

The investigation found repository reads and history inspection. It didn't find a code modification or the requested PR. The plan hadn't crossed into implementation.

The delay needed its own investigation. On the Mac, Qwen finished ingesting a compaction prompt, then stopped producing visible progress. OpenClaw abandoned the silent request after three minutes. The Mac-side request continued and finally completed about 45 minutes after it began. Subsequent requests waited behind it and timed out.

That sequence explained more than the final context warning. A client timeout hadn't ended the expensive server-side work. Retrying hadn't created a fresh opportunity to answer; requests were accumulating behind the one already stuck. The unreachable LAN routes, undersized Pi model and unusable cloud candidates then supplied more ways for recovery to fail.

The logs established the silent generation and delayed completion. They didn't establish every internal reason for it. Runaway hidden thinking and MLX transport behavior were investigation leads, not conclusions I could prove just by finding a similar issue report.

## A shorter failure path is still unfinished work

[The follow-up change](https://github.com/raolivei/pi-fleet/pull/338) removed those automatic chat fallbacks and explicitly disabled compaction reasoning in the configuration. It was merged on November 20. That merge is evidence of a configuration change, not proof that the original generation stall can no longer happen.

At that point, the transport was still relevant. Further investigation identified native Ollama transport and explicit server-side thinking controls as follow-up work. A smaller dedicated compaction model was another candidate. Neither proposal belonged in the November 19–20 account as a completed recovery.

Removing bad fallbacks also meant accepting a clearer dependency: if the Mac couldn't serve the request, I preferred an honest failure to a long tour through models that couldn't complete it. That didn't make the assistant highly available. It made the remaining availability problem easier to describe.

The larger correction was to my definition of success. For a coding task, I need to see the actual change, the tests, the linked PR and the reviewable result. A confident plan doesn't stand in for any of those. For model evaluation, I need the trace behind the answer, including retries and recovery. For context limits, I need what the backend loaded, not just what the gateway advertised.

[Chapter 14](/chapters/14-the-ticket-was-real) was about checking whether a repair was needed before asking for one. This time the work was real, the assistant could describe it, and the implementation still didn't happen.

The bot replying was progress. The missing PR was the more useful test.

For the earlier step—turning a goal into bounded issues and linking the implementation—see [Chapter 15: Before the Code, an Issue, in review](https://github.com/raolivei/pi-fleet-blog/pull/59). This interlude follows the separate question of whether the assistant completed that agreed work.
