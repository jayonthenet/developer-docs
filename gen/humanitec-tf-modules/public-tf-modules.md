---
title: "Public TF modules"
description: "We maintain a public collection of TF modules to help you get started more quickly setting up your Orchestrator estate."
lead: ""
draft: false
type: docs
weight: 80
toc: true
---

{{% description %}}

{{< include "content/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

We maintain all modules in the [humanitec-tf-modules](https://github.com/humanitec-tf-modules) GitHub organization. We provide them on a best-effort basis.

There are two categories of modules:

- [Orchestrator configuration](#orchestrator-configuration): These modules contain TF code for Orchestrator configuration objects such as [runners]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) or [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}).
- [Module sources](#module-sources): These modules contain TF code for provisionig real world objects. You can use them as the `module_source` in Orchestrator [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}).

## Orchestrator configuration

MODULE_LIST_ORCHESTRATOR_CONFIG_GOES_HERE

## Module sources

MODULE_LIST_MODULE_SOURCES_GOES_HERE
