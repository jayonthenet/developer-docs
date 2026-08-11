---
title: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
description: "Common kubernetes-agent runner snippet on CLI Helm command for self-hosting"
draft: true # This page is made for being included in other pages, not standalone
---

Append the NATS endpoint and credential Secret settings to the `helm install`
command. Include the version and image overrides only when using a private
mirror:

```bash
  --version ${KUBERNETES_AGENT_RUNNER_CHART_VERSION} \
  --set image.repository=${KUBERNETES_AGENT_RUNNER_IMAGE_REPOSITORY} \
  --set image.tag=${KUBERNETES_AGENT_RUNNER_IMAGE_TAG} \
  --set nats.url=${NATS_URL} \
  --set nats.existingSecret=runner-nats-creds \
  --set nats.jobCredentialsExistingSecret=runner-nats-creds \
  # ... use all other values as shown above
```
