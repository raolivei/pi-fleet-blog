# LinkedIn launch drafts

Map: release-plan.md rows 1 and 2. Both article URLs returned HTTP 200 on November 12, 2026. Recheck deployed content before posting. These are drafts; publication history and analytics are unknown.

## A — Chapter 14: The Ticket Was Real. The CI Failure Wasn't.

I managed to put a working CI pipeline on my fix list.

The summary said four of the last five pi-fleet runs had passed. I opened a GitHub Issue to investigate the failure, fix the cause, and get a green run.

Reasonable enough. Except I hadn't checked whether anything had actually failed.

The fifth run had been cancelled.

That sent me back through the November backlog with a different question: what does the evidence actually say?

Some tickets needed more investigation. Others could be closed with an explanation. And some merged code still needed checking where it was supposed to run.

I use GitHub Issues so work doesn't disappear between chats and AI assistants. But writing something down doesn't make the diagnosis right. I still have to check.

The Ticket Was Real. The CI Failure Wasn't.
https://blog.eldertree.xyz/chapters/14-the-ticket-was-real

What evidence do you keep in an issue before calling it finished?

#Homelab #GitHubActions

Optional follow-up: explain how the article itself existed on main while the public URL returned 404 because deployment had not completed. Use the dated deployment record; avoid repeating the cancelled-run story. Ask what deployment evidence people attach before closing an issue.

## B — Chapter 7: Watching It All

I had Prometheus, Grafana, and plenty of dashboards. Then I started checking what they were actually monitoring.

A running pod didn't tell me whether someone could reach the application. A dashboard wasn't much help if its metrics weren't being collected. And an alert rule existing didn't mean a notification would reach my phone.

So I went back through the setup on Eldertree, my three-Pi Kubernetes cluster: fixed the Traefik scrape, added URL checks, organised the dashboards, and collected logs I could come back to during an investigation.

One tradeoff was moving metric collection from every 30 seconds to every 60 seconds to reduce load on the Pis. That also meant accepting less detail between samples.

Chapter 7 is about that work—what I could finally see, and what I still hadn't tested.

Watching It All
https://blog.eldertree.xyz/chapters/07-watching-it-all

What have you found missing when you tested your monitoring beyond a green dashboard?

#Homelab #Kubernetes #Observability

Optional follow-up: explain why a five-minute alert threshold intentionally misses short interruptions, and distinguish samples, firing alerts and delivered notifications. This adds the timing tradeoff rather than another tool-list post.
