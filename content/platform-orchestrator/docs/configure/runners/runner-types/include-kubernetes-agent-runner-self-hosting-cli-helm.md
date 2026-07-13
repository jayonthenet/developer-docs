---
title: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
description: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

Append the API endpoint setting to the `helm install` command. Include the version and image overrides only when using a private mirror:

```bash
  --version ${KUBERNETES_AGENT_RUNNER_CHART_VERSION} \
  --set image.repository=${KUBERNETES_AGENT_RUNNER_IMAGE_REPOSITORY} \
  --set image.tag=${KUBERNETES_AGENT_RUNNER_IMAGE_TAG} \
  --set-json platformOrchestrator.extraEnvVars='[{"name":"REMOTE_URL","value":"'${ORCHESTRATOR_API_URL}'"}]' \
  # ... use all other values as shown above
```
