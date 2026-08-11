---
title: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
description: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

Append the gateway endpoint and private-key Secret settings to `helm install`.
Include the version and image overrides only when using a private mirror:

```bash
  --version ${KUBERNETES_AGENT_RUNNER_CHART_VERSION} \
  --set image.repository=${KUBERNETES_AGENT_RUNNER_IMAGE_REPOSITORY} \
  --set image.tag=${KUBERNETES_AGENT_RUNNER_IMAGE_TAG} \
  --set gateway.url=${RUNNER_GATEWAY_URL} \
  --set gateway.privateKeyExistingSecret=runner-identity \
  # ... use all other values as shown above
```
