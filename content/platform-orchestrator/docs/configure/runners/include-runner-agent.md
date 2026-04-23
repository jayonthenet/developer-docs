---
title: "Runner agent"
description: "The kinds of runners using agent or no agent"
draft: true # This page is made for being included in other pages, not standalone
---

For each runner type, the Orchestrator will either launch [runners]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) itself or make use of an agent component to do so.

**Direct**: If the target compute for the runner execution is reachable for the Orchestrator, it can create a runner itself. This is true e.g. for runner types using a cloud-based service where the cloud API is publicly accessible, and shown as scenario (1) in the diagram below.

**Agent**: If the target compute for the runner execution is not reachable for the Orchestrator, the runner type comes with an agent which you install in your infrastructure. The agent creates an outbound, encrypted channel to the Orchestrator and continuously polls for deployment events. For each event, the agent launches a runner and relays the results back to the Orchestrator. This is shown as scenario (2) in the diagram below.

![Orchestrator runners and agents](/images/platform-orchestrator-runner-agents.png "Orchestrator runners and agents")