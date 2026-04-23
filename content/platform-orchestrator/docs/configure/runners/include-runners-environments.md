---
title: "Runners and environments"
description: "The relationship of runners, environments, and runner rules"
draft: true # This page is made for being included in other pages, not standalone
---

Each [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}) must have exactly one [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) linked to it as a result of the [runner rules]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}) in order to perform a [deployment]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}) into that environment.

The runner creates the link to the Terraform/OpenTofu state for that environment through its state storage configuration.

![Orchestrator runners and configs](/images/platform-orchestrator-runner-config.png "Orchestrator runners and config")

The environment remains linked to a runner even when the runner rules change until the `refresh_runner` [API]({{< relref "/platform-orchestrator/docs/reference/api-spec#Environment" >}}) is called on the environment. This is because changing a runner may lead to dropping access to the previously used Terraform/OpenTofu state and thus a potentially undesired destruction of resources.
