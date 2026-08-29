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
      version = "~> 1.1"
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

## Authentication and organization

The provider reads the same environment variables as `octl`:

```bash
export PO_API_URL="https://api.example.com"
export PO_ORG_ID="my-organization"
export PO_AUTH_TOKEN="<service-user-token>"
```

You can instead set `api_url`, `org_id`, and the sensitive `auth_token`
provider arguments or reuse an `octl` configuration file. Environment
variables take precedence over values loaded from the configuration file.

Use a dedicated [service user]({{< relref
"/platform-orchestrator/docs/security/service-users" >}}) with only the
permissions required by the resources in the configuration.

## IAM and metadata automation

Provider `v1.1.0` adds declarative resources for:

- configurable organization roles;
- SCIM group-to-role mappings; and
- organization metadata-key validation schemas.

It also adds data sources for individual and complete role inventories, the
permission catalog, SCIM mappings, and individual or complete metadata-key
inventories.

```hcl
resource "platform-orchestrator_role" "module_maintainer" {
  display_name = "Module Maintainer"
  permissions  = ["module_read", "module_write"]
}

resource "platform-orchestrator_scim_group_mapping" "engineering" {
  group_display_name = "Engineering"
  role_id            = platform-orchestrator_role.module_maintainer.id
}

resource "platform-orchestrator_metadata_key" "cost_center" {
  name        = "cost-center"
  description = "Internal cost-center identifier"
  schema_type = "string"
  pattern     = "^[A-Z0-9-]+$"
}
```

Role permission sets and SCIM mappings are authoritative. Metadata-key
`description`, `format`, and `pattern` can be added, changed, or cleared in
place without replacing the key.

Service users are deliberately CLI/API-only. Creating or rotating one returns
a one-time bearer token, and managing that lifecycle as a Terraform resource
would persist the credential in state.

Refer to the [Terraform Registry documentation](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs)
or [OpenTofu Registry documentation](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest)
for every resource, data source, import form, and argument.
