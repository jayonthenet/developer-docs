---
title: "Common kubernetes-agent runner snippet on creating keys"
description: "Common kubernetes-agent runner snippet on creating keys"
draft: true # This page is made for being included in other pages, not standalone
---

A common part for both TF and CLI setups is the need for a private/public key pair for the runner to authenticate against the Orchestrator:

```bash
openssl genpkey -algorithm ed25519 -out runner_private_key.pem
openssl pkey -in runner_private_key.pem -pubout -out runner_public_key.pem
```