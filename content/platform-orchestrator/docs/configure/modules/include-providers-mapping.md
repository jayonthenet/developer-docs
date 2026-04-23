---
title: "Provider mapping"
description: "Description of the provider mapping mechanism"
mermaid: true
draft: true # This page is made for being included in other pages, not standalone
---

The `provider_mapping` property of a [module]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}) maps from a local provider name used within the module to a `<provider_type>.<provider_id>` tuple defined in the Orchestrator.

For example, if a module requires the `google` and `kubernetes` providers:

```hcl
# Module TF code
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 7.14.1"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 3.0.1"
    }
  }
}
```

And you defined providers like this:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_provider" "google-us-central-1" {
  provider_type = "google"
  id            = "us-central-1"
  # ...
}
resource "platform-orchestrator_provider" "k8s-in-cluster" {
  provider_type = "kubernetes"
  id            = "in-cluster"
  # ...
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# Google provider
provider_type: google
id: us-central-1
# ...
```

```yaml
# Kubernetes provider
provider_type: kubernetes
id: in-cluster
# ...
```

{{% /tab %}}
{{< /tabs >}}

Then the provider mapping for the module may be set as:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_module" "some-module" {
  # ...
  provider_mapping = {
    google     = "google.us-central-1"
    kubernetes = "kubernetes.in-cluster"
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# ...
provider_mapping:
  google: google.us-central-1
  kubernetes: kubernetes.in-cluster
```

{{% /tab %}}
{{< /tabs >}}

If a module can work with the default provider configuration (`{}`), then mapping a provider is technically optional. It is good practice though to provide mappings for all providers used within the module to make dependencies explicit.
