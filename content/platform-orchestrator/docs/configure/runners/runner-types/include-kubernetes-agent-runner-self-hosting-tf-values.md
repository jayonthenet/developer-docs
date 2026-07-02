---
title: "Common kubernetes-agent runner snippet on TF values for self-hosting"
description: "Common kubernetes-agent runner snippet on TF values for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

In a [self-hosting](#self-hosting-requirements) setup only, add and adjust these additional values. Remove those that do not apply:

```hcl
locals {
  ###
  # Parameters for a self-hosting setup
  ###
  #
  # Your internal OCI registry for the runner Helm chart
  kubernetes_agent_runner_chart_repository = "oci://myregistry.example.com/charts"
  #
  # Runner Helm chart version (optional)
  kubernetes_agent_runner_chart_version = "X.Y.Z"
  #
  # Your internal OCI registry for the runner image
  kubernetes_agent_runner_image_repository = "myregistry.example.com/platform-orchestrator/platform-orchestrator-runner"
  #
  # Runner image tag (optional)
  kubernetes_agent_runner_image_tag = "vX.Y.Z"
  #
  # Your internal Orchestrator API endpoint
  orchestrator_api_url = "https://my-orchestrator-api.example.com"
}
```
