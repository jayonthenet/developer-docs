---
title: "No provider blocks in modules"
description: "Requirement to not have any provider blocks in modules"
draft: true # This page is made for being included in other pages, not standalone
---

The TF source code of your [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}) must not contain any `provider` blocks because the modules will be called by a root module that is passing down provider configurations during a [deployment]({{< relref "/platform-orchestrator/docs/deploy/deployments#what-happens-during-a-deployment" >}}). This constraint is a TF technology requirement for [Terraform](https://developer.hashicorp.com/terraform/language/modules/develop/providers) and [OpenTofu](https://opentofu.org/docs/language/modules/develop/providers/). To learn more about providers in the TF code structure generated for a deployment, go [here]({{< relref "/platform-orchestrator/docs/configure/providers#providers-in-the-generated-tf-code" >}}).
