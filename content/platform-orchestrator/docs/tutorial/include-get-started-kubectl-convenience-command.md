---
type: docs
description: "Convenience command for obtaining the kubectl context"
draft: true # This page is made for being included in other pages, not standalone
---

{{% details "Terraform" %}}
```bash
terraform output -state "../infra/terraform.tfstate" -json \
  | jq -r ".k8s_connect_command.value"
```
{{% /details %}}
{{% details "OpenTofu" %}}
```bash
tofu output -state "../infra/terraform.tfstate" -json \
  | jq -r ".k8s_connect_command.value"
```
{{% /details %}}

Copy and execute the command that is displayed. `kubectl` will now target the demo cluster. Verify the context is set correctly:

```bash
kubectl config current-context
```