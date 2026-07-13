---
title: "Custom runner images"
description: "Using custom container image for Platform Orchestrator runners"
draft: true # This page is made for being included in other pages, not standalone
---

A runner is based on a container image which is pulled from the public source `ghcr.io/stellwerk-labs/platform-orchestrator-runner` by default, using one of the recent versions. The most current available version is `{{< param platformOrchestratorRunnerImageVersion >}}`.

You may need to use a custom container image to:

- Pin an image to a specific version
- Pull from ECR or other private registries
- Use an image with custom tooling

The runner execution environment, e.g. a Kubernetes cluster, serverless runtime, or other compute, must be able to pull images from that source.

If you wish to pin the runner version or self-host the image in your own registry and have the runner pull from there, you can override the `image` property in your runner configuration.
