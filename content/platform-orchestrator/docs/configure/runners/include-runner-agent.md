---
title: "Runner agent"
description: "The kinds of runners using agent or no agent"
draft: true # This page is made for being included in other pages, not standalone
---

For each runner type, the Orchestrator either launches
[runners]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}})
itself or uses an agent component in the target infrastructure.

**Direct**: If the target compute for the runner execution is reachable from the
Orchestrator, the data plane can create a runner itself. This applies, for
example, to runner types using a cloud service with a reachable API.

**Agent**: If the target compute is not reachable from the Orchestrator, install
the runner agent in the target infrastructure. The agent connects outbound to
the installation's operator-provided TLS NATS endpoint and consumes durable,
runner-specific commands from JetStream. Commands remain buffered while the
agent is disconnected. The agent launches runner Jobs in its local compute;
the runner publishes results and encrypted log objects through NATS.
