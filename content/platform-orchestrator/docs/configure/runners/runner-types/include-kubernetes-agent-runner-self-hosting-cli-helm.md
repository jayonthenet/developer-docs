---
title: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
description: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

In a [self-hosting](#self-hosting-requirements) setup only, append these settings to the `helm install` command. Remove those that do not apply:

```bash
  --version ${KUBERNETES_AGENT_RUNNER_CHART_VERSION} \
  --set image.repository=${KUBERNETES_AGENT_RUNNER_IMAGE_REPOSITORY} \
  --set image.tag=${KUBERNETES_AGENT_RUNNER_IMAGE_TAG} \
  --set-json humanitec.extraEnvVars='[{"name":"REMOTE_URL","value":"'${ORCHESTRATOR_API_URL}'"}]' \
  # ... use all other values as shown above
```
