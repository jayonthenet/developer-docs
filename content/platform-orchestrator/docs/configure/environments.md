---
title: "Environments"
description: '_Environments_ are a sub-partitioning of _projects_. They are usually isolated instantiations of the same project representing a stage in its development lifecycle, e.g. from "development" through to "production". Environments receive deployments.'
lead: ""
draft: false
type: docs
weight: 120
toc: true
aliases:
- /new-orchestrator/docs/configure/environments
---

{{% description %}}

An environment is of exactly one [environment type]({{< relref "/platform-orchestrator/docs/configure/environment-types" >}}).

An environment has a [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) linked to it at any time so it is ready to receive deployments. The runner maintains the Terraform/OpenTofu state for the environment.

An environment with a succesful deployment contains a [resource graph]({{< relref "/platform-orchestrator/docs/deploy/resource-graph" >}}) that is visualized in the Orchestrator console.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

{{% github-file filename="/humanitec/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_environment/resource.tf" %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create environment my-project my-environment --set-yaml=@environment-config.yaml
```

where `environment-config.yaml` is:

```yaml
env_type_id: development
display_name: Development Environment
```
Note: the parent project `id` and the environment `id` are part of the CLI command, e.g. `octl create environment my-project my-environment`, and therefore not shown as part of the configuration.

{{% /tab %}}
{{< /tabs >}}

## Configuration

An environment configuration consists of these elements:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/environment#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/environment#schema) provider documentation.

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# The id of the existing environment type for this environment
env_type_id: development
# Optional human friendly display name for the project
display_name: Development Environment
```

{{% /tab %}}
{{< /tabs >}}

## Lifecycle

On first deployment, the environment will be linked to a [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) based on the existing [runner rules]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}). If the rules cannot match any runner, the deployment will fail. Find more details on [runners and environments](#runners-and-environments) below.

The [environment type]({{< relref "/platform-orchestrator/docs/configure/environment-types" >}}) of an environment cannot be changed.

{{< alert context="caution" >}}
Deleting an environment will delete all real-world resources represented in the environment's [resource graph]({{< relref "/platform-orchestrator/docs/deploy/resource-graph" >}}). Technically, the environment's runner executes a Terraform/OpenTofu `destroy` command against the environment's TF state.

The deletion of an environment and the destruction of all its resources cannot be undone.
{{< /alert >}}

See [destroying environments]({{< relref "/platform-orchestrator/docs/deploy/deployments#destroying-environments" >}}) for more details and options around environment deletion.

## Projects and environments

{{< include "/platform-orchestrator/docs/configure/include-projects-environments.md" >}}

## Runners and environments

{{< include "/platform-orchestrator/docs/configure/runners/include-runners-environments.md" >}}

## Refresh the runner for an environment

{{< include "/platform-orchestrator/docs/configure/runners/include-refresh-runner.md" >}}

## Available resource types

You may query the [resource types]({{< relref "/platform-orchestrator/docs/configure/resource-types" >}}) which are effectively available for deployments into a project environment using the CLI:

```bash
octl get available-resource-types my-project my-environment
```

The list shows the resource types of any [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}) which can be matched to that environment via [module rules]({{< relref "/platform-orchestrator/docs/configure/modules/module-rules" >}}).

The command only shows resource types with the `is_developer_accessible` property set to `true`, i.e. resource types which are available for use in [manifests]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}).

## Promoting deployments between environments

You can promote deployments between environments within the same project. This is usually done to perform the rollout of updates to a project's resources into the next stage. Promoting a deployment in this way does not require access to the [manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) that was used to deploy into an upstream environment.

Use this command to promote a deployment:

```bash
# Promote the last stateful deployment in the "staging" environment into the "production" environment
# in the project "my-project"
octl deploy my-project production environment://staging
```
