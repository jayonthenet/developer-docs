---
title: "Providers intro"
description: "Introduction on providers"
mermaid: true
draft: true # This page is made for being included in other pages, not standalone
---

Terraform/OpenTofu does not allow modules to contain their own Terraform provider configurations and these must be injected externally. To support this, the Orchestrator allows common [providers]({{< relref "/platform-orchestrator/docs/configure/providers" >}}) to be configured centrally with a particular configuration. This allows multiple modules that use the same cloud APIs or platforms to share provider configurations.
