---
title: "Common kubernetes-agent runner snippet on creating keys"
description: "Common kubernetes-agent runner snippet on creating keys"
draft: true # This page is made for being included in other pages, not standalone
---

A common part for both TF and CLI setups is a registration key pair. The public
key is registered with the Orchestrator. The private key is mounted into the
agent from a Kubernetes Secret and signs short-lived gateway tokens:

```bash
openssl genpkey -algorithm ed25519 -out runner_private_key.pem
openssl pkey -in runner_private_key.pem -pubout -out runner_public_key.pem
```
