---
title: "Projects"
description: '_Projects_ are the home for a project or application team of your _organization_. A project is a collection of one or more _environments_.'
lead: ""
draft: false
type: docs
weight: 110
toc: true
aliases:
- /new-orchestrator/docs/configure/projects
---

{{% description %}}

A project is mainly a container that holds a set of [environments]({{< relref "/platform-orchestrator/docs/configure/environments" >}}), and a prerequisite for any environment to be created. You decide how to allocate projects based on what makes the most sense for your organization. They may be application centric, infrastructure centric, or a combination of both, depending on what you wish to manage via the Orchestrator.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

{{% github-file filename="/humanitec/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_project/resource.tf" %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create project my-project --set-yaml=@project-config.yaml
```

where `project-config.yaml`:

```yaml
display_name: Backend Project
```

Note: the project `id` is part of the CLI command, e.g. `octl create my-project`, and therefore not shown as part of the configuration.

{{% /tab %}}
{{< /tabs >}}

## Configuration

A project configuration consists of these elements:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/project#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/project#schema) provider documentation.

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# Optional human friendly display name for the project
display_name: Backend Project
```

{{% /tab %}}
{{< /tabs >}}

## Projects and environments

{{< include "/platform-orchestrator/docs/configure/include-projects-environments.md" >}}

## Lifecycle

A project cannot be deleted while it still contains any [environments]({{< relref "/platform-orchestrator/docs/configure/environments" >}}).
