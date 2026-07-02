---
title: "Environment types"
description: '_Environment types_ are a classification of _environments_. They can be used in _rules_ to identify the proper _definition_ to use during a _deployment_.'
lead: ""
draft: false
type: docs
weight: 130
toc: true
aliases:
- /new-orchestrator/docs/configure/environment-types
---

{{% description %}}

Environments are always of a certain type. This helps people to understand their purpose beyond the name. A very popular scheme is to categorize environments with their stage in the software development lifecycle to show how far changes have been progressed. E.g.: development --> staging --> production.

This helps as soon as more than one environment of a type is present. Think of two environments named "apac" and "europe" which are both of type "development".

There are however different requirements with each organization and you could also rather group on geolocation, which would lead to e.g. the same environments being both named "staging" but one being of type "apac" and one being of type "europe".

There are no strict rules and you can create as many environment types as you need to fulfill your requirements.

You can create and manage environment types using the [octl CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}), [Terraform provider](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/environment_type), [OpenTofu provider](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/environment_type), or [API]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}).

## Basic Example

{{< tabs >}}
{{% tab name="TF" %}}

{{% github-file filename="/Platform-Orchestrator/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_environment_type/resource.tf" %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```sh
octl create environment-type development --set-yaml=- <<"EOF"
display_name: Development Environment
EOF
```

{{% /tab %}}
{{< /tabs >}}

## Deleting environment types

An environment type cannot be deleted as long as it is used by an [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}).

To delete an environment type, you need to delete all environments with this type first. Note: the type of the environment can't be changed.
