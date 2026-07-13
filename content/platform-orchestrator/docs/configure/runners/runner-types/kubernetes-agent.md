---
title: "kubernetes-agent"
description: "The `kubernetes-agent` runner type lets you execute runners on Kubernetes clusters which do not have a publicly accessible API server."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

The `kubernetes-agent` is a [runner agent]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-agent" >}}) which runs in your cluster and establishes a secure connection to the Platform Orchestrator. Once connected, the `kubernetes-agent` runner polls the Orchestrator for events and triggers Kubernetes Jobs in the same cluster where it's running in response to them.

Follow the steps below to configure a runner of type `kubernetes-agent`.

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

## Example configuration

{{< tabs >}}
{{% tab name="TF" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_agent_runner/resource.tf" %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create runner my-runner --set-yaml=@runner-config.yaml
```

where `runner-config.yaml` is:

```yaml
runner_configuration:
  type: kubernetes-agent
  key: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAc5dgCx4ano39JT0XgTsHnts3jej+5xl7ZAwSIrKpef0=
    -----END PUBLIC KEY-----
  job:
    namespace: default
    service_account: platform-orchestrator-runner
    pod_template:
      metadata:
        labels:
          app.kubernetes.io/name: platform-orchestrator-runner
state_storage_configuration:
  type: kubernetes
  namespace: platform-orchestrator
  ...
```

{{% /tab %}}
{{< /tabs >}}

See all [configuration options](#configuration-options) further down.

## Configuration options

The following configuration shows all available options for the `kubernetes-agent` runner type:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_runner#schema) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/kubernetes_runner#schema) provider documentation.

{{% details "Extended example" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_kubernetes_agent_runner/resource.tf" %}}

{{% /details %}}


{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  # Runner type
  type: kubernetes-agent

  # Kubernetes job configuration
  job:
    # Public key used to verify the runner agent's identity
    key: |
      -----BEGIN PUBLIC KEY-----
      ...
      -----END PUBLIC KEY-----

    # Namespace where runner jobs run
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

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-connectivity-agent-kubernetes-runners.md" >}}

## Setup guide

The steps below serve as a general guide to configure the runner using either Terraform/OpenTofu ("TF") code or the CLI. Adjust the steps as needed based on your environment and requirements.

The setup guide provides specific instructions for different cluster types:

- [<img src="/images/Kubernetes-logo.png" alt="Kubernetes logo" width="20rem"/> Generic Kubernetes setup](#generic-kubernetes-setup)
- [<img src="/images/AWS-Cloud-logo_32.svg" alt="AWS cloud logo" width="20rem"/> EKS-specific setup](#eks-specific-setup)
- [<img src="/images/google_cloud.png" alt="Google Cloud logo" width="16rem"/> GKE-specific setup](#gke-specific-setup)
- [<img src="/images/10018-icon-service-Azure-A.svg" alt="Azure logo" width="20rem"/> AKS-specific setup](#aks-specific-setup)

Perform the steps in the section that corresponds to your Kubernetes cluster type.

## Installation requirements

The agent requires the API endpoint of your Platform Orchestrator installation. The public Terraform module, Helm chart, and runner image can be used directly when the target cluster has internet access.

For an air-gapped installation, mirror these components into services reachable by the target cluster:

- A Git service hosting the Terraform runner module
- An OCI artifact registry hosting the runner Helm chart and runner container image

Instructions for importing each component are shown below. Skip the mirror-specific steps when using the public sources.

{{< alert context="info" >}}
Some repository or registry tools have a capability to continuously "mirror" or "proxy" selected public repos or artefacts for internal use. Check the documentation of your tooling for such an option. If available, we recommend using it instead of performing the imports manually.
{{< /alert >}}

### Orchestrator API endpoint

Obtain the API endpoint from your Platform Orchestrator installation. The setup instructions for each cluster type further down on this page will ask you to provide it at the appropriate place.

### TF module

Make the public [`kubernetes-agent-orchestrator-runner` TF module](https://github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner) repository available in a private Git service within your infrastructure.

```bash
# Clone the repository (latest)
git clone https://github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner.git

# Or use a ref to clone a particular release
# git clone --branch vX.Y.Z --single-branch https://github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner.git

# Use git mechanisms at your discretion to create a new repo and push the contents
# ...
```

If feasible, you may also fork the repo to your system.

If your private Git service requires authentication, you need to configure the runner to provide credentials. Follow the instructions for [private module sources]({{< relref "/platform-orchestrator/docs/configure/modules/private-module-sources" >}}).

### Helm chart

Make the public `platform-orchestrator-kubernetes-agent-runner` Helm chart available in an OCI registry within your infrastructure.

```bash
# Pull the Helm chart
helm pull oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner
# Or pull a particular chart version
# helm pull oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner --version X.Y.Z

# Push the Helm chart to your internal registry
# Adjust your registry domain and charts path according to your setup
helm push platform-orchestrator-kubernetes-agent-runner-X.Y.Z.tgz oci://myregistry.example.com/charts
```

The chart must be named `platform-orchestrator-kubernetes-agent-runner` in your registry.

If your registry requires authentication, refer to the [`helm push` command](https://helm.sh/docs/helm/helm_push) for details on pushing the chart using credentials, or execute a [`helm registry login` command](https://helm.sh/docs/helm/helm_registry_login).

Also, If your registry requires authentication, the client executing the TF `apply` command for setting up the runner will have to provide credentials to Helm for pulling the chart. The setup instructions for each cluster type below include the details.

### Runner image

Make the public [`platform-orchestrator-runner` container image](https://github.com/orgs/stellwerk-labs/packages/container/package/platform-orchestrator-runner) available in an OCI registry within your infrastructure.

```bash
# Pull the desired version
docker image pull ghcr.io/stellwerk-labs/platform-orchestrator-runner:vX.Y.Z

# Tag the image so that it points to your internal registry
# Adjust your registry domain and image path according to your setup
docker image tag ghcr.io/stellwerk-labs/platform-orchestrator-runner:vX.Y.Z myregistry.example.com/platform-orchestrator/platform-orchestrator-runner:vX.Y.Z

# Push the image to your internal registry
# Adjust your registry domain and image path according to your setup
docker image push myregistry.example.com/platform-orchestrator/platform-orchestrator-runner:vX.Y.Z
```

If your registry requires authentication, refer to the [docker login](https://docs.docker.com/reference/cli/docker/login/) command.

You will also need to configure the runner to use your image source. Refer to [runner image]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-image" >}}) for instructions.

## Generic Kubernetes setup

This section describes the installation of the `kubernetes-agent` runner on a cluster type other than the specific ones covered on this page.

To have the `kubernetes-agent` runner in your Kubernetes cluster, you need:

- An existing [Kubernetes cluster](https://kubernetes.io/docs)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed locally and the current context set to the target cluster
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- Depending on your choice of tooling:
  - TF: Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed
  - `octl` CLI: [helm](https://helm.sh/docs/intro/install/) installed locally

{{< tabs >}}
{{% tab name="TF" %}}

1. Declare the required providers:

```json
terraform {
  required_providers {
    # Providers needed to install the kubernetes-agent runner Helm chart and register it with the Orchestrator
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 2"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}
```

2. Set values according to your setup. Change the default values at your discretion:

```hcl
locals {
  kubeconfig_context        = "<context-in-your-kubeconfig>"
  platform_orchestrator_org = "<my-org>"
  runner_id                 = "kubernetes-agent-${local.kubeconfig_context}" # Adjust the ID at your discretion

  # The Kubernetes namespace where the kubernetes-agent runner should run
  cluster_runner_namespace = "platform-orchestrator-kubernetes-agent-runner-ns"

  # The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
  cluster_runner_serviceaccount = "platform-orchestrator-kubernetes-agent-runner"

  # The Kubernetes namespace where the deployment jobs should run
  cluster_runner_job_namespace = "platform-orchestrator-kubernetes-agent-runner-job-ns"

  # The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
  cluster_runner_job_serviceaccount = "platform-orchestrator-kubernetes-agent-runner-job"
}
```

Use TF variables of your module instead of placing the raw values in the `locals` at your discretion.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-values.md" >}}

3. Configure providers:

```json
# Platform Orchestrator provider. Authentication taken from local "octl" CLI
provider "platform-orchestrator" {
  org_id = local.platform_orchestrator_org
}

# Kubernetes provider. Authentication taken from local kubeconfig context
# Check the provider documentation for alternative ways of authentication
provider "kubernetes" {
  config_path    = "~/.kube/config" # Adjust if needed or remove if default works
  config_context = local.kubeconfig_context
}

# Helm provider. Kubernetes authentication taken from local kubeconfig context
# Check the provider documentation for alternative ways of authentication
provider "helm" {
  kubernetes = {
    config_path    = "~/.kube/config" # Adjust if needed or remove if default works
    config_context =  local.kubeconfig_context
  }
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-helm-registry-auth.md" >}}

{{% /tab %}}
{{% tab name="CLI" %}}

1. Set values

```bash
export PO_ORG_ID=<my-org>
export KUBERNETES_AGENT_RUNNER_CHART_REPOSITORY="oci://ghcr.io/stellwerk-labs/charts"

# The Kubernetes namespace where the kubernetes-agent runner should run
export CLUSTER_RUNNER_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-ns"

# The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
export CLUSTER_RUNNER_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner"

# The Kubernetes namespace where the deployment jobs should run
export CLUSTER_RUNNER_JOB_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-job-ns"

# The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
export CLUSTER_RUNNER_JOB_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner-job"
```

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-values.md" %}}

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-createkeys.md" %}}

{{< tabs >}}
{{% tab name="TF" %}}

4. Define the runner resource using the public Orchestrator module and the key pair to install the runner into the cluster and register it with the Orchestrator:

```hcl
module "kubernetes_agent_runner" {
  source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"
  # To pin a specific module release, use this notation:
  # source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner?ref=vX.Y.Z"

  orchestrator_org_id          = local.platform_orchestrator_org
  runner_id                    = local.runner_id
  private_key_path             = "./runner_private_key.pem"
  public_key_path              = "./runner_public_key.pem"
  k8s_namespace                = local.cluster_runner_namespace
  k8s_service_account_name     = local.cluster_runner_serviceaccount
  k8s_job_namespace            = local.cluster_runner_job_namespace
  k8s_job_service_account_name = local.cluster_runner_job_serviceaccount
}

# Provide the runner ID as an output
output "runner_id" {
  value = module.kubernetes_agent_runner.runner_id
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-module.md" >}}

5. Assign any permissions the runner will need to provision resources:

See [assign runner permissions](#assign-runner-permissions) for guidance.

6. Verify the `kubectl` context is set to your target cluster:

```bash
kubectl config current-context
```

7. Initialize and apply the TF configuration:

{{% details "Terraform" %}}

```bash
terraform init
terraform apply
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
tofu init
tofu apply
```

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

2. Verify the `kubectl` context is set to your target cluster:

```bash
kubectl config current-context
```

3. Set values:

```bash
export KUBECONFIG_CONTEXT=$(kubectl config current-context)
export RUNNER_ID=kubernetes-agent-${KUBECONFIG_CONTEXT}  # Adjust the ID at your discretion
```

4. Create the namespace for the runner and a secret holding the runner private key:

```bash
kubectl create namespace ${CLUSTER_RUNNER_NAMESPACE}

kubectl create secret generic platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --from-literal=private_key="$(cat runner_private_key.pem)"
```

5. Create the namespace for the runner jobs:

```bash
kubectl create namespace ${CLUSTER_RUNNER_JOB_NAMESPACE}
```

6. Register the `kubernetes-agent` runner with the Orchestrator:

```bash
octl create runner ${RUNNER_ID} \
  --set=runner_configuration="$(jq -nc --arg key "$(cat runner_public_key.pem)" '{"type": "kubernetes-agent","key":$key,"job":{"namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'","service_account":"'${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}'"}}')" \
  --set=state_storage_configuration='{"type":"kubernetes","namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'"}'
```

7. Install the runner Helm chart onto the cluster, providing required values:

```bash
helm install platform-orchestrator-kubernetes-agent-runner \
  ${KUBERNETES_AGENT_RUNNER_CHART_REPOSITORY}/platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --set platformOrchestrator.orgId=${PO_ORG_ID} \
  --set platformOrchestrator.runnerId=${RUNNER_ID} \
  --set platformOrchestrator.existingSecret=platform-orchestrator-kubernetes-agent-runner \
  --set namespaceOverride=${CLUSTER_RUNNER_NAMESPACE} \
  --set serviceAccount.name=${CLUSTER_RUNNER_SERVICEACCOUNT} \
  --set jobsRbac.namespace=${CLUSTER_RUNNER_JOB_NAMESPACE} \
  --set jobsRbac.serviceAccountName=${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-helm.md" >}}

8. Assign any permissions the runner will need to provision resources:

See [assign runner permissions](#assign-runner-permissions) for guidance.

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-followup.md" %}}

## EKS-specific setup

To have the `kubernetes-agent` runner in your EKS cluster, you need:

- An existing [AWS EKS cluster](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html)
- The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and authenticated with a principal having permission to manage IAM roles and policies in the AWS account of the EKS cluster
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed locally and the current context set to the target cluster
- Depending on your choice of tooling:
  - TF: Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed
  - `octl` CLI: [helm](https://helm.sh/docs/intro/install/) installed locally

The setup utilizes [IAM roles for service accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for the EKS cluster to provide credentials to the runner for TF execution.

{{< alert context="info" >}}
Why IRSA and not [EKS Pod Identity](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html)?

The [hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#container-credentials) TF provider as of version `6.x` only supports IRSA to provide credentials to the runner.
{{< /alert >}}

{{< tabs >}}
{{% tab name="TF" %}}

1. Declare the required providers:

```json
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6"
    }
    # Providers needed to install the kubernetes-agent runner Helm chart and register it with the Orchestrator
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 2"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}
```

2. Set values according to your setup. Change the default values at your discretion:

```hcl
locals {
  aws_account_id            = "<my-aws-account-id>"
  aws_region                = "<my-aws-region>"
  cluster_name              = "<my-eks-cluster-name>"
  platform_orchestrator_org = "<my-org>"
  runner_id                 = "kubernetes-agent-${local.cluster_name}" # Adjust the ID at your discretion

  # The Kubernetes namespace where the kubernetes-agent runner should run
  cluster_runner_namespace = "platform-orchestrator-kubernetes-agent-runner-ns"

  # The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
  cluster_runner_serviceaccount = "platform-orchestrator-kubernetes-agent-runner"

  # The Kubernetes namespace where the deployment jobs should run
  cluster_runner_job_namespace = "platform-orchestrator-kubernetes-agent-runner-job-ns"

  # The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
  cluster_runner_job_serviceaccount = "platform-orchestrator-kubernetes-agent-runner-job"
}
```

Use TF variables of your module instead of placing the raw values in the `locals` at your discretion.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-values.md" >}}

3. Create a data source from the existing cluster and extract required cluster properties:

```json
# Data source for the existing EKS cluster
data "aws_eks_cluster" "cluster" {
  name = local.cluster_name
}

# Extract cluster properties
locals {
  oidc_provider_url      = data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer
  oidc_provider          = trimprefix(data.aws_eks_cluster.cluster.identity[0].oidc[0].issuer, "https://")
  cluster_endpoint       = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = data.aws_eks_cluster.cluster.certificate_authority[0].data
}
```

4. Configure providers:

```json
# AWS provider. Authentication taken from local "aws" CLI
provider "aws" {
  region = local.aws_region
}

# Platform Orchestrator provider. Authentication taken from local "octl" CLI
provider "platform-orchestrator" {
  org_id = local.platform_orchestrator_org
}

# Kubernetes provider. Authentication taken from local "aws" CLI
provider "kubernetes" {
  host                   = local.cluster_endpoint
  cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--output", "json", "--cluster-name", local.cluster_name, "--region", local.aws_region]
    command     = "aws"
  }
}

# Helm provider. Kubernetes authentication taken from local "aws" CLI
provider "helm" {
  kubernetes = {
    host                   = local.cluster_endpoint
    cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = ["eks", "get-token", "--output", "json", "--cluster-name", local.cluster_name, "--region", local.aws_region]
      command     = "aws"
    }
  }
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-helm-registry-auth.md" >}}

5. Create an IAM role for IRSA that allows the Kubernetes service account used by the runner jobs to assume it:

```json
data "aws_iam_policy_document" "assume_role" {
  version = "2012-10-17"
  statement {
    effect = "Allow"
    principals {
      type        = "Federated"
      identifiers = ["arn:aws:iam::${local.aws_account_id}:oidc-provider/${local.oidc_provider}"]
    }
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_provider}:aud"
      values = [
        "sts.amazonaws.com"
      ]
    }
    condition {
      test     = "StringEquals"
      variable = "${local.oidc_provider}:sub"
      values = [
        "system:serviceaccount:${local.cluster_runner_job_namespace}:${local.cluster_runner_job_serviceaccount}"
      ]
    }
  }
}

# This role will be assumed by the runner jobs
resource "aws_iam_role" "agent_runner_irsa_role" {
  name               = "platform-orchestrator-kubernetes-agent-runner-${local.cluster_name}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}
```

5. Create and associate an IAM OIDC provider for your cluster:

Skip this step if you already have an IAM OIDC provider associated to your EKS cluster. To determine whether you do, refer to the [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html#_create_oidc_provider_eksctl).

```json
resource "aws_iam_openid_connect_provider" "agent_runner" {
  url   = local.oidc_provider_url
  client_id_list = [
    "sts.amazonaws.com"
  ]
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Set values

```bash
export AWS_ACCOUNT_ID=<my-aws-account-id>
export AWS_REGION=<my-aws-region>
export CLUSTER_NAME=<my-eks-cluster-name>

# The Kubernetes namespace where the kubernetes-agent runner should run
export CLUSTER_RUNNER_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-ns"

# The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
export CLUSTER_RUNNER_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner"

# The Kubernetes namespace where the deployment jobs should run
export CLUSTER_RUNNER_JOB_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-job-ns"

# The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
export CLUSTER_RUNNER_JOB_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner-job"
```

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-values.md" %}}

2. Obtain and output the EKS cluster's OIDC issuer:

```bash
export CLUSTER_OIDC_ISSUER=$(aws eks describe-cluster --name $CLUSTER_NAME --region $AWS_REGION --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")

echo $CLUSTER_OIDC_ISSUER
```

3. Create an IAM role for IRSA that allows the Kubernetes service account used by the runner jobs to assume it:

```bash
export RUNNER_ROLE_NAME=platform-orchestrator-kubernetes-agent-runner-${CLUSTER_NAME}

aws iam create-role \
  --role-name ${RUNNER_ROLE_NAME} \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::'${AWS_ACCOUNT_ID}':oidc-provider/'${CLUSTER_OIDC_ISSUER}'"
        },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "'${CLUSTER_OIDC_ISSUER}':aud": "sts.amazonaws.com",
            "'${CLUSTER_OIDC_ISSUER}':sub": "system:serviceaccount:'${CLUSTER_RUNNER_JOB_NAMESPACE}':'${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}'"
          }
        }
      }
    ]
  }'
```

4. Create and associate an IAM OIDC provider for your cluster:

Skip this step if you already have an IAM OIDC provider associated to your EKS cluster. To determine whether you do, refer to the [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html#_create_oidc_provider_eksctl).

```bash
eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --approve
```

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-createkeys.md" %}}

{{< tabs >}}
{{% tab name="TF" %}}

6. Define the runner resource using the public Orchestrator module and the key pair to install the runner into the cluster and register it with the Orchestrator:

```hcl
module "kubernetes_agent_runner" {
  source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"
  # To pin a specific module release, use this notation:
  # source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner?ref=vX.Y.Z"

  orchestrator_org_id          = local.platform_orchestrator_org
  runner_id                    = local.runner_id
  private_key_path             = "./runner_private_key.pem"
  public_key_path              = "./runner_public_key.pem"
  k8s_namespace                = local.cluster_runner_namespace
  k8s_service_account_name     = local.cluster_runner_serviceaccount
  k8s_job_namespace            = local.cluster_runner_job_namespace
  k8s_job_service_account_name = local.cluster_runner_job_serviceaccount

  # EKS IRSA configuration - link to the IAM role created above
  service_account_annotations = {
    "eks.amazonaws.com/role-arn" = aws_iam_role.agent_runner_irsa_role.arn
  }
}

# Provide the runner ID as an output
output "runner_id" {
  value = module.kubernetes_agent_runner.runner_id
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-module.md" >}}

7. Assign any AWS permissions the runner will need to provision AWS resources to the IAM role. E.g. to enable the runner to manage Amazon RDS instances, attach a policy like this:

```json
resource "aws_iam_role_policy_attachment" "agent_runner_manage_rds" {
  role       = aws_iam_role.agent_runner_irsa_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
}
```

The exact permissions and whether you use built-in policies or custom policies is at your own discretion and depending on your resource requirements.

8. Verify the `kubectl` context is set to your target cluster:

```bash
kubectl config current-context
```

9. Initialize and apply the TF configuration:

{{% details "Terraform" %}}

```bash
terraform init
terraform apply
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
tofu init
tofu apply
```

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

5. Verify the `kubectl` context is set to your target cluster:

```bash
kubectl config current-context
```

6. Set values:

```bash
export PO_ORG_ID=<my-org>
export RUNNER_ID=kubernetes-agent-${CLUSTER_NAME}
```

7. Create the namespace for the runner and a secret holding the runner private key:

```bash
kubectl create namespace ${CLUSTER_RUNNER_NAMESPACE}

kubectl create secret generic platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --from-literal=private_key="$(cat runner_private_key.pem)"
```

8. Create the namespace for the runner jobs:

```bash
kubectl create namespace ${CLUSTER_RUNNER_JOB_NAMESPACE}
```

9. Install the runner Helm chart onto the cluster, providing required values:

```bash
helm install platform-orchestrator-kubernetes-agent-runner \
  oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --set platformOrchestrator.orgId=${PO_ORG_ID} \
  --set platformOrchestrator.runnerId=${RUNNER_ID} \
  --set platformOrchestrator.existingSecret=platform-orchestrator-kubernetes-agent-runner \
  --set namespaceOverride=${CLUSTER_RUNNER_NAMESPACE} \
  --set serviceAccount.name=${CLUSTER_RUNNER_SERVICEACCOUNT} \
  --set jobsRbac.namespace=${CLUSTER_RUNNER_JOB_NAMESPACE} \
  --set jobsRbac.serviceAccountName=${CLUSTER_RUNNER_JOB_SERVICEACCOUNT} \
  --set "serviceAccount.annotations.eks\.amazonaws\.com/role-arn=$(aws iam get-role --role-name ${RUNNER_ROLE_NAME} | jq -r .Role.Arn)"
```

The value `serviceAccount.annotations.eks...` annotates the Kubernetes service account to leverage the EKS workload identity solution [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for the runner to authenticate against AWS, using a role pre-configured as part of the initial base setup.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-helm.md" >}}

10. Register the `kubernetes-agent` runner with the Orchestrator:

```bash
octl create runner ${RUNNER_ID} \
  --set=runner_configuration="$(jq -nc --arg key "$(cat runner_public_key.pem)" '{"type": "kubernetes-agent","key":$key,"job":{"namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'","service_account":"'${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}'"}}')" \
  --set=state_storage_configuration='{"type":"kubernetes","namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'"}'
```

11. Assign any AWS permissions the runner will need to provision AWS resources to the IAM role. E.g. to enable the runner to manage Amazon RDS instances, attach a policy like this:

```bash
aws iam attach-role-policy \
  --role-name ${RUNNER_ROLE_NAME} \
  --policy-arn "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
```

The exact permissions and whether you use built-in policies or custom policies is at your own discretion and depending on your resource requirements.

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-followup.md" %}}

## GKE-specific setup

To have the `kubernetes-agent` runner in your GKE cluster, you need:

- An existing [GCP GKE cluster](https://cloud.google.com/kubernetes-engine/docs/concepts/what-is-gke)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed locally and the current context set to the target cluster
- The [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated with a principal having permission to manage IAM roles and policies in the GCP project of the GKE cluster
- The [`gke-gcloud-auth-plugin` CLI](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl) installed and `kubectl` configured to use the plugin
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- Depending on your choice of tooling:
  - TF: Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed
  - `octl` CLI: [helm](https://helm.sh/docs/intro/install/) installed locally

The setup utilizes [workload identity using a Google Service Account](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference#running-terraform-on-google-cloud) for the GKE cluster to provide credentials to the runner for TF execution.

{{< tabs >}}
{{% tab name="TF" %}}

1. Declare the required providers:

```json
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7"
    }
    # Providers needed to install the kubernetes-agent runner Helm chart and register it with the Orchestrator
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 2"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}
```

2. Set values according to your setup. Change the default values at your discretion:

```hcl
locals {
  gcp_project_id           = "<my-gcp-project-id>"
  gcp_region               = "<my-gcp-region>"
  cluster_name             = "<my-gke-cluster-name>"
  platform_orchestrator_org = "<my-org>"
  runner_id                = "kubernetes-agent-${local.cluster_name}" # Adjust the ID at your discretion

  # The Kubernetes namespace where the kubernetes-agent runner should run
  cluster_runner_namespace = "platform-orchestrator-kubernetes-agent-runner-ns"

  # The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
  cluster_runner_serviceaccount = "platform-orchestrator-kubernetes-agent-runner"

  # The Kubernetes namespace where the deployment jobs should run
  cluster_runner_job_namespace = "platform-orchestrator-kubernetes-agent-runner-job-ns"

  # The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
  cluster_runner_job_serviceaccount = "platform-orchestrator-kubernetes-agent-runner-job"
}
```

Use TF variables of your module instead of placing the raw values in the `locals` at your discretion.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-values.md" >}}

3. Create a data source from the existing cluster and extract required cluster properties:

```json
# Data source for the existing EKS cluster
data "google_container_cluster" "cluster" {
  name     = local.cluster_name
  location = local.gcp_region
  project  = local.gcp_project_id
}

# Extract cluster properties
locals {
  cluster_ca_certificate = data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate
  k8s_cluster_endpoint   = data.google_container_cluster.cluster.endpoint
}
```

4. Configure providers:

```json
# GCP provider. Authentication taken from local "gcloud" CLI
provider "google" {
  project = local.gcp_project_id
  region  = local.gcp_region
}

# Platform Orchestrator provider. Authentication taken from local "octl" CLI
provider "platform-orchestrator" {
  org_id = local.platform_orchestrator_org
}

# Kubernetes provider. Authentication taken from local "gke-gcloud-auth-plugin" CLI
provider "kubernetes" {
  host                   = "https://${local.k8s_cluster_endpoint}"
  cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gke-gcloud-auth-plugin"
  }
}

# Helm provider. Kubernetes authentication taken from local "gke-gcloud-auth-plugin" CLI
provider "helm" {
  kubernetes = {
    host                   = "https://${local.k8s_cluster_endpoint}"
    cluster_ca_certificate = base64decode(local.cluster_ca_certificate)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gke-gcloud-auth-plugin"
    }
  }
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-helm-registry-auth.md" >}}

5. Create a GCP IAM service account and allow the Kubernetes service account to impersonate it using GKE Workload Identity:

```json
# This GCP service account will be used by the runner
resource "google_service_account" "platform_orchestrator_kubernetes_agent" {
  account_id   = "runner-${local.cluster_name}"
  display_name = "Orchestrator Kubernetes agent runner on cluster ${local.cluster_name}"
}

resource "google_service_account_iam_member" "workload_identity_binding" {
  service_account_id = google_service_account.platform_orchestrator_kubernetes_agent.id
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${local.gcp_project_id}.svc.id.goog[${local.cluster_runner_job_namespace}/${local.cluster_runner_job_serviceaccount}]"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Set values

```bash
export GCP_PROJECT_ID=<my-gcp-project-id>
export CLUSTER_LOCATION=<my-cluster-region>
export CLUSTER_NAME=<my-cluster-name>

# The Kubernetes namespace where the kubernetes-agent runner should run
export CLUSTER_RUNNER_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-ns"

# The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
export CLUSTER_RUNNER_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner"

# The Kubernetes namespace where the deployment jobs should run
export CLUSTER_RUNNER_JOB_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-job-ns"

# The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
export CLUSTER_RUNNER_JOB_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner-job"
```

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-values.md" %}}

2. Set the `gcloud` CLI to your project:

```bash
gcloud config set project $GCP_PROJECT_ID
```

3. Create a Google Cloud service account:

```bash
export GCP_SERVICE_ACCOUNT_NAME=runner-${CLUSTER_NAME}

gcloud iam service-accounts create ${GCP_SERVICE_ACCOUNT_NAME} \
    --description="Used by Kubernetes Agent Runner" \
    --display-name="Orchestrator Kubernetes agent runner on cluster ${CLUSTER_NAME}" \
    --project=${GCP_PROJECT_ID}
```

4. Allow the Kubernetes service account to impersonate the Google Cloud service account using GKE Workload Identity:

```bash
gcloud iam service-accounts add-iam-policy-binding ${GCP_SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com \
    --role="roles/iam.workloadIdentityUser" \
    --member="serviceAccount:${GCP_PROJECT_ID}.svc.id.goog[${CLUSTER_RUNNER_JOB_NAMESPACE}/${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}]" \
    --project=${GCP_PROJECT_ID}
```

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-createkeys.md" %}}

{{< tabs >}}
{{% tab name="TF" %}}

6. Define the runner resource using the public Orchestrator module and the key pair to install the runner into the cluster and register it with the Orchestrator:

```hcl
module "kubernetes_agent_runner" {
  source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"
  # To pin a specific module release, use this notation:
  # source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner?ref=vX.Y.Z"

  orchestrator_org_id          = local.platform_orchestrator_org
  runner_id                    = local.runner_id
  private_key_path             = "./runner_private_key.pem"
  public_key_path              = "./runner_public_key.pem"
  k8s_namespace                = local.cluster_runner_namespace
  k8s_service_account_name     = local.cluster_runner_serviceaccount
  k8s_job_namespace            = local.cluster_runner_job_namespace
  k8s_job_service_account_name = local.cluster_runner_job_serviceaccount

  # GKE Workload Identity configuration - link to the GCP service account created above
  service_account_annotations = {
    "iam.gke.io/gcp-service-account" = google_service_account.platform_orchestrator_kubernetes_agent.email
  }
}

# Provide the runner ID as an output
output "runner_id" {
  value = module.kubernetes_agent_runner.runner_id
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-module.md" >}}

7. Assign any GCP permissions the runner will need to provision GCP resources to the IAM service account. E.g. to enable the runner to manage CloudSQL instances, attach a policy like this:

```json
resource "google_project_iam_member" "agent_runner_cloudsql_admin" {
  project = local.gcp_project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${google_service_account.platform_orchestrator_kubernetes_agent.email}"
}
```

8. Verify the `kubectl` context is set to your target cluster:

```bash
kubectl config current-context
```

9. Initialize and apply the TF configuration:

{{% details "Terraform" %}}

```bash
terraform init
terraform apply
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
tofu init
tofu apply
```

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

5. Verify the kubectl context is set to your target cluster:

```bash
kubectl config current-context
```

6. Set values:

```bash
export PO_ORG_ID=<my-org>
export RUNNER_ID=kubernetes-agent-${CLUSTER_NAME}
```

7. Create the namespace for the runner and a secret holding the runner private key:

```bash
kubectl create namespace ${CLUSTER_RUNNER_NAMESPACE}

kubectl create secret generic platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --from-literal=private_key="$(cat runner_private_key.pem)"
```

8. Create the namespace for the runner jobs:

```bash
kubectl create namespace ${CLUSTER_RUNNER_JOB_NAMESPACE}
```

9. Install the runner Helm chart onto the cluster, providing required values:

```bash
helm install platform-orchestrator-kubernetes-agent-runner \
  oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --set platformOrchestrator.orgId=${PO_ORG_ID} \
  --set platformOrchestrator.runnerId=${RUNNER_ID} \
  --set platformOrchestrator.existingSecret=platform-orchestrator-kubernetes-agent-runner \
  --set namespaceOverride=${CLUSTER_RUNNER_NAMESPACE} \
  --set serviceAccount.name=${CLUSTER_RUNNER_SERVICEACCOUNT} \
  --set jobsRbac.namespace=${CLUSTER_RUNNER_JOB_NAMESPACE} \
  --set jobsRbac.serviceAccountName=${CLUSTER_RUNNER_JOB_SERVICEACCOUNT} \
  --set "serviceAccount.annotations.iam\.gke\.io/gcp-service-account=${GCP_SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
```

The value `serviceAccount.annotations.iam.gke.io/gcp-service-account` annotates the Kubernetes service account to leverage GKE Workload Identity for the runner to authenticate against GCP.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-helm.md" >}}

10. Register the `kubernetes-agent` runner with the Orchestrator:

```bash
octl create runner ${RUNNER_ID} \
  --set=runner_configuration="$(jq -nc --arg key "$(cat runner_public_key.pem)" '{"type": "kubernetes-agent","key":$key,"job":{"namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'","service_account":"'${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}'"}}')" \
  --set=state_storage_configuration='{"type":"kubernetes","namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'"}'
```

11. Assign any GCP permissions the runner will need to provision GCP resources to the IAM service account. E.g. to enable the runner to manage CloudSQL instances, attach a policy like this:

```bash
gcloud projects add-iam-policy-binding ${GCP_PROJECT_ID} \
  --member "serviceAccount:${GCP_SERVICE_ACCOUNT_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com" \
  --role "roles/cloudsql.admin"
```

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-followup.md" %}}

## AKS-specific setup

To have the `kubernetes-agent` runner in your AKS cluster, you need:

- An existing [Azure AKS cluster](https://learn.microsoft.com/en-us/azure/aks/what-is-aks) with [OIDC Issuer](https://learn.microsoft.com/en-us/azure/aks/use-oidc-issuer) and [Azure Workload Identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) enabled
- The [`az` CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated with a principal having permission to manage managed identities and role assignments in the Azure subscription of the AKS cluster
- The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed locally and the current context set to the target cluster
- Depending on your choice of tooling:
  - TF: Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed
  - `octl` CLI: [helm](https://helm.sh/docs/intro/install/) installed locally

The setup utilizes [Azure Workload Identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) for the AKS cluster to provide credentials to the runner for TF execution.

{{< tabs >}}
{{% tab name="TF" %}}

1. Declare the required providers:

```json
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4"
    }
    # Providers needed to install the kubernetes-agent runner Helm chart and register it with the Orchestrator
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 2"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3"
    }
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}
```

2. Set values according to your setup. Change the default values at your discretion:

```hcl
locals {
  azure_subscription_id      = "<my-azure-subscription-id>"
  azure_resource_group       = "<my-azure-resource-group>"
  cluster_name               = "<my-aks-cluster-name>"
  platform_orchestrator_org  = "<my-org>"
  runner_id                  = "kubernetes-agent-${local.cluster_name}" # Adjust the ID at your discretion

  # The Kubernetes namespace where the kubernetes-agent runner should run
  cluster_runner_namespace = "platform-orchestrator-kubernetes-agent-runner-ns"

  # The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
  cluster_runner_serviceaccount = "platform-orchestrator-kubernetes-agent-runner"

  # The Kubernetes namespace where the deployment jobs should run
  cluster_runner_job_namespace = "platform-orchestrator-kubernetes-agent-runner-job-ns"

  # The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
  cluster_runner_job_serviceaccount = "platform-orchestrator-kubernetes-agent-runner-job"
}
```

Use TF variables of your module instead of placing the raw values in the `locals` at your discretion.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-values.md" >}}

3. Create a data source from the existing cluster and extract required cluster properties:

```hcl
# Data source for the existing AKS cluster
data "azurerm_kubernetes_cluster" "cluster" {
  name                = local.cluster_name
  resource_group_name = local.azure_resource_group
}

# Extract cluster properties
locals {
  cluster_oidc_issuer_url = data.azurerm_kubernetes_cluster.cluster.oidc_issuer_url
}
```

4. Configure providers:

```hcl
# Azure provider. Authentication taken from local "az" CLI
provider "azurerm" {
  subscription_id = local.azure_subscription_id
  features {}
}

# Platform Orchestrator provider. Authentication taken from local "octl" CLI
provider "platform-orchestrator" {
  org_id = local.platform_orchestrator_org
}

# Kubernetes provider. Authentication taken from local kubeconfig context
# Before running TF, set your context: az aks get-credentials --resource-group <rg> --name <cluster>
# Check the provider documentation for alternative ways of authentication
provider "kubernetes" {
  config_path    = "~/.kube/config" # Adjust if needed or remove if default works
  config_context = local.cluster_name
}

# Helm provider. Kubernetes authentication taken from local kubeconfig context
# Check the provider documentation for alternative ways of authentication
provider "helm" {
  kubernetes = {
    config_path    = "~/.kube/config" # Adjust if needed or remove if default works
    config_context = local.cluster_name
  }
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-helm-registry-auth.md" >}}

5. Create a User Assigned Managed Identity and a Federated Identity Credential to enable Azure Workload Identity for the runner jobs:

```hcl
# This managed identity will be assumed by the runner jobs
resource "azurerm_user_assigned_identity" "platform_orchestrator_kubernetes_agent" {
  name                = "platform-orchestrator-kubernetes-agent-runner-${local.cluster_name}"
  resource_group_name = local.azure_resource_group
  location            = data.azurerm_kubernetes_cluster.cluster.location
}

# Allow the Kubernetes service account used by the runner jobs to assume the managed identity
resource "azurerm_federated_identity_credential" "platform_orchestrator_kubernetes_agent" {
  name                = "platform-orchestrator-kubernetes-agent-runner"
  parent_id           = azurerm_user_assigned_identity.platform_orchestrator_kubernetes_agent.id
  issuer              = local.cluster_oidc_issuer_url
  subject             = "system:serviceaccount:${local.cluster_runner_job_namespace}:${local.cluster_runner_job_serviceaccount}"
  audience            = ["api://AzureADTokenExchange"]
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

1. Set values

```bash
export AZURE_SUBSCRIPTION_ID=<my-azure-subscription-id>
export AZURE_RESOURCE_GROUP=<my-azure-resource-group>
export CLUSTER_NAME=<my-aks-cluster-name>

# The Kubernetes namespace where the kubernetes-agent runner should run
export CLUSTER_RUNNER_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-ns"

# The name of the Kubernetes service account to be assumed by the kubernetes-agent runner
export CLUSTER_RUNNER_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner"

# The Kubernetes namespace where the deployment jobs should run
export CLUSTER_RUNNER_JOB_NAMESPACE="platform-orchestrator-kubernetes-agent-runner-job-ns"

# The name of the Kubernetes service account to be assumed by the deployment jobs created by the kubernetes-agent runner
export CLUSTER_RUNNER_JOB_SERVICEACCOUNT="platform-orchestrator-kubernetes-agent-runner-job"
```

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-values.md" %}}

2. Obtain and output the AKS cluster's OIDC issuer URL:

```bash
export CLUSTER_OIDC_ISSUER=$(az aks show \
  --name ${CLUSTER_NAME} \
  --resource-group ${AZURE_RESOURCE_GROUP} \
  --query "oidcIssuerProfile.issuerUrl" \
  -o tsv)

echo $CLUSTER_OIDC_ISSUER
```

3. Create a User Assigned Managed Identity for the runner jobs:

```bash
export MANAGED_IDENTITY_NAME=platform-orchestrator-kubernetes-agent-runner-${CLUSTER_NAME}

az identity create \
  --name ${MANAGED_IDENTITY_NAME} \
  --resource-group ${AZURE_RESOURCE_GROUP} \
  --subscription ${AZURE_SUBSCRIPTION_ID}
```

4. Create a Federated Identity Credential to allow the Kubernetes service account used by the runner jobs to assume the managed identity:

```bash
az identity federated-credential create \
  --name platform-orchestrator-kubernetes-agent-runner \
  --identity-name ${MANAGED_IDENTITY_NAME} \
  --resource-group ${AZURE_RESOURCE_GROUP} \
  --issuer ${CLUSTER_OIDC_ISSUER} \
  --subject "system:serviceaccount:${CLUSTER_RUNNER_JOB_NAMESPACE}:${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}" \
  --audiences api://AzureADTokenExchange
```

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-createkeys.md" %}}

{{< tabs >}}
{{% tab name="TF" %}}

6. Define the runner resource using the public Orchestrator module and the key pair to install the runner into the cluster and register it with the Orchestrator:

```hcl
module "kubernetes_agent_runner" {
  source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"
  # To pin a specific module release, use this notation:
  # source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner?ref=vX.Y.Z"

  orchestrator_org_id          = local.platform_orchestrator_org
  runner_id                    = local.runner_id
  private_key_path             = "./runner_private_key.pem"
  public_key_path              = "./runner_public_key.pem"
  k8s_namespace                = local.cluster_runner_namespace
  k8s_service_account_name     = local.cluster_runner_serviceaccount
  k8s_job_namespace            = local.cluster_runner_job_namespace
  k8s_job_service_account_name = local.cluster_runner_job_serviceaccount

  # Azure Workload Identity configuration for runner job pods:
  # - the service account annotation identifies the managed identity to use
  # - the pod label triggers token injection by the AKS Workload Identity webhook
  service_account_annotations = {
    "azure.workload.identity/client-id" = azurerm_user_assigned_identity.platform_orchestrator_kubernetes_agent.client_id
  }
  pod_template = jsonencode({
    metadata = {
      labels = {
        "azure.workload.identity/use" = "true"
      }
    }
  })
}

# Provide the runner ID as an output
output "runner_id" {
  value = module.kubernetes_agent_runner.runner_id
}
```

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-tf-module.md" >}}

7. Assign any Azure permissions the runner will need to provision Azure resources to the managed identity. E.g. to enable the runner to manage Azure SQL servers, attach a role assignment like this:

```hcl
resource "azurerm_role_assignment" "agent_runner_sql_contributor" {
  scope                = "/subscriptions/${local.azure_subscription_id}/resourceGroups/${local.azure_resource_group}"
  role_definition_name = "SQL Server Contributor"
  principal_id         = azurerm_user_assigned_identity.platform_orchestrator_kubernetes_agent.principal_id
}
```

The exact permissions and scope is at your own discretion and depending on your resource requirements.

8. Verify the `kubectl` context is set to your target cluster:

```bash
az aks get-credentials --resource-group <my-azure-resource-group> --name <my-aks-cluster-name>
kubectl config current-context
```

9. Initialize and apply the TF configuration:

{{% details "Terraform" %}}

```bash
terraform init
terraform apply
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
tofu init
tofu apply
```

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

5. Verify the `kubectl` context is set to your target cluster:

```bash
az aks get-credentials --resource-group ${AZURE_RESOURCE_GROUP} --name ${CLUSTER_NAME}
kubectl config current-context
```

6. Set values:

```bash
export PO_ORG_ID=<my-org>
export RUNNER_ID=kubernetes-agent-${CLUSTER_NAME}
```

7. Create the namespace for the runner and a secret holding the runner private key:

```bash
kubectl create namespace ${CLUSTER_RUNNER_NAMESPACE}

kubectl create secret generic platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --from-literal=private_key="$(cat runner_private_key.pem)"
```

8. Create the namespace for the runner jobs:

```bash
kubectl create namespace ${CLUSTER_RUNNER_JOB_NAMESPACE}
```

9. Install the runner Helm chart onto the cluster, providing required values:

```bash
export MANAGED_IDENTITY_CLIENT_ID=$(az identity show \
  --name ${MANAGED_IDENTITY_NAME} \
  --resource-group ${AZURE_RESOURCE_GROUP} \
  --query clientId -o tsv)

helm install platform-orchestrator-kubernetes-agent-runner \
  oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner \
  -n ${CLUSTER_RUNNER_NAMESPACE} \
  --set platformOrchestrator.orgId=${PO_ORG_ID} \
  --set platformOrchestrator.runnerId=${RUNNER_ID} \
  --set platformOrchestrator.existingSecret=platform-orchestrator-kubernetes-agent-runner \
  --set namespaceOverride=${CLUSTER_RUNNER_NAMESPACE} \
  --set serviceAccount.name=${CLUSTER_RUNNER_SERVICEACCOUNT} \
  --set jobsRbac.namespace=${CLUSTER_RUNNER_JOB_NAMESPACE} \
  --set jobsRbac.serviceAccountName=${CLUSTER_RUNNER_JOB_SERVICEACCOUNT} \
  --set "serviceAccount.annotations.azure\.workload\.identity/client-id=${MANAGED_IDENTITY_CLIENT_ID}"
```

The value `serviceAccount.annotations.azure.workload.identity/client-id` annotates the Kubernetes service account to identify the managed identity to use for Azure Workload Identity.

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-self-hosting-cli-helm.md" >}}

10. Register the `kubernetes-agent` runner with the Orchestrator, configuring the pod label required by Azure Workload Identity:

```bash
octl create runner ${RUNNER_ID} \
  --set=runner_configuration="$(jq -nc --arg key "$(cat runner_public_key.pem)" '{"type": "kubernetes-agent","key":$key,"job":{"namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'","service_account":"'${CLUSTER_RUNNER_JOB_SERVICEACCOUNT}'","pod_template":{"metadata":{"labels":{"azure.workload.identity/use":"true"}}}}}')" \
  --set=state_storage_configuration='{"type":"kubernetes","namespace":"'${CLUSTER_RUNNER_JOB_NAMESPACE}'"}'
```

The `pod_template.metadata.labels` value triggers token injection by the AKS Workload Identity webhook.

11. Assign any Azure permissions the runner will need to provision Azure resources to the managed identity. E.g. to enable the runner to manage Azure SQL servers, attach a role assignment like this:

```bash
export MANAGED_IDENTITY_PRINCIPAL_ID=$(az identity show \
  --name ${MANAGED_IDENTITY_NAME} \
  --resource-group ${AZURE_RESOURCE_GROUP} \
  --query principalId -o tsv)

az role assignment create \
  --assignee ${MANAGED_IDENTITY_PRINCIPAL_ID} \
  --role "SQL Server Contributor" \
  --scope /subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}
```

The exact permissions and scope is at your own discretion and depending on your resource requirements.

{{% /tab %}}
{{< /tabs >}}

{{% include "/platform-orchestrator/docs/configure/runners/runner-types/include-kubernetes-agent-runner-followup.md" %}}

## Assign runner permissions

The `kubernetes-agent` runner will spawn Kubernetes Jobs and corresponding Pods in the Kubernetes namespace and using the Kubernetes service account you configured as part of the runner setup.

The runner Pods will execute the TF code for a deployment, containing the required TF `providers`. Each TF `provider` has its own way of receiving authentication configuration for gaining permissions.

For example, the [`hashicorp/aws` provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration) may use container credentials for EKS workload identity through annotating the Kubernetes service account for the runner Pods. The [setup instructions for EKS](#eks-specific-setup) therefore include an appropriate annotation.

Consult your Kubernetes runtime environment and TF `providers` to determine the required configuration. You have these options with the `kubernetes-agent` runner:

- Providing Kubernetes service account annotations
- Providing environment variables
- Modifying the runner Pod template in any other custom way to make data available to the runner

The [`kubernetes-agent` runner TF module](https://github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner/) shows examples for all these cases.

## Setting sensitive environment variables

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-k8s-secret-variables.md" >}}
