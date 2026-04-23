---
title: "gcs"
description: "The `gcs` state storage type lets a _runner_ maintain Terraform state in Google Cloud Storage (GCS) objects."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

This state storage type results in the runner using a `gcs` backend ([Terraform](https://developer.hashicorp.com/terraform/language/backend/gcs) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/gcs/)). It is supported for all Kubernetes runner types.

It requires the runner to have credentials for accessing Google Cloud when using [Google Cloud Storage](https://cloud.google.com/storage). Refer to the documentation of the `gcs` backend type linked above to learn about available configuration options.

Follow the steps below to configure a state storage of type `gcs`. Use environment variables set via the [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) to configure any options not available here. Refer to the [Terraform](https://developer.hashicorp.com/terraform/language/backend/gcs#configuration-variables) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/gcs#configuration-variables) product documentation for a full list of `gcs` backend configuration options.

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
    type = "gcs"
    gcs_configuration = {
      bucket = "my-bucket"
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
  type: gcs
  bucket: my-bucket
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

{{< alert context="warning" >}}You should not change the state storage backend used by a runner while it has been used to deploy environments otherwise you may risk losing state for an environment and reprovisioning all of the resources. If you wish to change the bucket, you should synchronise the contents of the new and old buckets before updating the configuration.{{< /alert >}}

Set the state storage configuration as part of a runner configuration:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "platform-orchestrator_kubernetes_agent_runner" "my_runner" {
  # ...
  runner_configuration = {
    # ...
  }
  state_storage_configuration = {
    type = "gcs"
    gcs_configuration = {
      # Name of the GCS bucket
      bucket = "my-bucket"
      # Optional prefix path for the state files. The environment uuid will be used as a unique key within this
      path_prefix = "path/to/state/directory"
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  ...
state_storage_configuration:
  # Always set the type to "gcs" for this storage type
  type: gcs
  # Name of the GCS bucket
  bucket: my-bucket
  # Optional prefix path for the state file. The environment uuid will be used as a unique key within this
  path_prefix: path/to/state/directory
```

{{% /tab %}}
{{< /tabs >}}

The final key for the state file will be `(<path_prefix>/)<environment uuid>.tfstate`. This may be useful if you are reusing the bucket between runners and will use IAM conditions to further restrict access.

You can set additional properties of the `gcs` backend using environment variables and files within the runner as documented in the `gcs` backend configuration ([Terraform](https://developer.hashicorp.com/terraform/language/backend/gcs#configuration-variables) / [OpenTofu](https://opentofu.org/docs/language/settings/backends/gcs#configuration-variables)). This allows you to configure the Google Cloud credentials source and other optional fields. Unless otherwise configured, the runner will use [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) which checks for credentials in this order: the `GOOGLE_CREDENTIALS` or `GOOGLE_APPLICATION_CREDENTIALS` environment variable, then application default credentials from `gcloud auth application-default login`, and finally the attached service account metadata from GCE/GKE environments. See the setup instructions below for recommended mechanisms based on the runner type.

## Setup

### Create a GCS bucket

We recommend that you use a dedicated GCS bucket for state storage. There is no required configuration for the bucket, however:

- The bucket must not have public or broad access. State files frequently contain sensitive data which should not be accessible externally.
- You should enable [Object Versioning](https://cloud.google.com/storage/docs/object-versioning) on the bucket to facilitate state rollback in the event of a misconfigured runner or destroyed environment.
- GCS encrypts bucket contents at rest by default using Google-managed encryption keys, however you can configure [Customer-managed encryption keys (CMEK)](https://cloud.google.com/storage/docs/encryption/customer-managed-keys) if you wish.

For these reasons, we recommend that you use a bucket dedicated to storing Platform Orchestrator state files. You may reuse the same bucket between runners since state files are keyed by the unique identifier of the deployed environment.

You can create the bucket using the `gcloud storage buckets create` CLI command, through the `google_storage_bucket` resource of the [hashicorp/google](https://registry.terraform.io/providers/hashicorp/google) TF provider, or through the Google Cloud Console.

### Setup credentials for the runner

There are a few ways you can ensure the runner has Google Cloud credentials:

1. With a Kubernetes-based runner on GKE, use [Workload Identity Federation for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) to associate a Google Cloud service account with the Kubernetes service account used by the runner pod. This is the recommended approach for GKE-based runners.
2. For non GCP-based Kubernetes runners, you may use [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) to exchange an external identity token for Google Cloud credentials.
3. As a last resort, you may create a service account key and set the `GOOGLE_CREDENTIALS` environment variable with the key contents as a mounted secret in your runner. This is not recommended as more secure federated credentials are usually available.

#### Workload Identity Federation for GKE

If you are using a Kubernetes-based runner on GKE, e.g. [`kubernetes-gke`]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-gke" >}}) or [`kubernetes-agent`]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-agent" >}}), you can use [Workload Identity Federation for GKE](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity) so that the runner Pod automatically receives Google Cloud credentials to access the GCS bucket. This approach avoids the need for service account keys.

The GKE runner setup already provisions a GCP service account and a Kubernetes service account annotated with Workload Identity. To grant that service account access to the GCS bucket, add the required IAM binding as shown in the [Permissions required](#permissions-required) section below.

If the GCP service account used by the runner is different from the one used by the Orchestrator to access the GKE cluster, you will need to create a dedicated service account for the runner and bind it to the Kubernetes service account:

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "google_service_account" "runner_gcs" {
  account_id   = "humanitec-runner-gcs"
  display_name = "humanitec-runner-gcs"
  description  = "Used by Orchestrator runner pods to access GCS state storage"
  project      = local.gcp_project_id
}

# Allow the Kubernetes service account to impersonate the GCP service account
resource "google_service_account_iam_member" "runner_gcs_workload_identity" {
  service_account_id = google_service_account.runner_gcs.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${local.gcp_project_id}.svc.id.goog[${local.kubernetes_gke_runner_k8snamespace}/${local.kubernetes_gke_runner_k8sserviceaccount}]"
}

# Annotate the Kubernetes service account
resource "kubernetes_service_account" "runner_kubernetes_gke" {
  metadata {
    name      = local.kubernetes_gke_runner_k8sserviceaccount
    namespace = local.kubernetes_gke_runner_k8snamespace
    annotations = {
      "iam.gke.io/gcp-service-account" = google_service_account.runner_gcs.email
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export GCS_SERVICE_ACCOUNT_NAME=humanitec-runner-gcs

gcloud iam service-accounts create ${GCS_SERVICE_ACCOUNT_NAME} \
    --description="Used by Orchestrator runner pods to access GCS state storage" \
    --display-name=${GCS_SERVICE_ACCOUNT_NAME} \
    --project=${GCP_PROJECT_ID}

export GCS_SERVICE_ACCOUNT_EMAIL=${GCS_SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com

# Allow the Kubernetes service account to impersonate the GCP service account
gcloud iam service-accounts add-iam-policy-binding ${GCS_SERVICE_ACCOUNT_EMAIL} \
    --role=roles/iam.workloadIdentityUser \
    --member="serviceAccount:${GCP_PROJECT_ID}.svc.id.goog[${RUNNER_K8S_NAMESPACE}/${RUNNER_K8S_SA}]"

# Annotate the Kubernetes service account
kubectl annotate serviceaccount ${RUNNER_K8S_SA} \
    --namespace ${RUNNER_K8S_NAMESPACE} \
    iam.gke.io/gcp-service-account=${GCS_SERVICE_ACCOUNT_EMAIL}
```

{{% /tab %}}
{{< /tabs >}}

### Permissions required

You will need to grant appropriate permissions to the service account assumed by the runner. The `roles/storage.objectUser` role on the GCS bucket provides the minimum required permissions for reading and writing state files.

{{< tabs >}}
{{% tab name="TF" %}}

```hcl
resource "google_storage_bucket_iam_member" "runner_state_storage" {
  bucket = google_storage_bucket.state_storage.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.runner_gcs.email}"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
gcloud storage buckets add-iam-policy-binding gs://<bucket_name> \
    --member="serviceAccount:${GCS_SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.objectUser"
```

{{% /tab %}}
{{< /tabs >}}
