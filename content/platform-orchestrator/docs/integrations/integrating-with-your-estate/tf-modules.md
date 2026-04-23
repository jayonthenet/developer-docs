---
title: "Terraform/OpenTofu modules"
description: "If you have existing TF modules for maintaining your target resources via IaC, your module maintenance processes may continue normally."
lead: ""
draft: false
type: docs
weight: 10
toc: true
aliases:
- /platform-orchestrator/docs/integrations/terraform/opentofu-modules
---

> Relevant tools: Terraform, OpenTofu

{{% description %}}

## Integrations overview

{{< include "/platform-orchestrator/docs/integrations/integrating-with-your-estate/include-integrations-overview.md" >}}

{{< integration-diagram "tf-modules" >}}

## Terraform/OpenTofu modules

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

A core part of integration is making these modules available to the Orchestrator. You do that by configuring [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}) referencing the existing TF module sources, usually in a Git repository on GitHub, GitLab, Bitbucket, Azure DevOps, Launchpad, or any other git hosting service:

```hcl
resource "platform-orchestrator_module" "my_module" {
  module_source = "git::https://my-git-repos.com/path/to/repo//path/to/module?ref=vX.Y.Z"
  # ...
}
```

The Orchestrator then performs deployments by assembling a set of TF modules provided by you in this way, and applying them to the target infrastructure.

We recommend maintaining all Orchestrator configuration, including modules, via IaC using our own [`platform-orchestrator` TF provider]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}) as shown.

Refer to [module source locations]({{< relref "/platform-orchestrator/docs/configure/modules/overview#module-source-locations" >}}) for details on referencing modules from different locations and using specific module versions.
