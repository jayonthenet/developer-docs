---
title: "Runner rules"
description: '_Runner rules_ are attached to _runners_ and define under which circumstances to use which _runner_.'
lead: ""
draft: false
type: docs
weight: 10
toc: true
aliases:
- /new-orchestrator/docs/configure/runners/runner-rules
---

{{% description %}}

{{< include "/platform-orchestrator/docs/configure/runners/include-runners-environments.md" >}}

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

## Basic example

Create an runner rule for the runner `my-runner` and the project `my-project` like this:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_runner_rule" "my-runner-my-project" {
  runner_id  = "my-runner"
  project_id = "my-project"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create runner-rule --set=runner_id=my-runner --set=project_id=my-project
```

{{% /tab %}}
{{< /tabs >}}

## Manage runner rules

{{< tabs >}}
{{% tab name="TF" %}}

Use the resource and data source `platform-orchestrator_runner_rule` in [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/runner_rule#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/runner_rule#schema) to manage runner rules.

You cannot update a runner rule. Changing one of its properties forces replacement.

{{% /tab %}}
{{% tab name="CLI" %}}

Manage runner rules using the `octl` CLI:

```bash
# Create a runner rule
octl create runner-rule --set=runner_id=my-runner --set=project_id=my-project

octl get runner-rules                                        # List all runner rules of your organization
octl get runner-rule 1f8a1ecd-2b06-41de-a646-34717b138582    # Get details on a runner rule
octl delete runner-rule 1f8a1ecd-2b06-41de-a646-34717b138582 # Delete a runner rule
```

You cannot `update` a runner rule. Instead, delete the unwanted one and create a new runner rule with the desired configuration instead.

{{% /tab %}}
{{< /tabs >}}

Runners will remain assigned to their environments even when the relevant runner rule has been deleted until you [refresh the runner](#refresh-the-runner-for-an-environment) for an environment.

## Configuration

A runner rule configuration consists of these elements:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/runner_rule#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/runner_rule#schema) provider documentation.

{{% details "Extended example" %}}

{{% github-file filename="/Platform-Orchestrator/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_runner_rule/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# The ID of the runner this rule applies to (required)
runner_id: my-runner

# An optional project ID to limit the runner to a specific project
project_id: my-project

# An optional environment type ID to limit the runner to a specific environment type
env_type_id: my-environment-type
```

{{% /tab %}}
{{< /tabs >}}

Omitting both `project_id` and `env_type_id` creates an empty runner rule ("match anything").

The Orchestrator will assign a runner rule a technical `id` in uuid format upon creation.

More than one runner rule can be attached to a runner.

There cannot be more than one runner rule with the same configuration.

## Runner assignment to environments

A runner is assigned to an environment on first deployment or when the runner is [refreshed](#refresh-the-runner-for-an-environment). The most specific runner rule matching the environment determines the runner to be assigned.

Runner rules are evaluated from most to least specific in this order:

1. A runner rule configured with `project_id` and `env_type_id`
2. A runner rule configured with `project_id` only
3. A runner rule configured with `env_type_id` only
4. A runner rule with neither `project_id` nor `env_type_id` configured ("match anything")

Example:

- Runner rule configured for runner `A` with a `project_id` of `my-project` and an `env_type_id` of `development`
- Runner rule configured for runner `B` with a `project_id` of `my-project`
- New environment `dev` being created in project `my-project` with an environment type `development`

→ Runner `A` will be assigned because both runner rules match, but the first one is more specific.

## Refresh the runner for an environment

{{< include "/platform-orchestrator/docs/configure/runners/include-refresh-runner.md" >}}
