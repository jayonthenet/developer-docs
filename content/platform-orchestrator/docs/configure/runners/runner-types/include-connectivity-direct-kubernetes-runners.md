---
title: "Common runner connectivity section for non-agent-based Kubernetes runners"
description: "Common runner connectivity section for non-agent-based Kubernetes runners"
draft: true # This page is made for being included in other pages, not standalone
---

The Platform Orchestrator data plane requires network access to the API server of the Kubernetes cluster hosting the runner. Configure the target API server to accept connections from the egress source ranges of your installation.

See [runner connectivity]({{< relref "/platform-orchestrator/docs/security/connectivity" >}}) for more details.
