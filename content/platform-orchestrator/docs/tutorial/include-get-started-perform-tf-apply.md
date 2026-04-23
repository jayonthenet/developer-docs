---
type: docs
description: "Repeating snippet for performing a Terraform/OpenTofu apply"
draft: true # This page is made for being included in other pages, not standalone
---

Perform another `apply`:

{{% details "Terraform" %}}
```bash
terraform apply -var-file=orchestrator.tfvars
```
{{% /details %}}
{{% details "OpenTofu" %}}
```bash
tofu apply -var-file=orchestrator.tfvars
```
{{% /details %}}