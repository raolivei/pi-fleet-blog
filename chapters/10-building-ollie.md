# Chapter 10: Building Ollie

I had written down a lot of Eldertree by the time I started building an assistant for it. There were runbooks, project READMEs, changelogs, and notes about decisions I didn't want to make twice. Finding the right piece still meant remembering which repository I'd put it in.

There was another version of the same problem in my editors. I used Cursor and Claude Code, and each session needed context: which project we were working on, how I expected changes to be made, what had already been tried. I could explain it again, or I could give the tools somewhere consistent to read it.

That was the useful idea behind Ollie. I wanted help finding my own work and carrying its context forward. Building that turned out to require more care about documents than about chat bubbles.

## Start with something the next session can read

The simplest part is still one of the most useful: a shared `memory/` directory in the Ollie repository.

`MEMORY.md` points to the other notes. Project files hold context that is worth carrying between sessions. Workspace notes describe conventions. `HANDOFF.md` provides a place to leave the current state and next steps when switching tools.

Cursor reads the workspace instructions and rules. Claude Code's memory location is linked to the same directory. The tools have different ways of loading context, but I don't have to maintain two copies of every convention.

That removes one source of drift. It doesn't make a note current forever. A handoff from June is still a handoff from June, even if every assistant can read it in November. Sharing the file solves duplication; checking its date and evidence is still my job.

The distinction matters because the files look authoritative. A note titled “deployment complete” can outlive the deployment it describes. A plan can sit next to a runbook without looking very different in a search result.

## Finding documents before asking for an answer

Ollie adds retrieval to that shared context. It splits documentation into chunks, generates embeddings, and stores them in ChromaDB. A question retrieves relevant chunks, which the API supplies to a language model as context. That is retrieval-augmented generation, usually shortened to RAG.

I am not training a model on my infrastructure each time I index it. I am building a searchable collection of source material and putting selected passages beside a question.

That sounds like a small distinction until something changes. A new Git commit doesn't update an existing index by itself. A checkout that isn't available to the indexer doesn't become searchable because its name appears in a project list. And retrieving a document about a service doesn't tell me whether that service is healthy now.

The scope needs the same honesty. In the committed implementation I checked in November 2026, the workspace indexer uses a project registry, reads a small list of root documents such as `README.md` and `CHANGELOG.md`, and walks Markdown files under each project's `docs/` directory. It doesn't ingest every source file or every document elsewhere in those repositories. A broader repository-discovery implementation exists in local work, but that isn't the same as a merged release.

So “Ollie knows the workspace” is an ambition. “This answer used these retrieved documents” is a claim I can inspect.

## What the application actually contains

The API is FastAPI. Workspace documentation and conversation memory use separate ChromaDB collections. The repository contains a React frontend as well as an older Streamlit interface; React isn't just a future item on a roadmap.

The chat service I checked tries Ollama first. If that request fails and an OpenRouter key is configured, it can try OpenRouter. That's the implemented fallback path. It doesn't guarantee an answer: the model can be unavailable, the fallback can fail, or the retrieved material can be wrong for the question.

Running inference on my Mac also creates a dependency. Putting the API on Eldertree doesn't make the Mac permanently reachable or give the cluster a model it can run independently. I need to describe those pieces separately when I talk about availability.

The data has its own lifecycle too. The core Dockerfile copies application code, not a prebuilt workspace database. The Helm template mounts persistent storage at `/data` and a read-only workspace directory for documentation. Rebuilding the image is therefore not evidence that the index was refreshed. The serving environment needs access to the intended documents and an index built from them.

The repository has an indexing command, `make index`. What matters after running it is its result: which projects and documents were available, what was indexed, and whether there were errors. A successful application build answers a different question.

## A source label is part of the answer

In November I made a focused correction to workspace search. Project metadata needed to survive into citations, and the meaning of a returned distance needed to be clear. A smaller distance represented a closer match; an absent value needed to remain distinct from zero.

Those details are easy to lose behind a fluent paragraph. If the source loses its project label, checking it becomes harder. If a distance looks like a confidence score, I can give the number a meaning it doesn't have.

The correction was tested and merged. That establishes a change in the repository. It doesn't establish that every running copy of Ollie has it, and it doesn't turn similarity into factual accuracy.

This is the tradeoff I keep coming back to with retrieval. It makes supporting material easier to inspect. It also makes stale material easier to retrieve. The answer still needs to distinguish an old incident note, a proposed fix, committed code, and a dated observation from the running system.

## When a conversation needs an issue

Shared memory helps the next assistant understand my conventions. It is a poor substitute for a work queue.

On November 6, I turned 21 workspace observations into 23 GitHub Issues. One CI concern became separate investigations in pi-fleet, SwimTO, and Canopy. The tickets kept the original observations, marked what still needed revalidation, and supplied acceptance criteria. The investigation then belonged beside the code and workflow it might change.

That gave the next session a concrete place to continue. It could read the question, collect evidence, and update the issue instead of trusting a summary that said something was broken.

The [pi-fleet CI ticket](https://github.com/raolivei/pi-fleet/issues/328) is a good example. Its initial summary needed investigation before anyone could decide whether it needed a patch. The separate [Chapter 14](/chapters/14-the-ticket-was-real) follows the evidence and the different decisions it led to. The important point here is that the tickets allowed different outcomes.

For a confirmed bug, I want the evidence and reproduction to lead to a focused PR, review and checks, merge, verification in the target environment, and closure against the acceptance criteria. The audit showed that I haven't enforced that last boundary consistently. Some tickets closed through a merge; other work still needed deployment verification. I am making that distinction explicit rather than treating a merged PR as proof that the running behavior changed.

Issues carry unfinished work across sessions and assistants. Memory carries the context for doing it. Keeping both useful takes more than saving the conversation.

## What I would build first again

I would start with the shared notes and a narrow, inspectable retrieval path. Both make the existing documentation more useful, and both let me see where the gaps are.

I would be slower to promise complete coverage or automatic freshness. A project registry, an index, and a running service are different things. The practical test is whether I can trace an answer back to material that supports it, then verify the parts that describe today's system.

Ollie is useful when it shortens that path. It can help me find a runbook, recover the reasoning behind a decision, or prepare the next investigation. I still need the [runbook](https://docs.eldertree.xyz/) for procedures, GitHub Issues for work that needs an outcome, and the [Control Center](https://control.eldertree.xyz/) for the operational view.

I wanted less repeated explanation. The better result is having somewhere durable to put the explanation, and a way to check whether it is still true.

---

*Next: [Chapter 11: The Control Center](https://github.com/raolivei/pi-fleet-blog/pull/28) — a place to start checking the cluster, with clear limits on what its health signals establish.*
