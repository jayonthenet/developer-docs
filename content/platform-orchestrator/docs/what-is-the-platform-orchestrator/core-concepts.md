---
title: "Core concepts"
description: ""
lead: ""
draft: false
type: docs
weight: 350
toc: true
aliases:
- /new-orchestrator/docs/what-is-the-new-orchestrator/core-concepts
---

These core concepts are helpful to understand how the Platform Orchestrator works. They can be grouped around _configuring_ the Orchestrator, which is usually performed by platform engineers, and _deploying_, which is utilizing the configuration items and is usually performed by developers.

{{% include "/platform-orchestrator/docs/what-is-the-platform-orchestrator/include-tf-only.md" %}}

## Configure

- {{% description "/platform-orchestrator/docs/configure/organizations.md" %}}
- {{% description "/platform-orchestrator/docs/configure/projects.md" %}}
- {{% description "/platform-orchestrator/docs/configure/environments.md" %}}
- {{% description "/platform-orchestrator/docs/configure/environment-types.md" %}}
- {{% description "/platform-orchestrator/docs/configure/resource-types.md" %}}
- {{% description "/platform-orchestrator/docs/configure/modules/overview.md" %}}
- {{% description "/platform-orchestrator/docs/configure/modules/module-rules.md" %}}
- {{% description "/platform-orchestrator/docs/configure/providers.md" %}}
- {{% description "/platform-orchestrator/docs/configure/runners/overview.md" %}}
- {{% description "/platform-orchestrator/docs/configure/runners/runner-rules.md" %}}

## Deploy

- {{% description "/platform-orchestrator/docs/deploy/manifests.md" %}}
- {{% description "/platform-orchestrator/docs/deploy/deployments.md" %}}
- {{% description "/platform-orchestrator/docs/deploy/rollbacks.md" %}}
- {{% description "/platform-orchestrator/docs/deploy/resource-graph.md" %}}

## Object landscape

![Orchestrator object system landscape](/images/tutorial_first_deployment_landscape.png "Orchestrator object system landscape")
