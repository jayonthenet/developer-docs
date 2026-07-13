---
title: "kubernetes-gke"
description: "The `kubernetes-gke` runner type lets you execute runners on Google Cloud Kubernetes Engine (GKE) clusters having a publicly accessible API server."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

The Orchestrator will create Kubernetes Jobs directly. This runner type does not require a [runner agent]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-agent" >}}).

To access the cluster, the Orchestrator uses temporary credentials obtained via [Service account impersonation](https://cloud.google.com/iam/docs/service-account-impersonation) in conjunction with OIDC-based [Workload identity federation](https://cloud.google.com/iam/docs/workload-identity-federation).

Follow the steps below to configure a runner of type `kubernetes-gke`.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_eks_runner" "my_runner" {
  id = "my-runner"
  runner_configuration = {
    cluster = {
      name   = "my-eks-cluster"
      region = "us-west-2"
      auth = {
        role_arn = "arn:aws:iam::123456789012:role/platform-orchestrator-runner-eks-role"
      }
    }
    job = {
      namespace       = "default"
      service_account = "canyon-runner"
    }
  }
  state_storage_configuration = {
    # ...
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
  ...
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_gke_runner#schema) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_gke_runner#schema) Kubernetes GKE runner documentation.

{{% details "Extended example" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_gke_runner/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

A `kubernetes-gke` runner consists of these elements:

```yaml
runner_configuration:
  # Runner type
  type: kubernetes-gke
  # Optional description for the runner
  description: "My runner"

  # GKE cluster configuration
  cluster:
    # Name of the GKE cluster
    name: my-gke-cluster
    # GCP project ID
    project_id: my-gcp-project
    # GCP cluster Location
    location: europe-west3
    # (optional) Cluster Proxy URL
    proxy_url: https://some-proxy-url.com
    # (optional) Whether to use the private endpoint address of the cluster. Defaults to false
    internal_ip: false
    # Authentication options
    auth:
      # The URL of the workload identity pool provider used as an audience for OIDC token
      gcp_audience: https://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/humanitec-wif-pool/providers/humanitec-wif
      # The Google service account to impersonate
      gcp_service_account: platform-orchestrator-runner-k8s-gke

  # Kubernetes job configuration
  job:
    # Namespace where runner jobs will be created
    namespace: platform-orchestrator-runner
    # Service account to use for the runner jobs
    service_account: platform-orchestrator-runner
    # (optional) Pod template for customizing runner job pods
    pod_template:
      # Add custom pod specifications here
      # See Kubernetes PodSpec documentation for available options
      ...

# State storage configuration
state_storage_configuration:
  # Add state storeage configuration here
  # See State storage types documentation for available options
  ...
```

{{% /tab %}}
{{< /tabs >}}

## Connectivity

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-connectivity-direct-kubernetes-runners.md" >}}

## Before you begin

You will need the following resources and permissions:

- The [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated with a principal having permission to manage workload identity pools, service accounts, and IAM policies in the Google Cloud project of the target GKE cluster
- A GKE cluster with a publicly available API server endpoint and [Workload Identity Federation enabled](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)
- The [`kubectl` CLI](https://kubernetes.io/docs/tasks/tools/#kubectl) installed and the current context set to target the GKE cluster and using a principal with permission to create namespaces, service accounts, Roles, and RoleBindings on it
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- A [project]({{< relref "/platform-orchestrator/docs/configure/projects" >}}) in your Orchestrator organization

## Prepare the cloud environment

Perform the following setup in the GCP project of the target GKE cluster.

1. Set Google Cloud and GKE values

Set the proper values for your Orchestrator organization and Google Cloud project:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  humanitec_org    = "<my-org>"
  gcp_project_id   = "<my-gcp-project-id>"
  cluster_name     = "<my-cluster-name>"
  cluster_location = "<my-cluster-region>"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export PO_ORG_ID=<my-org>
export GCP_PROJECT_ID=<my-gcp-project-id>
export CLUSTER_NAME=<my-cluster-name>
export CLUSTER_LOCATION=<my-cluster-region>
```

Set the `gcloud` CLI to your project:

```bash
gcloud config set project $GCP_PROJECT_ID
```

{{% /tab %}}
{{< /tabs >}}

2. Create a workload identity pool

You may use an existing workload identity pool instead of creating a new one. To do so, set the pool name to your existing pool in the first command/statement and omit the creation.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  wip_name = "platform-orchestrator-runner-pool"
}

resource "google_iam_workload_identity_pool" "humanitec-wif-pool" {
  workload_identity_pool_id = local.wip_name
  display_name              = local.wip_name
  project                   = local.gcp_project_id
  description               = "Identity pool for Orchestrator Workload identity federation"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export WIP_NAME=platform-orchestrator-runner-pool

gcloud iam workload-identity-pools create ${WIP_NAME} \
--location="global" \
--project=${GCP_PROJECT_ID} \
--description="Identity pool for Orchestrator Workload identity federation"
```

{{% /tab %}}
{{< /tabs >}}

3. Create a workload identity provider in the pool

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "google_iam_workload_identity_pool_provider" "humanitec-wif" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.humanitec-wif-pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "platform-orchestrator-runner"
  display_name                       = "platform-orchestrator-runner"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }
  oidc {
    issuer_uri = "https://oidc.stellwerk.dev"
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
gcloud iam workload-identity-pools providers create-oidc platform-orchestrator-runner \
    --location="global" \
    --workload-identity-pool=${WIP_NAME} \
    --issuer-uri="https://oidc.stellwerk.dev" \
    --attribute-mapping="google.subject=assertion.sub" \
    --project=${GCP_PROJECT_ID}
```

{{% /tab %}}
{{< /tabs >}}

4. Create a Google Cloud service account

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  gcp_service_account_name = "platform-orchestrator-runner-k8s-gke"
}

resource "google_service_account" "platform-orchestrator-runner-k8s-gke" {
  account_id   = local.gcp_service_account_name
  display_name = local.gcp_service_account_name
  description  = "Used by the Orchestrator to access GKE clusters for launching runners"
  project      = local.gcp_project_id
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export GCP_SERVICE_ACCOUNT_NAME=platform-orchestrator-runner-k8s-gke

gcloud iam service-accounts create ${GCP_SERVICE_ACCOUNT_NAME} \
    --description="Used by the Orchestrator to access GKE clusters for launching runners" \
    --display-name=${GCP_SERVICE_ACCOUNT_NAME} \
    --project=${GCP_PROJECT_ID}
```

{{% /tab %}}
{{< /tabs >}}

5. Define the runner name

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  runner_id = "kubernetes-gke-${local.cluster_name}-${local.cluster_location}"
}

```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_ID=kubernetes-gke-${CLUSTER_NAME}-${CLUSTER_LOCATION}
```

{{% /tab %}}
{{< /tabs >}}

6. Add an IAM policy binding between the service account and workload identity federation principal to enable it for service account impersonation

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
data "google_project" "project" {
  project_id = local.gcp_project_id
}

resource "google_service_account_iam_member" "platform-orchestrator-runner-k8s-gke-workload-identity" {
  service_account_id = google_service_account.platform-orchestrator-runner-k8s-gke.id
  member             = "principal://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.humanitec-wif-pool.workload_identity_pool_id}/subject/${local.humanitec_org}+${local.runner_id}"
  role               = "roles/iam.workloadIdentityUser"
}

```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export GCP_SERVICE_ACCOUNT_EMAIL=${GCP_SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com
export GCP_PROJECT_NUMBER=$(gcloud projects describe ${GCP_PROJECT_ID} --format='get(projectNumber)')

gcloud iam service-accounts add-iam-policy-binding ${GCP_SERVICE_ACCOUNT_EMAIL} \
    --member=principal://iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIP_NAME}/subject/${PO_ORG_ID}+${RUNNER_ID} \
    --role=roles/iam.workloadIdentityUser \
    --format=json
```

{{% /tab %}}
{{< /tabs >}}

## Prepare the GKE cluster

Perform the following setup on the target GKE cluster for the runner.

1. Create a Kubernetes namespace where your runner will run

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  kubernetes_gke_runner_k8snamespace = "platform-orchestrator-runner"
}

resource "kubernetes_namespace" "runner_kubernetes_gke" {
  metadata {
    name = local.kubernetes_gke_runner_k8snamespace
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_K8S_NAMESPACE=platform-orchestrator-runner

kubectl create namespace ${RUNNER_K8S_NAMESPACE}
```

{{% /tab %}}
{{< /tabs >}}

2. Create a Kubernetes service account for the runner

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  kubernetes_gke_runner_k8sserviceaccount = "platform-orchestrator-runner"
}

resource "kubernetes_service_account" "runner_kubernetes_gke" {
  metadata {
    name      = local.kubernetes_gke_runner_k8sserviceaccount
    namespace = kubernetes_namespace.runner_kubernetes_gke.metadata[0].name
    annotations = {
      "iam.gke.io/gcp-service-account" = google_service_account.platform-orchestrator-runner-k8s-gke.email
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export RUNNER_K8S_SA=platform-orchestrator-runner

kubectl create serviceaccount -n ${RUNNER_K8S_NAMESPACE} ${RUNNER_K8S_SA}

kubectl annotate serviceaccount ${RUNNER_K8S_SA} \
    --namespace ${RUNNER_K8S_NAMESPACE} \
    iam.gke.io/gcp-service-account=${GCP_SERVICE_ACCOUNT_EMAIL}
```

{{% /tab %}}
{{< /tabs >}}

## Assign permissions to the Orchestrator

Prepare and assign the required permissions to the GCP service account used by the Orchestrator.

1. Create an IAM custom role

The permissions on the role only enable the Orchestrator to generally access the GKE cluster. Fine grained permissions on the cluster itself will be defined via a Kubernetes Role further down.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  iam_role_id = "humanitec_runner_kubernetes_gke"
}

resource "google_project_iam_custom_role" "humanitec_runner_kubernetes_gke" {
  role_id     = local.iam_role_id
  title       = "Access for the Orchestrator to GKE clusters for launching runners"
  permissions = ["container.clusters.get"]
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare a YAML file for the role:

```bash
export IAM_ROLE_ID=humanitec_runner_kubernetes_gke

cat <<EOF > kubernetes-gke-runner-iam-custom-role.yaml
title: ${IAM_ROLE_ID}
description: Access for the Orchestrator to GKE clusters for launching runners
includedPermissions:
- "container.clusters.get"
EOF
```

Create the custom role:

```bash
gcloud iam roles create ${IAM_ROLE_ID} --project=${GCP_PROJECT_ID} \
  --file=kubernetes-gke-runner-iam-custom-role.yaml
```

{{% /tab %}}
{{< /tabs >}}

See [Create a custom role](https://cloud.google.com/iam/docs/creating-custom-roles) for further configuration options.

2. Grant the custom role to the GCP service account used by the Orchestrator

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "google_project_iam_member" "humanitec_runner_kubernetes_gke" {
  project = local.gcp_project_id
  role    = "projects/${local.gcp_project_id}/roles/${google_project_iam_custom_role.humanitec_runner_kubernetes_gke.role_id}"
  member = "serviceAccount:${google_service_account.platform-orchestrator-runner-k8s-gke.email}"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
    --member="serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}" \
    --role="projects/${GCP_PROJECT_ID}/roles/${IAM_ROLE_ID}"
```

{{% /tab %}}
{{< /tabs >}}

This setup will grant the role on the Google Cloud project level. See [Grant a role](https://cloud.google.com/iam/docs/granting-changing-revoking-access#grant-single-role) for further configuration options.

3. Create and assign a Kubernetes Role

Prepare a [Role](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole) and [RoleBinding](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding). These permissions effective enable the Orchestrator to create jobs in the runner namespace.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  kubernetes_gke_runner_k8srole_name = "platform-orchestrator-runner-orchestrator-access"
}

resource "kubernetes_role" "runner_kubernetes_gke" {
  metadata {
    name      = local.kubernetes_gke_runner_k8srole_name
    namespace = kubernetes_namespace.runner_kubernetes_gke.metadata[0].name
  }

  rule {
    api_groups = ["batch"]
    resources  = ["jobs"]
    verbs      = ["create", "get"]
  }
  rule {
    api_groups = [""]
    resources  = ["pods", "events"]
    verbs      = ["list"]
  }
}

resource "kubernetes_role_binding" "runner_kubernetes_gke" {
  metadata {
    name      = local.kubernetes_gke_runner_k8srole_name
    namespace = kubernetes_namespace.runner_kubernetes_gke.metadata[0].name
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.runner_kubernetes_gke.metadata[0].name
  }
  subject {
    kind      = "User"
    name      = google_service_account.platform-orchestrator-runner-k8s-gke.email
    namespace = ""
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat << EOF > kubernetes-gke-runner-k8s-role-rolebinding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: platform-orchestrator-runner-orchestrator-access
  namespace: ${RUNNER_K8S_NAMESPACE}
rules:
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs    : ["create", "get"]
  - apiGroups: [""]
    resources: ["pods", "events"]
    verbs    : ["list"]
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
- kind: User
  name: ${GCP_SERVICE_ACCOUNT_EMAIL}
EOF
```

Apply the file:

```bash
kubectl apply -f kubernetes-gke-runner-k8s-role-rolebinding.yaml
```

{{% /tab %}}
{{< /tabs >}}

## Configure a state storage

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-configure-state-storage.md" >}}

For GKE runners, [`gcs`]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/gcs" >}}) is a natural choice as it integrates with [Workload Identity Federation for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) to provide credentials to the runner without managing service account keys.

## Create a runner

1. Prepare the runner configuration

Prepare the GCP audience for Workload Identity:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
locals {
  # ...
  gcp_audience = "//iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.humanitec-wif-pool.workload_identity_pool_id}/providers/platform-orchestrator-runner"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export GCP_AUDIENCE=//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIP_NAME}/providers/platform-orchestrator-runner
```

{{% /tab %}}
{{< /tabs >}}

Prepare the `runner_configuration`:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_gke_runner" "kubernetes_gke" {
  id          = local.runner_id
  description = "Runner of type kubernetes-gke"
  runner_configuration = {
    cluster = {
      name       = local.cluster_name
      project_id = local.gcp_project_id
      location   = local.cluster_location
      auth = {
        gcp_audience        = local.gcp_audience
        gcp_service_account = google_service_account.platform-orchestrator-runner-k8s-gke.email
      }
    }
    job = {
      namespace       = kubernetes_namespace.runner_kubernetes_gke.metadata[0].name
      service_account = kubernetes_service_account.runner_kubernetes_gke.metadata[0].name
    }
  }
  state_storage_configuration = {
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat <<EOF > runner-config.yaml
description: Runner of type kubernetes-gke
runner_configuration:
  type: kubernetes-gke
  cluster:
    name: ${CLUSTER_NAME}
    project_id: ${GCP_PROJECT_ID}
    location: ${CLUSTER_LOCATION}
    auth:
      gcp_audience: ${GCP_AUDIENCE}
      gcp_service_account: ${GCP_SERVICE_ACCOUNT_EMAIL}
  job:
    namespace: ${RUNNER_K8S_NAMESPACE}
    service_account: ${RUNNER_K8S_SA}
EOF
```

{{% /tab %}}
{{< /tabs >}}

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-runner-config.md" "platform-orchestrator_kubernetes_gke_runner" >}}

## Setting sensitive environment variables

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-k8s-secret-variables.md" >}}
