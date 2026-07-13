---
title: "Terraform/OpenTofu provider"
description: ""
lead: ""
draft: false
type: docs
weight: 70
toc: true
---

To continuously manage your Platform Orchestrator configuration following an IaC approach, these providers are available:

- [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest)
- [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest)

Refer to the provider documentation in the respective registry for all usage details.

The same provider declaration works with Terraform and OpenTofu:

```hcl
terraform {
  required_providers {
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 1.0"
    }
  }
}
```

Initialize it with either CLI:

```bash
terraform init
# or
tofu init
```

OpenTofu resolves the provider through `registry.opentofu.org` and verifies its published signature.
