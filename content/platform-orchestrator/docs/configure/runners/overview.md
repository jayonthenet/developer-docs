---
title: "Overview"
description: '_Runners_ are used by the Orchestrator to execute Terraform/OpenTofu modules securely inside your own infrastructure.'
lead: ""
draft: false
type: docs
weight: 5
toc: true
aliases:
- /new-orchestrator/docs/configure/runners
- /new-orchestrator/docs/configure/runners/overview
- /platform-orchestrator/docs/configure/runners
---

{{% description %}}

The Orchestrator will launch a runner to execute a [deployment]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}) into a specific [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}). Runners limit the blast radius as you can have as many runners defined as needed and have e.g. different runners for different network segments or permission sets.

There are different _runner types_ to support executing runners on specific kinds of compute, like Kubernetes clusters or serverless container runtimes. Each runner is configured to use a particular instance of such compute.

A runner is either launched by the Orchestrator itself if the target compute is reachable for it, or by an agent running in the target infrastructure and polling the Orchestrator for deployment events.

In addition, a runner uses a particular _state storage_ to maintain Terraform/OpenTofu state in between invocations.

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

## Basic example

This example creates a runner for execution on a GKE cluster and using a state storage in the runner namespace. It then creates a [runner rule]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}) for that runner.

{{< alert context="info" >}}
The properties of a runner differ depending on the runner type. Refer to each runner type for individual guidance.
{{< /alert >}}

{{< tabs >}}
{{% tab name = "TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_gke_runner" "my-gke-runner" {
  id          = "my-gke-runner"
  description = "GKE runner for my-cluster in europe-west3"
  runner_configuration = {
    cluster = {
      name        = "my-cluster"
      project_id  = "my-gcp-project"
      location    = "europe-west3"
      internal_ip = false
      auth = {
        gcp_audience        = "//iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/my-wif-pool/providers/platform-orchestrator-runner"
        gcp_service_account = "humanitec-orchestrator-runner@my-gcp-project.iam.gserviceaccount.com"
      }
    }
    job = {
      namespace       = "platform-orchestrator-runner"
      service_account = "platform-orchestrator-runner"
    }
  }
  state_storage_configuration = {
    type = "kubernetes"
    kubernetes_configuration = {
      namespace = "platform-orchestrator-runner"
    }
  }
}

resource "platform-orchestrator_runner_rule" "my-gke-runner-rule" {
  runner_id  = platform-orchestrator_kubernetes_gke_runner.my-gke-runner.id
  project_id = "my-project"
}
```

{{% /tab %}}
{{% tab name = "CLI" %}}
Runner config file `gke-runner-config.yaml`:

```yaml
description: "GKE runner for my-cluster in europe-west3"
runner_configuration:
  type: kubernetes-gke
  cluster:
    name: my-cluster
    project_id: my-gcp-project
    location: europe-west3
    auth:
      gcp_audience: //iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/my-wif-pool/providers/platform-orchestrator-runner
      gcp_service_account: humanitec-orchestrator-runner@my-gcp-project.iam.gserviceaccount.com
  job:
    namespace: platform-orchestrator-runner
    service_account: platform-orchestrator-runner
state_storage_configuration:
  type: kubernetes
  namespace: platform-orchestrator-runner
```

Create a runner using this configuration:

```bash
# Create the runner
octl create runner my-gke-runner --set-yaml=@gke-runner-config.yaml

# Create an empty runner rule that will always match
octl create runner-rule --set=runner_id=my-gke-runner
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

A runner configuration consists of these elements:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema of each individual `*-runner` resource in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/) provider documentation.

{{% details "Extended example" %}}

{{% github-file filename="/Platform-Orchestrator/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_agent_runner/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

`octl create runner my-gke-runner --set-yaml=@runner-config.yaml`

where `runner-config.yaml` is:

```yaml
# Optional description
description: GKE runner for my-cluster in europe-west3

# Runner configuration
runner_configuration: {}
  # Runner type
  type: kubernetes-gke
  # Further properties are depending on the runner type
  # ...

# State storage configuration
state_storage_configuration:
  type: kubernetes
  # Further properties depending on the state storage type
```

{{% /tab %}}
{{< /tabs >}}

The properties to set for the runner configuration and state storage configuration vary by their `type`. Refer to the individual sections for each runner type and state storage type to find the available configuration options and examples.

## Runner types

Available runner types are:

{{% siblings "/platform-orchestrator/docs/configure/runners/runner-types/_index.md" %}}

## State storage types

Available state storage types are:

{{% siblings "/platform-orchestrator/docs/configure/runners/state-storage-types/_index.md" %}}

## Compatibilty matrix

Not all runner types can technically use every state storage type. The compatibility matrix shows the supported combinations.

| State storage type ➡️<br/>Runner type ⬇️ | [kubernetes]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/kubernetes" >}}) | [s3]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/s3" >}}) | [gcs]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/gcs" >}}) | [azurerm]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/azurerm" >}}) |
| --- | --- | --- | --- | --- |
| [kubernetes]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes" >}}) | ✅ | ✅ | ✅ | ✅ |
| [kubernetes-agent]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-agent" >}}) | ✅ | ✅ | ✅ | ✅ |
| [kubernetes-eks]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-eks" >}}) | ✅ | ✅ | ✅ | ✅ |
| [kubernetes-gke]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-gke" >}}) | ✅ | ✅ | ✅ | ✅ |
| [serverless-ecs]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-gke" >}}) | ❌ | ✅ | ❌ | ❌ |

## Manage runners

Manage runners using the `octl` CLI:

```bash
octl create runner my-runner --set-yaml=@my-runner-config.yaml   # Create a new runner
octl get runner my-runner                                        # Get details on a runner
octl get runners                                                 # List all runners of your organization
octl update runner my-runner --set-yaml=@gke-runner-config.yaml  # Update a runner with a runner config
octl delete runner my-runner                                     # Delete a runner
```

## Runners and environments

{{< include "/platform-orchestrator/docs/configure/runners/include-runners-environments.md" >}}

## Refresh the runner for an environment

{{< include "/platform-orchestrator/docs/configure/runners/include-refresh-runner.md" >}}

## Runner agent

{{< include "/platform-orchestrator/docs/configure/runners/include-runner-agent.md" >}}

## Runner image

{{< include "/platform-orchestrator/docs/configure/runners/include-custom-image.md" >}}

{{% details "Kubernetes runner configuration for image override" %}}

This snippet shows how to configure the `image` source as well as related settings like `imagePullPolicy` and `imagePullSecrets` from the [PodSpec](https://kubernetes.io/docs/reference/kubernetes-api/workload-resources/pod-v1/#PodSpec). Omit them if not required.

The container `name` must be set exactly as shown.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
  runner_configuration = {
    job = {
      pod_template = jsonencode({
        spec = {
          containers = [
            {
              name            = "main"
              image           = "my-own-registry.com/platform-orchestrator/platform-orchestrator-runner:vx.y.z"
              imagePullPolicy = "IfNotPresent"
            }
          ]
          imagePullSecrets = [
            {
              name = "regcred"
            }
          ]
        }
      })
    }
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  job:
    pod_template:
      spec:
        containers:
          - name: main
            image: my-own-registry.com/platform-orchestrator/platform-orchestrator-runner:vx.y.z
            imagePullPolicy: IfNotPresent
        imagePullSecrets:
          - name: regcred
```

{{% /tab %}}
{{< /tabs >}}

{{% /details %}}

{{% details "Serverless ECS runner configuration for image override" %}}

This snippet shows how to configure the `image` source in the job configuration.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
  runner_configuration = {
    job = {
      # Custom container image name
      image = "my-own-registry.com/platform-orchestrator/platform-orchestrator-runner:vx.y.z"
      # See other required properties in the ECS runner docs
    }
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  type: serverless-ecs
  job:
    # Custom container image name
    image: my-own-registry.com/platform-orchestrator/platform-orchestrator-runner:vx.y.z
    # See other required properties in the ECS runner docs
    ...
```

{{% /tab %}}
{{< /tabs >}}

{{% /details %}}

{{< include "/platform-orchestrator/docs/configure/runners/include-custom-image-alert.md" >}}

### Create a custom image

**Minimal Docker image**

Your custom image should inherit from the `platform-orchestrator-runner` image to ensure compatibility:

```dockerfile
# Use a pinned version of the official Orchestrator runner
FROM ghcr.io/platform-orchestrator/platform-orchestrator-runner:vx.y.z


# Add your customizations here (certificates, tools, or configurations as needed)
...

# Everything else is inherited:
# - Tools, configurations (eg. OpenTofu)
# - Entrypoint: ["/opt/runner/runner"]
```
