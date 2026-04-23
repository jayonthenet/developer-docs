---
title: "Instructions for configuring authentication against an OCI registry for Helm"
description: "Instructions for configuring authentication against an OCI registry for Helm"
draft: true # This page is made for being included in other pages, not standalone
---


If you are [self-hosting](#self-hosting-requirements) the Helm chart in your own registry and that registry requires authentication, you need to configure credentials for Helm. There are several options.

- Option 1: Configure credentials in the [`helm` provider](https://registry.terraform.io/providers/hashicorp/helm/latest/docs) in TF:

```hcl
variable "helm_repository_username" {
  type = string
}
variable "helm_repository_password" {
  type      = string
  sensitive = true
}
provider "helm" {
  # ...
  registries = [{
    url      = local.kubernetes_agent_runner_chart_repository
    username = var.helm_repository_username
    password = var.helm_repository_password
  }]
}
```

Pass the `variable` values using standard TF mechanisms, e.g. set the `TF_VAR_helm_repository_username` and `TF_VAR_helm_repository_password` environment variables on the client executing the TF `apply`.

- Option 2: Use the `helm` CLI to login to the registry on the client executing the TF `apply`:

```bash
export HELM_REGISTRY_PASSWORD=<your-password>
echo $HELM_REGISTRY_PASSWORD | helm registry login myregistry.example.com -u admin --password-stdin
```

See the documentation on the [`helm registry login` command](https://helm.sh/docs/helm/helm_registry_login) for supported ways to log in.
