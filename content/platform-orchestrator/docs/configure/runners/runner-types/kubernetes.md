---
title: "kubernetes"
description: "The `kubernetes` runner type lets you execute runners on any Kubernetes cluster via configuration from a kube config."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

The Orchestrator will create Kubernetes Jobs directly. This runner type does not require a [runner agent]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-agent" >}}).

To access the cluster, the Orchestrator uses values from a [kube config](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) file.

Follow the steps below to configure a runner of type `kubernetes`.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_runner" "my_runner" {
  id          = "my-runner"
  description = "Development Kubernetes Runner"
  runner_configuration = {
    cluster = {
      cluster_data = {
        certificate_authority_data = "LS0tLS1CRUdJTiBDRVJUS..."
        server                     = "https://kubernetes.default.svc.cluster.local"
      }
      auth = {
        client_certificate_data = "LS9nLS1FRUdJTiBDRVKLQ..."
        client_key_data         = "LS0tLS1CRUdJTiBSU0EgUFJJ..."
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
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create runner my-runner --set-yaml=@runner-config.yaml
```

where `runner-config.yaml` is:

```yaml
runner_configuration:
  type: kubernetes
  cluster:
    cluster_data:
      certificate_authority_data: LS0tLS1CRUdJTiBDRVJUS...
      server: https://kubernetes.default.svc.cluster.local
    auth:
      client_certificate_data: LS9nLS1FRUdJTiBDRVKLQ...
      client_key_data: LS0tLS1CRUdJTiBSU0EgUFJJ...
  job:
    namespace: platform-orchestrator-runner
    service_account: platform-orchestrator-runner
state_storage_configuration:
  type: kubernetes
  namespace: platform-orchestrator-runner
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_runner#schema) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_runner#schema) Kubernetes runner documentation.

{{% details "Extended example" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_runner/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

A `kubernetes` runner consists of these elements:

```yaml
runner_configuration:
  type: kubernetes
  # Optional description for the runner
  description: "My runner"
  # Data for the target Kubernetes cluster
  cluster:
    cluster_data:
      certificate_authority_data: LS0tLS1CRUdJTiBDRVJUS...
      server: https://kubernetes.default.svc.cluster.local
      # Optionsl proxy URL for the Kubernetes cluster
      proxy_url: https://proxy.example.com
    auth:
      client_certificate_data: LS9nLS1FRUdJTiBDRVKLQ...
      # Client certificate to authenticate against the cluster
      client_key_data: LS0tLS1CRUdJTiBSU0EgUFJJ...
      # Optional service account token for authentication inside the cluster
      service_account_token: ...
  # Data for the Kubernetes jobs launched by the runner
  job:
    namespace: platform-orchestrator-runner
    service_account: platform-orchestrator-runner
    # Optional pod template snippet for the Kubernetes Runner job
    # See the Kubernetes PodSpec documentation for available options
    pod_template:
      # spec:
      #   containers: ...
state_storage_configuration:
  # ...
```

{{% /tab %}}
{{< /tabs >}}

## Connectivity

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-connectivity-direct-kubernetes-runners.md" >}}

## Before you begin

You will need the following resources and permissions:

- A kubernetes cluster with a publicly available API server endpoint
- The [`kubectl` CLI](https://kubernetes.io/docs/tasks/tools/#kubectl) installed and the current context set to target the kubernetes cluster
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- A [project]({{< relref "/platform-orchestrator/docs/configure/projects" >}}) in your Orchestrator organization

The runner supports client certificate authentication to the cluster only. Use this command to see if the user of the current context uses a client certificate:

```bash
kubectl config view --minify -o jsonpath='{.users[0].user.client-certificate-data}'
```

The command should output `DATA+OMMITTED`.

## Prepare your environment

Perform the following setup for defining the target cluster.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  cluster_name         = "<my-cluster-name>"
  runner_id            = "kubernetes-${local.cluster_name}"
  runner_k8s_namespace = "platform-orchestrator-runner"
  runner_k8s_sa        = "platform-orchestrator-runner"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Define the cluster name

```bash
export CLUSTER_NAME=<my-cluster-name>
```

2. Define the runner name

```bash
export RUNNER_ID=kubernetes-${CLUSTER_NAME}
```

{{% /tab %}}
{{< /tabs >}}

## Prepare the kubernetes cluster

Perform the following setup on the target cluster for the runner.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "kubernetes_namespace" "platform_orchestrator_runner" {
  metadata {
    name = local.runner_k8s_namespace
  }
}

resource "kubernetes_service_account" "platform_orchestrator_runner" {
  metadata {
    name      = local.runner_k8s_sa
    namespace = kubernetes_namespace.platform_orchestrator_runner.metadata[0].name
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Create a Kubernetes namespace where your runner will run

```bash
export RUNNER_K8S_NAMESPACE=platform-orchestrator-runner

kubectl create namespace ${RUNNER_K8S_NAMESPACE}
```

2. Create a Kubernetes service account for the runner

```bash
export RUNNER_K8S_SA=platform-orchestrator-runner

kubectl create serviceaccount -n ${RUNNER_K8S_NAMESPACE} ${RUNNER_K8S_SA}
```

{{% /tab %}}
{{< /tabs >}}

## Assign permissions to the Orchestrator

Create and assign a Kubernetes Role

Prepare a [Role](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole) and [RoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding). These permissions effective enable the Orchestrator to create jobs in the runner namespace.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "kubernetes_role" "platform_orchestrator_runner_access" {
  metadata {
    name      = "platform-orchestrator-runner-orchestrator-access"
    namespace = kubernetes_namespace.platform_orchestrator_runner.metadata[0].name
  }
  rule {
    api_groups = ["batch"]
    resources  = ["jobs"]
    verbs      = ["create", "get"]
  }
}

resource "kubernetes_role_binding" "platform_orchestrator_runner_access" {
  metadata {
    name      = "platform-orchestrator-runner-orchestrator-access"
    namespace = kubernetes_namespace.platform_orchestrator_runner.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.platform_orchestrator_runner_access.metadata[0].name
  }
  subject {
    kind = "ServiceAccount"
    name = kubernetes_service_account.platform_orchestrator_runner.metadata[0].name
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat << EOF > kubernetes-runner-k8s-role-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: platform-orchestrator-runner-orchestrator-access
  namespace: ${RUNNER_K8S_NAMESPACE}
rules:
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs    : ["create", "get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: platform-orchestrator-runner-orchestrator-access
  namespace: ${RUNNER_K8S_NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: platform-orchestrator-runner-orchestrator-access
subjects:
- kind: ServiceAccount
  name: ${RUNNER_K8S_SA}
EOF
```

Apply the file:

```bash
kubectl apply -f kubernetes-runner-k8s-role-rolebinding.yaml
```

{{% /tab %}}
{{< /tabs >}}

## Configure a state storage

Decide which state storage types the runner is supposed to use. Check the [compatibility matrix]({{< relref "/platform-orchestrator/docs/configure/runners/overview#compatibilty-matrix" >}}) and perform the setup according to the chosen state storage type documentation.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
  state_storage_configuration = {
    type = "..."
    ...
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare a local file `state-storage-config.yaml` containing the properties for the state storage configuration underneath the top level property `state_storage_configuration`.

```yaml
state_storage_configuration:
  type: ...
```

{{% /tab %}}
{{< /tabs >}}

## Create a runner

In this example we will use the cluster you are currently connected to via your local kube config. We will use the command `kubectl config view --minify` to read your current kube config context and extract the required values via the jsonpath paramater.

1. Prepare the runner configuration

Connect to the kubernetes cluster you would like to register for the runner by setting the correct context:

```bash
kubectl config use-context <context>
```

{{< tabs >}}
{{% tab name="TF" %}}

Prepare these variables:

```bash
export TF_VAR_certificate_authority_data=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' --raw)
export TF_VAR_server=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}' --raw)
export TF_VAR_client_certificate_data=$(kubectl config view --minify -o jsonpath='{.users[0].user.client-certificate-data}' --raw)
export TF_VAR_client_key_data=$(kubectl config view --minify -o jsonpath='{.users[0].user.client-key-data}' --raw)
```

Prepare the runner code:

```hcl
variable "certificate_authority_data" {}
variable "server" {}
variable "client_certificate_data" {}
variable "client_key_data" {}

resource "platform-orchestrator_kubernetes_runner" "example" {
  id          = local.runner_id
  description = "Development Kubernetes Runner"
  runner_configuration = {
    cluster = {
      cluster_data = {
        certificate_authority_data = var.client_certificate_data
        server                     = var.server
      }
      auth = {
        client_certificate_data = var.client_certificate_data
        client_key_data         = var.client_key_data
      }
    }
    job = {
      namespace       = kubernetes_namespace.platform_orchestrator_runner.metadata[0].name
      service_account = kubernetes_service_account.platform_orchestrator_runner.metadata[0].name
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare the `runner_configuration` in a local file:

```bash
cat <<EOF > runner-config.yaml
runner_configuration:
  type: kubernetes
  cluster:
    cluster_data:
      certificate_authority_data: $(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' --raw)
      server: $(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}' --raw)
    auth:
      client_certificate_data: $(kubectl config view --minify -o jsonpath='{.users[0].user.client-certificate-data}' --raw)
      client_key_data: $(kubectl config view --minify -o jsonpath='{.users[0].user.client-key-data}' --raw)
  job:
    namespace: ${RUNNER_K8S_NAMESPACE}
    service_account: ${RUNNER_K8S_SA}
EOF
```

{{% /tab %}}
{{< /tabs >}}

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-runner-config.md" "platform-orchestrator_kubernetes_runner" >}}

## Setting sensitive environment variables

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-k8s-secret-variables.md" >}}
