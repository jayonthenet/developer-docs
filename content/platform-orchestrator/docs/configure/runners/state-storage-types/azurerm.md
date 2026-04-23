---
title: "azurerm"
description: "The `azurerm` state storage type lets a _runner_ maintain Terraform state in Azure Blob Storage."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

This state storage type results in an runner using an `azurerm` backend ([Terraform](https://developer.hashicorp.com/terraform/language/settings/backends/azurerm) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/azurerm/)). It is supported for all runner types except `serverless-ecs`. It requires that the runner has credentials to access Azure.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_agent_runner" "my_runner" {
  # ...
  runner_configuration = {
    # ...
  }
  state_storage_configuration = {
    type = "azurerm"
    azurerm_configuration = {
      resource_group_name  = "my-resource-group"
      storage_account_name = "mystorageaccount"
      container_name       = "my-container"
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Snippet from a sample runner configuration file `runner-config.yaml`:

```yaml
runner_configuration:
  ...
state_storage_configuration:
  type: azurerm
  resource_group_name: my-resource-group
  storage_account_name: mystorageaccount
  container_name: my-container
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

{{< alert context="warning" >}}You should not change the state storage backend used by a runner while it has been used to deploy environments otherwise you may risk losing state for an environment and reprovisioning all of the resources.{{< /alert >}}

**Required**

- `type`: Always set to `azurerm`.
- `storage_account_name`: The name of the Azure Storage Account.
- `container_name`: The name of the Azure Storage Container.

**Optional**

- `resource_group_name`: The name of the Azure Resource Group.
- `path_prefix`: An optional path prefix to use within the container. The final key for the state file will be `(<path_prefix>/)<environment uuid>.tfstate`. This may be useful if you are reusing the container between runners.

You can set additional properties of the `azurerm` backend using environment variables as documented in the `azurerm` backend configuration ([Terraform](https://developer.hashicorp.com/terraform/language/settings/backends/azurerm#configuration) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/azurerm/#configuration)). This allows you to configure the Azure credentials source and other optional fields.

## Setup

### Create an Azure Storage Account and Container

We recommend that you use a dedicated Azure Storage Account and Container for state storage.

- The container must not have public access. State files frequently contain sensitive data which should not be accessible externally.
- You should enable versioning on the storage account to facilitate state rollback in the event of a misconfigured runner or destroyed environment.

### Authentication

There are several ways you can ensure the runner has Azure credentials:

1. **Workload Identity (Recommended for Kubernetes)**: Configure [Azure Workload Identity](https://azure.github.io/azure-workload-identity/) on your cluster and associate a Managed Identity with the runner's Service Account. This is the most secure method for runners running on AKS or other Kubernetes clusters.
2. **Managed Identity**: If your runner is running on an Azure VM (e.g. `serverless-ecs` equivalent in Azure or a VM-based runner), you can use the System-assigned or User-assigned Managed Identity of the resource.
3. **Service Principal**: You can configure the runner with a Service Principal by setting environment variables such as `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_TENANT_ID`, and `ARM_SUBSCRIPTION_ID`.
4. **Access Key**: As a last resort, you can provide the storage account access key via `ARM_ACCESS_KEY`. This is not recommended as it provides broad access to the storage account.

### Permissions Required

The runner’s identity must be granted the **Storage Blob Data Contributor** role on the storage account container. This allows the runner to read, write, and list blobs, which is required for managing Terraform state files.

Assign this role to the runner’s managed identity or service principal, depending on your deployment environment.
