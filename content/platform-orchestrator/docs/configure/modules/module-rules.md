---
title: "Module rules"
description: '_Module rules_ are attached to _modules_ and define under which circumstances to use which _module_.'
lead: ""
draft: false
type: docs
weight: 160
toc: true
aliases:
- /new-orchestrator/docs/configure/module-rules
- /platform-orchestrator/docs/configure/module-rules
---

{{% description %}}

## Overview

Module rules provide a way for the Platform Orchestrator to select a module for provisioning a resource in a given context. Each module can have 0 or more module rules associated with it. Each module rule defines 0, 1 or more parts of the context that must match in order for a module to be selected.

When selecting a module, the most specific module rule is chosen. If multiple module rules match the context, the module rule with the most specific criteria filled is selected.

A module with no module rules will not be considered for selection.


## Manage module rules

You can manage module rules using either the [Terraform provider](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/module_rule), [OpenTofu provider](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/module_rule), or the [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{< tabs >}}
{{% tab name="TF" %}}

Manage module rules using Terraform:

```terraform
# Create a module rule
resource "platform-orchestrator_module_rule" "example" {
  module_id  = "my-module"
  project_id = "my-project"
}

# Get details on a specific module rule
data "platform-orchestrator_module_rule" "example" {
  id = "1f8a1ecd-2b06-41de-a646-34717b138582"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Manage module rules using the `octl` CLI:

```bash
# Create a module rule
octl create module-rule --set=module_id=my-module --set=project_id=my-project

# Get details on a module rule
octl get module-rule 1f8a1ecd-2b06-41de-a646-34717b138582

# Delete a module rule
octl delete module-rule 1f8a1ecd-2b06-41de-a646-34717b138582
```

{{% /tab %}}
{{< /tabs >}}

You cannot `update` a module rule. Instead, delete the unwanted one and create a new module rule with the desired configuration instead. Modifying a module rule in TF forces replacement.

Modules will remain assigned to their environments even when the relevant module rule has been deleted until you redeploy an environment.

## Configuration

A module rule configuration consists of these elements:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/module_rule#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/module_rule#schema) provider documentation.

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# The module ID of the module where to attach the rule (required)
module_id: my-module

# An optional environment type ID to limit the module to a specific environment type
env_type_id: my-environment-type
# An optional project ID to limit the module to a specific project
project_id: my-project
# An optional environment ID to limit the module to a specific environment
env_id: my-environment
# An optional resource ID to limit the module to that specific resource ID
resource_id: workloads.my-workload.my-resource
# An optional resource class to limit the module to that specific resource class
resource_class: my-class
```

{{% /tab %}}
{{< /tabs >}}

Omitting all optional criteria creates an empty module rule ("match anything").

The Orchestrator will assign a module rule a technical `id` in uuid format upon creation.

More than one module rule can be attached to a module.

There cannot be more than one module rule with the same configuration.

### Criteria specificity

In general, the parts of the module rule criteria are in order from least specific to most specific as follows:

```command
Environment Type < Project ID < Environment ID < Resource ID < Resource Class
```

This means that a module rule containing a resource ID will always be more specific than any module rule that does not contain a resource ID.

Mathematically, the specificity of a module rule can be calculated by summing together weights for each part of the criteria:

| Part               | Weight |
| ------------------ | ------ |
| `Environment Type` | 1      |
| `Project ID`       | 2      |
| `Environment ID`   | 4      |
| `Resource ID`      | 8      |
| `Resource Class`   | 16     |

An empty module rule would score 0, one containing just an `Environment ID` would score 4, and one containing a `Project ID` and `Environment Type` would score 3.

The module rule with the highest total weight is the most specific and will be selected.

### Examples

{{< tabs >}}
{{% tab name="TF" %}}

**Create a module rule with all criteria:**

```terraform
resource "platform-orchestrator_module_rule" "specific" {
  module_id      = "my-module"
  project_id     = "my-project"
  env_type_id    = "development"
  env_id         = "dev"
  resource_id    = "shared.my-resource"
  resource_class = "default"
}
```

**Create a module rule for a specific project only:**

```terraform
resource "platform-orchestrator_module_rule" "project_only" {
  module_id  = "my-module"
  project_id = "my-project"
}
```

**Create a module rule for a specific environment type:**

```terraform
resource "platform-orchestrator_module_rule" "env_type" {
  module_id   = "my-module"
  env_type_id = "production"
}
```

**Create a catch-all module rule:**

```terraform
resource "platform-orchestrator_module_rule" "default" {
  module_id = "my-module"
  # No additional criteria - matches all contexts
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

**Create a module rule with all criteria:**

```bash
octl create module-rule \
  --set=module_id=my-module \
  --set=project_id=my-project \
  --set=env_type_id=development \
  --set=env_id=dev \
  --set=resource_id=shared.my-resource \
  --set=resource_class=default
```

**Create a module rule for a specific project only:**

```bash
octl create module-rule \
  --set=module_id=my-module \
  --set=project_id=my-project
```

**Create a module rule for a specific environment type:**

```bash
octl create module-rule \
  --set=module_id=my-module \
  --set=env_type_id=production
```

**Create a catch-all module rule:**

```bash
octl create module-rule --set=module_id=my-module
```

{{% /tab %}}
{{< /tabs >}}

## Example

Consider a project called `my-app` with multiple environments of type `development`. There is a shared environment called `dev` used by all developers and multiple "PR" environments. The `dev` environment should use a specific module configuration for a particular resource, while the PR environments should use a different module.

Two modules are created for the same resource type:

- `dev-module` - specific configuration for the dev environment
- `default-module` - general configuration for all development environments

They have the following module rules:

| Module          | Environment Type | Project ID | Environment ID | Resource ID         | Resource Class | Specificity Score |
| --------------- | ---------------- | ---------- | -------------- | ------------------- | -------------- | ----------------- |
| `dev-module`    |                  | `my-app`   | `dev`          | `shared.my-resource` | `default`      | 30 (2+4+8+16)     |
| `default-module`| `development`    | `my-app`   |                | `shared.my-resource` | `default`      | 27 (1+2+8+16)     |

Assume that a deployment occurs in the `dev` environment, requesting the Platform Orchestrator to provision a resource with ID `shared.my-resource` and the resource type of the two modules shown above. The Orchestrator now has to choose one module to provision that resource.

Looking at the module rules, it will find both `dev-module` and `default-module`. In this case, `dev-module` will be chosen because its module rule is more specific (score of 30 vs 27).

When a deployment occurs in a PR environment, only the `default-module` would match and be selected.
