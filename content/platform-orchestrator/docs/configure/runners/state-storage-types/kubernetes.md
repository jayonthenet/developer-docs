---
title: "kubernetes"
description: "The `kubernetes` state storage type lets a _runner_ maintain Terraform state in Kubernetes secrets."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

This state storage type results in the runner using a `kubernetes` backend ([Terraform](https://developer.hashicorp.com/terraform/language/backend/kubernetes) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/kubernetes/)). It is only supported for Kubernetes-based runner types. The secrets will be located on the same cluster the runner is using.

Follow the steps below to configure a state storage of type `kubernetes`.

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
    type = "kubernetes"
    kubernetes_configuration = {
      namespace = "platform-orchestrator-runner"
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
  type: kubernetes
  namespace: platform-orchestrator-runner
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

Set the state storage configuration as part of a runner configuration:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema of any `runner` resource, e.g. the `kubernetes_agent_runner` in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_agent_runner#nested-schema-for-state_storage_configuration) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_agent_runner#nested-schema-for-state_storage_configuration) Kubernetes runner documentation.

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  ...
state_storage_configuration:
  # Always set the type to "kubernetes" for this storage type
  type: kubernetes
  # Namespace to use for state storage. The runner will create Kubernetes secrets holding state here
  namespace: platform-orchestrator-runner
```

{{% /tab %}}
{{< /tabs >}}

## Before you begin

You will need the following resources and permissions:

- The [`kubectl` CLI](https://kubernetes.io/docs/tasks/tools/#kubectl) installed and the current context set to target the Kubernetes cluster and using a principal with permission to create Roles and RoleBindings in the runner namespace

We recommend using the same namespace the runner is using to maintain the state storage secrets. All further instructions are based on that recommendation.

## Define a namespace

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  state_storage_namespace = "platform-orchestrator-runner"
}

# If the namespace does not exist yet, create it
resource "kubernetes_namespace" "platform_orchestrator_runner_state_storage" {
  metadata {
    name = local.state_storage_namespace
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Define the Kubernetes namespace where to store the state storage secrets

```bash
export STATE_STORAGE_NAMESPACE=platform-orchestrator-runner
```

2. If the namespace does not exist yet, create it

```bash
kubectl create namespace ${STATE_STORAGE_NAMESPACE}
```

{{% /tab %}}
{{< /tabs >}}

## Assign permissions to the runner

Prepare and assign the required permissions to the Kubernetes service account used by the runner.

1. Define the Kubernetes service account used by the runner

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  runner_k8s_sa = "platform-orchestrator-runner"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_K8S_SA=platform-orchestrator-runner
```

{{% /tab %}}
{{< /tabs >}}

2. Create and assign a Kubernetes Role

Prepare a [Role](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole) and [RoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding). These permissions effective enable the runner to manage secrets in the runner namespace.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "kubernetes_role" "platform-orchestrator-runner-kubernetes-stage-storage" {
  metadata {
    name      = "platform-orchestrator-runner-kubernetes-stage-storage"
    namespace = kubernetes_namespace.platform_orchestrator_runner_state_storage.metadata[0].name
  }
  rule {
    api_groups = [""]
    resources  = ["secrets"]
    verbs      = ["create", "get", "list", "update"]
  }
  rule {
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
    verbs      = ["create", "get", "update"]
  }
}

resource "kubernetes_role_binding" "platform-orchestrator-runner-kubernetes-stage-storage" {
  metadata {
    name      = "platform-orchestrator-runner-kubernetes-stage-storage"
    namespace = kubernetes_namespace.platform_orchestrator_runner_state_storage.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.platform-orchestrator-runner-kubernetes-stage-storage.metadata[0].name
  }
  subject {
    kind = "ServiceAccount"
    name = local.runner_k8s_sa
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat << EOF > kubernetes-state-storage-role-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: platform-orchestrator-runner-kubernetes-stage-storage
  namespace: ${STATE_STORAGE_NAMESPACE}
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["create", "get", "list", "update"]
  - apiGroups: ["coordination.k8s.io"]
    resources: ["leases"]
    verbs: ["create", "get", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: platform-orchestrator-runner-kubernetes-stage-storage
  namespace: ${STATE_STORAGE_NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: platform-orchestrator-runner-kubernetes-stage-storage
subjects:
- kind: ServiceAccount
  name: ${RUNNER_K8S_SA}
EOF
```

Apply the file:

```bash
kubectl apply -f kubernetes-state-storage-role-rolebinding.yaml
```

{{% /tab %}}
{{< /tabs >}}

## Configure the state storage for the runner

Prepare the state storage configuration as part of a runner configuration:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_agent_runner" "my_runner" {
  # ...
  runner_configuration = {
    # ...
  }
  state_storage_configuration = {
    type = "kubernetes"
    kubernetes_configuration = {
      namespace = kubernetes_namespace.platform_orchestrator_runner_state_storage.metadata[0].name
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat << EOF > kubernetes-state-storage-config.yaml
state_storage_configuration:
  type: kubernetes
  namespace: ${STATE_STORAGE_NAMESPACE}
EOF
```

{{% /tab %}}
{{< /tabs >}}

## Kubernetes secrets

The runner using the `kubernetes` state storage will maintain one Kubernetes secret for each [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}).

The secrets are named `tfstate-default-<environment-uuid>`.

This pattern follows the [kubernetes backend configuration](https://developer.hashicorp.com/terraform/language/backend/kubernetes#configuration-variables) setting the `{workspace}` to `default` and the `{secret_suffix}` to the environment `uuid`.

```bash
$ kubectl get secrets -n platform-orchestrator-runner
NAME                                                   TYPE     DATA   AGE
tfstate-default-4b41bf32-b337-93a4-ad65-1d565c5e25be   Opaque   1      21h
```
