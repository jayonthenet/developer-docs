---
title: "Common runner connectivity section for agent-based Kubernetes runners"
description: "Common runner connectivity section for agent-based Kubernetes runners"
draft: true # This page is made for being included in other pages, not standalone
---

The Kubernetes nodes hosting the runner require outbound HTTPS access to the
runner gateway, normally `https://<api-host>/runner-gateway` on TCP port 443.
They do not require inbound connectivity from the Platform Orchestrator or
access to its broker.

See [connectivity]({{< relref "/platform-orchestrator/docs/security/connectivity" >}}) for more details.
