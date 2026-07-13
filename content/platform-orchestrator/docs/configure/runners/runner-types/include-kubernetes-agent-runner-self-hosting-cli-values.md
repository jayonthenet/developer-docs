---
title: "Common kubernetes-agent runner snippet on CLI value for self-hosting"
description: "Common kubernetes-agent runner snippet on CLI values for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

Set the API endpoint for your installation. Override the public chart and image locations only when using private mirrors:

```bash
###
# Parameters for this installation
###
# Override the Helm chart registry with your internal OCI registry
export KUBERNETES_AGENT_RUNNER_CHART_REPOSITORY="oci://myregistry.example.com/charts"
# Runner Helm chart version (optional)
export KUBERNETES_AGENT_RUNNER_CHART_VERSION="X.Y.Z"
# Your internal OCI registry for the runner image
export KUBERNETES_AGENT_RUNNER_IMAGE_REPOSITORY="myregistry.example.com/platform-orchestrator/platform-orchestrator-runner"
# Runner image tag (optional)
export KUBERNETES_AGENT_RUNNER_IMAGE_TAG="vX.Y.Z"
# Your internal Orchestrator API endpoint
export ORCHESTRATOR_API_URL="https://my-orchestrator-api.example.com"
```
