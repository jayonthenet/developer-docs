---
title: "Common runner connectivity section for agent-based Kubernetes runners"
description: "Common runner connectivity section for agent-based Kubernetes runners"
draft: true # This page is made for being included in other pages, not standalone
---

The Kubernetes nodes hosting the runner require outbound access to the
operator-provided TLS NATS endpoint, normally on TCP port 4222. They do not need
inbound connectivity from the Platform Orchestrator installation.

See [connectivity]({{< relref "/platform-orchestrator/docs/security/connectivity" >}}) for more details.
