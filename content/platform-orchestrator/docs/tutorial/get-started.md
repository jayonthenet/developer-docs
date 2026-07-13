---
title: "Get started"
description: "Get started using the Platform Orchestrator by following this step-by-step guide to learn all essential concepts and perform your first hands-on tasks."
lead: ""
draft: false
type: docs
weight: 10
toc: true
---

{{% description %}}

At the end of this tutorial you will know how to:

- Setup your infrastructure to run Orchestrator deployments
- Describe an application and its resource requirements
- Use the Orchestrator to deploy a workload
- Use the Orchestrator to deploy dependent infrastructure resources like a database
- Observe the results and status of deployments
- Create a link from the Orchestrator to real-world resources

The tutorial flow creates some temporary infrastructure that you will clean up again at the end.

Duration: about 45min

## What is the Platform Orchestrator?

Stellwerk’s Platform Orchestrator unifies infrastructure management for humans and AI agents, streamlining operations, enforcing standards, and boosting developer productivity in complex environments.

## Prerequisites

The tutorial currently supports using these cloud providers:

| <center><img src="/images/AWS-Cloud-logo_32.svg" alt="AWS cloud logo" width="28rem"/> Amazon Web Services (AWS) </center> | <center><img src="/images/10018-icon-service-Azure-A.svg" alt="Azure logo" width="20rem"/> Microsoft Azure</center> | <center><img src="/images/google_cloud.png" alt="Google Cloud logo" width="20rem"/> Google Cloud Platform (GCP)</center> |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| <center>✅ Supported</center>                                                                           | <center>✅ Supported</center>                                                                      | <center>✅ Supported</center>                                                                         |

To walk through this tutorial, you'll need:

- An account in one of the supported cloud providers to provision some temporary infrastructure to run and deploy resources
- Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed locally
- [Git](https://git-scm.com/downloads) installed locally
- (optional) [kubectl](https://kubernetes.io/docs/tasks/tools/) installed locally

{{< alert context="info" >}}
Executing the tutorial will incur minor cloud cost for running resources in your account. Although they are configured for a very small footprint, make sure to clean up when done.
{{< /alert >}}
<br/>

### Amazon Web Services (AWS)

<img src="/images/AWS-Cloud-logo_32.svg" alt="AWS cloud logo" width="20rem"/> When using AWS, you'll also need:

- Access to an AWS project that has sufficient quota to run a Kubernetes cluster and a small RDS database
- The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and authenticated. The tutorial will use this authenticated user to set up the base infrastructure on AWS

### Google Cloud Platform (GCP)

<img src="/images/google_cloud.png" alt="Google Cloud logo" width="16rem"/> When using GCP, you'll also need:

- Access to an GCP project that has sufficient quota to run a Kubernetes cluster and a small Cloud SQL
 database
- The GCP project must have the "Cloud SQL Admin API" enabled to perform the database steps. Go to the [Google Cloud console](https://console.cloud.google.com/apis/library/sqladmin.googleapis.com) to check the status and activate the API
- The [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated. The tutorial will use this authenticated user to set up the base infrastructure on GCP

### Microsoft Azure

<img src="/images/10018-icon-service-Azure-A.svg" alt="Azure logo" width="20rem"/> When using Azure, you'll also need:

- Access to an Azure subscription that has sufficient quota to run an AKS cluster and a small Azure Database for PostgreSQL instance
- The [`az` CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated. The tutorial will use this authenticated user to set up the base infrastructure on Azure
- The [`kubelogin` CLI](https://azure.github.io/kubelogin/install.html) installed. This is required by the Kubernetes TF provider to authenticate against AKS

## Create an organization

{{% description "/platform-orchestrator/docs/configure/organizations" %}}

If you already have an organization, you're good. Otherwise, [register](https://console.stellwerk.dev/auth/register) for a free trial organization now.

Once done, you will have access to the Orchestrator console at [https://console.stellwerk.dev](https://console.stellwerk.dev).

## Install the octl CLI

Follow the instructions on the [CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) page to install the `octl` CLI if it is not already present on your system.

Ensure you are logged in. Execute this command and follow the instructions:

```bash
octl login
```

Ensure that the CLI is configured to use your Orchestrator organization:

```bash
octl config show
```

If the `default_org_id` is empty, set the organization to your value like this:

```bash
octl config set-org your-org-id
```

All subsequent `octl` commands will now be targeted at your organization.

## Setup demo infrastructure

This tutorial requires some demo infrastructure to run things. Most notably, it creates a publicly accessible Kubernetes cluster to host both a runner component and to deploy a workload to.

We have prepared a public repository with Terraform/OpenTofu ("TF") code to set it up in the cloud of your choice.

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

Clone the repository and navigate to the `infra` directory:

```bash
git clone https://github.com/stellwerk-labs/get-started
cd get-started/infra
```

The repository comes with a `terraform.tfvars.template` file. Copy this file and remove the template extension:

```bash
cp terraform.tfvars.template terraform.tfvars
```

Edit the new `terraform.tfvars` file and provide all necessary values as instructed by the inline comments in the section for your selected cloud provider.

Activate the Terraform/OpenTofu file for your selected cloud provider (make sure to use only one):

{{% details "AWS" %}}

```bash
mv aws.tf.useme aws.tf
```

{{% /details %}}

{{% details "GCP" %}}

```bash
mv gcp.tf.useme gcp.tf
```

{{% /details %}}

{{% details "Azure" %}}

```bash
mv azure.tf.useme azure.tf
```

{{% /details %}}

Initialize your Terraform or OpenTofu environment and run `apply`:

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

Check the output to see which resources will be created, and confirm. This may take five minutes or more.

To continue with the tutorial while the `apply` is being executed, open a new shell and navigate to the `./orchestrator` directory:

```bash
cd <your-repo-checkout-location>/get-started/orchestrator
```

You now have:

- ✅ Created a generic infrastructure which will serve to run deployments and spin up resources

## Set up the TF Orchestrator provider

{{< alert context="info" >}}
For simplicity, the TF code uses a local backend to store the state. You can clean up the entire setup at the end of this tutorial to safely remove it again.
{{< /alert >}}

### Copy variable values from the demo infrastructure

Copy the existing `terraform.tfvars` file from the `infra` directory into the present `orchestrator` directory to re-use them:

```bash
cp ../infra/terraform.tfvars .
```

### Prepare the TF core setup

Open the `terraform.tfvars` file (the one in the current `orchestrator` directory) and append the following configuration, replacing the organization value with yours.

```json
# ===================================
# Platform Orchestrator configuration
# ===================================

# Your Orchestrator organization ID
orchestrator_org = "replace-with-your-orchestrator-organization-id"

```

- Save the file.

You will now set up the [Platform Orchestrator provider for Terraform/OpenTofu]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}) to maintain Orchestrator resources in your organization.

Create a new file named `providers.tf` in the current `orchestrator` directory, containing this content:

```json
terraform {
  required_providers {
    # Provider for managing Orchestrator objects
    platform-orchestrator = {
      source  = "stellwerk-labs/platform-orchestrator"
      version = "~> 2"
    }
  }
}
```

You don't need to explicitly configure the Orchestrator TF provider with the organization ID and token as the provider falls back to the `$HOME/.config/octl` file set by running `octl login`.

You now have:

- ✅ Configured the Orchestrator TF provider locally so that you can now manage Orchestrator objects via IaC

## Create a runner

{{% description "/platform-orchestrator/docs/configure/runners/overview" %}}

You will now define a [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) that is using the demo infrastructure created for this tutorial.

You also define a [runner rule]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}). {{% description "/platform-orchestrator/docs/configure/runners/runner-rules" %}}

There are different runner types. This tutorial uses the `kubernetes-agent` runner which works on all kinds of Kubernetes clusters. It is installed into the demo cluster via a Helm chart and, for simplicity, will maintain TF state in Kubernetes secrets.

{{< alert context="info" >}}
The next steps require the TF `apply` for the demo infrastructure to be finished. Verify now that this is the case by checking your shell, which may be another window.
{{< /alert >}}

Make sure you are in the `orchestrator` directory in your shell.

Create a private/public key pair for the runner to authenticate against the Orchestrator:

```bash
openssl genpkey -algorithm ed25519 -out runner_private_key.pem
openssl pkey -in runner_private_key.pem -pubout -out runner_public_key.pem
```

Prepare additional variables. This command will create a new variables file `orchestrator.tfvars`, using values from the `outputs` of the prior demo infrastructure setup:

{{% details "Terraform" %}}

```bash
cat << EOF > orchestrator.tfvars
enabled_cloud_provider = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".enabled_cloud_provider.value")"
k8s_cluster_name = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".k8s_cluster_name.value")"
cluster_ca_certificate = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".cluster_ca_certificate.value")"
k8s_cluster_endpoint = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".k8s_cluster_endpoint.value")"
agent_runner_irsa_role_arn = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".agent_runner_irsa_role_arn.value")"
gcp_agent_runner_service_account_email = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".gcp_agent_runner_service_account_email.value")"
azure_agent_runner_managed_identity_client_id = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".azure_agent_runner_managed_identity_client_id.value")"
azure_tenant_id = "$(terraform output -state "../infra/terraform.tfstate" -json | jq -r ".azure_tenant_id.value")"
EOF
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
cat << EOF > orchestrator.tfvars
enabled_cloud_provider = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".enabled_cloud_provider.value")"
k8s_cluster_name = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".k8s_cluster_name.value")"
cluster_ca_certificate = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".cluster_ca_certificate.value")"
k8s_cluster_endpoint = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".k8s_cluster_endpoint.value")"
agent_runner_irsa_role_arn = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".agent_runner_irsa_role_arn.value")"
gcp_agent_runner_service_account_email = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".gcp_agent_runner_service_account_email.value")"
azure_agent_runner_managed_identity_client_id = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".azure_agent_runner_managed_identity_client_id.value")"
azure_tenant_id = "$(tofu output -state "../infra/terraform.tfstate" -json | jq -r ".azure_tenant_id.value")"
EOF
```

{{% /details %}}

Verify all values are set. If they are not, the `apply` run for the demo infrastructure may not be finished yet. Wait for this to be done, and repeat the previous command.

```bash
cat orchestrator.tfvars
```

Open the file `providers.tf` and add this configuration to the `required_providers` block:

```json
    # Provider for installing the runner Helm chart
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3"
    }
    # Provider for installing K8s objects for the runner
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    # Provider for reading local files
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
```

Create a new file named `orchestrator.tf` in the current `orchestrator` directory, containing this configuration:

```json
data "local_file" "agent_runner_public_key" {
  filename = "./runner_public_key.pem"
}
data "local_file" "agent_runner_private_key" {
  filename = "./runner_private_key.pem"
}

# Configure the Kubernetes provider for accessing the demo cluster
provider "kubernetes" {
  host                   = var.k8s_cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca_certificate)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = var.enabled_cloud_provider == "aws" ? ["eks", "get-token", "--output", "json", "--cluster-name", var.k8s_cluster_name, "--region", var.aws_region] : var.enabled_cloud_provider == "azure" ? ["get-token", "--login", "azurecli", "--server-id", "6dae42f8-4368-4678-94ff-3960e28e3630"] : null
    command     = var.enabled_cloud_provider == "aws" ? "aws" : var.enabled_cloud_provider == "azure" ? "kubelogin" : "gke-gcloud-auth-plugin"
  }
}

# Configure the Helm provider to use the cloud CLI for K8s auth
provider "helm" {
  kubernetes = {
    host                   = var.k8s_cluster_endpoint
    cluster_ca_certificate = base64decode(var.cluster_ca_certificate)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = var.enabled_cloud_provider == "aws" ? ["eks", "get-token", "--output", "json", "--cluster-name", var.k8s_cluster_name, "--region", var.aws_region] : var.enabled_cloud_provider == "azure" ? ["get-token", "--login", "azurecli", "--server-id", "6dae42f8-4368-4678-94ff-3960e28e3630"] : null
      command     = var.enabled_cloud_provider == "aws" ? "aws" : var.enabled_cloud_provider == "azure" ? "kubelogin" : "gke-gcloud-auth-plugin"
    }
  }
}

# Install the Kubernetes agent runner Helm chart and its prerequisites and register the runner with the Orchestrator
module "kubernetes_agent_runner" {
  source = "github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"

  humanitec_org_id = var.orchestrator_org
  private_key_path = "./runner_private_key.pem"
  public_key_path  = "./runner_public_key.pem"

  # Workload Identity configuration - link to the cloud IAM identity created above
  service_account_annotations = var.enabled_cloud_provider == "aws" ? {
    "eks.amazonaws.com/role-arn" = var.agent_runner_irsa_role_arn
    } : var.enabled_cloud_provider == "azure" ? {
    "azure.workload.identity/client-id" = var.azure_agent_runner_managed_identity_client_id
    } : {
    "iam.gke.io/gcp-service-account" = var.gcp_agent_runner_service_account_email
  }

  pod_template = var.enabled_cloud_provider == "azure" ? jsonencode({
    metadata = {
      labels = {
        "azure.workload.identity/use" = "true"
      }
    }
  }) : null
}

# Assign a pre-existing ClusterRole to the service account used by the runner
# to enable the runner to create deployments in other namespaces
resource "kubernetes_cluster_role_binding" "runner_inner_cluster_admin" {
  metadata {
    name = "platform-orchestrator-kubernetes-agent-runner-cluster-admin"
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "admin"
  }
  subject {
    kind      = "ServiceAccount"
    name      = module.kubernetes_agent_runner.k8s_job_service_account_name
    namespace = module.kubernetes_agent_runner.k8s_job_namespace
  }
}
```

Re-initialize your Terraform or OpenTofu environment and run another `apply`:

{{% details "Terraform" %}}

```bash
terraform init
terraform apply -var-file=orchestrator.tfvars
```

{{% /details %}}
{{% details "OpenTofu" %}}

```bash
tofu init
tofu apply -var-file=orchestrator.tfvars
```

{{% /details %}}

While the `apply` executes, inspect the resources now being added. Refer to the inline comments for an explanation of each resource.

You now have:

- ✅ Installed a runner component into the demo infrastructure
- ✅ Configured the runner with a key pair
- ✅ Enabled the runner to maintain TF state
- ✅ Registered the runner with the Orchestrator

The runner is now ready to execute deployments, polling the Orchestrator for deployment requests.

## Create a project and environment

Prepare the Orchestrator to receive deployments by creating a [project]({{< relref "/platform-orchestrator/docs/configure/projects" >}}) with one [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}) which will be the deployment target.

{{% description "/platform-orchestrator/docs/configure/projects" %}}

{{% description "/platform-orchestrator/docs/configure/environments" %}}

Environments are classified by [environment types]({{< relref "/platform-orchestrator/docs/configure/environment-types" >}}), so you need to create one of these as well.

An environment needs to have a runner assigned to it at all times, so you also create a [runner rule]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}). {{% description "/platform-orchestrator/docs/configure/runners/runner-rules" %}} The runner rule will assign the runner you just created to the new environment.

Open the file `orchestrator.tf` and append this configuration:

```json
# Create a project
resource "platform-orchestrator_project" "get_started" {
  id = "get-started"
}

# Create a runner rule
resource "platform-orchestrator_runner_rule" "get_started" {
  runner_id  = module.kubernetes_agent_runner.runner_id
  project_id = platform-orchestrator_project.get_started.id
}

# Create an environment type
resource "platform-orchestrator_environment_type" "get_started_development" {
  id = "get-started-development"
}

# Create an environment "development" in the project "get-started"
resource "platform-orchestrator_environment" "development" {
  id          = "development"
  project_id  = platform-orchestrator_project.get_started.id
  env_type_id = platform-orchestrator_environment_type.get_started_development.id

  # Ensure the runner rule is in place so that the Orchestrator may assign a runner to the environment
  depends_on = [platform-orchestrator_runner_rule.get_started]
}
```

{{% include "/platform-orchestrator/docs/tutorial/include-get-started-perform-tf-apply.md" %}}

The plan will now output the new Orchestrator objects to be added. Confirm the `apply` to do so.

You now have:

- ✅ Created a logical project and environment to serve as a deployment target

## Create a module for a workload

You will now set up the Orchestrator for deploying a simple workload as a Kubernetes [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) to the demo cluster.

Enabling the Orchestrator to deploy things is done through a [module]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}). {{% description "/platform-orchestrator/docs/configure/modules/overview.md" %}}

{{% include "/platform-orchestrator/docs/what-is-the-platform-orchestrator/include-tf-only.md" %}}

Every module is of a [resource type]({{< relref "/platform-orchestrator/docs/configure/resource-types.md" >}}). {{% description "/platform-orchestrator/docs/configure/resource-types.md" %}}

You also need a simple [module rule]({{< relref "/platform-orchestrator/docs/configure/modules/module-rules" >}}). {{% description "/platform-orchestrator/docs/configure/modules/module-rules.md" %}}

You will now create one object of each kind. They are all rather simple. The module itself wraps an existing TF module from a public Git source.

{{< alert context="info" >}}
This mechanism allows you to continue using your existing TF modules when starting to use the Orchestrator.
{{< /alert >}}

Open the file `orchestrator.tf` and add this configuration to define the Orchestrator objects previously mentioned:

```json
# Create a resource type "k8s-workload-get-started" with an empty output schema
resource "platform-orchestrator_resource_type" "k8s_workload_get_started" {
  id          = "k8s-workload-get-started"
  description = "Kubernetes workload for the Get started tutorial"
  output_schema = jsonencode({
    type = "object"
    properties = {}
  })
  is_developer_accessible = true
}

# Create a module, setting values for the module variables
resource "platform-orchestrator_module" "k8s_workload_get_started" {
  id            = "k8s-workload-get-started"
  description   = "Simple Kubernetes Deployment in default namespace"
  resource_type = platform-orchestrator_resource_type.k8s_workload_get_started.id
  module_source = "git::https://github.com/stellwerk-tf-modules/k8s-workload-kubernetes?ref=v1.0.0"

  module_params = {
    image = {
      type        = "string"
      description = "The image to use for the container"
    }
    env_vars = {
      type        = "map"
      is_optional = true
      description = "Container environment variables"
    }
  }
  module_inputs = jsonencode({
    name      = "get-started"
    namespace = "default"
    labels = {
      app = "get-started"
    }
  })
}

# Create a module rule making the module applicable to the demo project
resource "platform-orchestrator_module_rule" "k8s_workload_get_started" {
  module_id  = platform-orchestrator_module.k8s_workload_get_started.id
  project_id = platform-orchestrator_project.get_started.id
}
```

{{% include "/platform-orchestrator/docs/tutorial/include-get-started-perform-tf-apply.md" %}}

To inspect the TF module code referenced by the module, go to the [GitHub source](https://github.com/stellwerk-tf-modules/k8s-workload-kubernetes).

The Orchestrator is now configured to deploy resources of the new type `k8s-workload-get-started`. Verify it by querying the available resource types for the target project environment:

```bash
octl get available-resource-types get-started development
```

You now have:

- ✅ Instructed the Orchestrator how to deploy a containerized workload via a module
- ✅ Instructed the Orchestrator when to use the module via a module rule

## Create a manifest

You can now utilize the Orchestator configuration prepared in the previous steps and perform an actual deployment using the [manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) file. {{% description "/platform-orchestrator/docs/deploy/manifests.md" %}}

Create a new `manifests` directory and change into it:

```bash
cd ..
mkdir manifests
cd manifests
```

Create a new file `manifest-1.yaml` in the `manifests` directory, containing this configuration:

```yaml
workloads:
  # The name you assign to the workload in the context of the manifest
  demo-app:
    resources:
      # The name you the assign to this resource in the context of the manifest
      demo-workload:
        # The resource type of the resource you wish to provision
        type: k8s-workload-get-started
        # The resource parameters. They are mapped to the module_params of the module
        params:
          image: ghcr.io/astromechza/demo-app:latest
```

The manifest is a high-level abtraction of the `demo-app` made up of a resource of type `k8s-workload-get-started`.

Manifests are generally owned and maintained by application developers as a part of their code base, and used to self-serve all kinds of resources. You do not install them into the Orchestrator using `octl` or TF like the previous configuration objects.

You now have:

- ✅ Described an application and its resource requirements in an abstracted, environment-agnostic way called a manifest

## Perform a deployment

Verify that the demo infrastructure provisioning which may be running in another shell is complete before proceeding.

Perform a deployment of the manifest into the `development` environment of the `get-started` project:

```bash
octl deploy get-started development manifest-1.yaml
```

Confirm the deployment and wait for the execution to finish. It should take less than a minute.

Upon completion, the CLI outputs a `octl logs` command to access the deployment logs. Use it to see the execution details.

Run this command to see all prior deployments:

```bash
octl get deployments
```

Copy the ID from the top of list and inspect the details by using the ID in this command:

```bash
octl get deployment the-id-you-copied
```

Inspect the result in the Orchestrator console:

- Open the Orchestrator web console at [https://console.stellwerk.dev/](https://console.stellwerk.dev/)
- In the **Projects** view, select the **get-started** project
- Select the **development** environment

You will see a "Successful" status and a graph containing two nodes. This is the [resource graph]({{< relref "/platform-orchestrator/docs/deploy/resource-graph" >}}) for the latest deployment. {{% description "/platform-orchestrator/docs/deploy/resource-graph.md" %}}

![Resource graph with workload](/images/get-started-tutorial/resource-graph-workload.png "Resource graph with workload")

Click on the resources to explore their details. In particular, inspect the "Metadata" section of the `demo-workload` resource. By convention, the Orchestrator will display the content of a regular output named `platform_orchestrator_metadata` of the TF module being used for a resource. This is useful for conveying insights about the real-life object that has been provisioned via the Orchestrator.

{{% details "Defining metadata output in the module source" %}}
{{% github-file filename="/stellwerk-labs/get-started/refs/heads/main/modules/workload/kubernetes/outputs.tf" %}}
{{% /details %}}

You now have:

- ✅ Used the manifest to request a deployment from the Orchestrator into a specific target environment

## Inspect the running workload

If you have `kubectl` available, you can inspect the demo cluster to see the running workload. Otherwise, skip to the [next section](#create-a-module-for-a-database).

If you have not already set the `kubectl` context, use this convenience command to display the required command:

{{% include "/platform-orchestrator/docs/tutorial/include-get-started-kubectl-convenience-command.md" %}}

The module created a Kubernetes `Deployment` in the `default` namespace. Verify it exists:

```bash
kubectl get deployments
```

The demo image being used has a simple web interface. Create a `port-forward` to the Pod to access it:

```bash
kubectl port-forward pod/$(kubectl get pods -l app=get-started -o json \
  | jq -r ".items[0].metadata.name") 8080:8080
```

Open [http://localhost:8080](http://localhost:8080) to see the running workload.

In the output you see, note the message at the bottom about no postgres being configured. As the last and final step in this tutorial, you will add a simple PostgreSQL database to the deployment and connect the workload to it.

Quit the `port-forward` and continue.

You now have:

- ✅ Verified your workload is indeed runnning on the target environment

## Create a module for a database

You will now extend the capabilities of the Orchestrator and enable it to provision a database to be used by the workload. The tutorial uses PostgreSQL as an example.

Just like for the workload previously, that involves creating a resource type, a module encapsulating the TF code, and a module rule.

The PostgreSQL database will use a managed service offering from your cloud provider and the appropriate TF provider:

- <img src="/images/AWS-Cloud-logo_32.svg" alt="AWS cloud logo" width="20rem"/> AWS: [RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html) and the `hashicorp/aws` provider using [workload identity (IRSA)](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#container-credentials) for provider authentication
- <img src="/images/google_cloud.png" alt="Google Cloud logo" width="16rem"/> GCP: [Cloud SQL](https://cloud.google.com/sql/docs/postgres/introduction) and the `hashicorp/google` provider using [workload identity and an IAM service account](https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference#running-terraform-on-google-cloud) for provider authentication
- <img src="/images/10018-icon-service-Azure-A.svg" alt="Azure logo" width="20rem"/> Azure: [Azure Database for PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview) and the `hashicorp/azurerm` provider using [AKS workload identity](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/managed_service_identity) for provider authentication

Remember that the TF code for provisioning this database will be executed by the runner on your demo infrastructure. The `provider` configuration must receive appropriate authentication data just like in any other TF execution. To achieve this, you will also define a [provider]({{< relref "/platform-orchestrator/docs/configure/providers" >}}) in the Orchestrator. {{% description "/platform-orchestrator/docs/configure/providers.md" %}}

Return to the `orchestrator` folder:

```bash
cd ../orchestrator
```

Open the file `orchestrator.tf` and append this configuration to define the Orchestrator objects previously mentioned.

The first part is cloud provider agnostic:

```json
# Create a resource type "postgres-get-started"
resource "platform-orchestrator_resource_type" "postgres_get_started" {
  id          = "postgres-get-started"
  description = "Postgres instance for the Get started tutorial"
  is_developer_accessible = true
  output_schema = jsonencode({
    type = "object"
    properties = {
      host = {
        type = "string"
      }
      port = {
        type = "integer"
      }
      database = {
        type = "string"
      }
      username = {
        type = "string"
      }
      password = {
        type = "string"
      }
    }
  })
}
```

The next part is cloud provider specific as it involves defining and using a [provider]({{< relref "/platform-orchestrator/docs/configure/providers" >}}). Append to `orchestrator.tf`:

{{% details "AWS" %}}

```json
# Create a provider leveraging EKS workload identity
# Because workload identity has already been configured on the cluster,
# the provider configuration can be effectively empty
resource "platform-orchestrator_provider" "get_started" {
  id                 = "get-started"
  description        = "aws provider for the Get started tutorial"
  provider_type      = "aws"
  source             = "hashicorp/aws"
  version_constraint = "~> 6"
}
# Create a module "postgres-get-started"
resource "platform-orchestrator_module" "postgres_get_started" {
  id            = "postgres-get-started"
  description   = "Simple cloud-based Postgres instance"
  resource_type = platform-orchestrator_resource_type.postgres_get_started.id
  module_source = "git::https://github.com/stellwerk-labs/get-started//modules/postgres/${var.enabled_cloud_provider}"
  provider_mapping = {
    aws = "${platform-orchestrator_provider.get_started.provider_type}.${platform-orchestrator_provider.get_started.id}"
  }
}
```

{{% /details %}}
{{% details "GCP" %}}

```json
# Create a provider leveraging GKE workload identity
# Because workload identity has already been configured on the cluster,
# the provider configuration does not require any further authentication data
resource "platform-orchestrator_provider" "get_started" {
  id                 = "get-started"
  description        = "google provider for the Get started tutorial"
  provider_type      = "google"
  source             = "hashicorp/google"
  version_constraint = "~> 7"
  configuration = jsonencode({
    project = var.gcp_project_id
    region  = var.gcp_region
  })
}
# Create a module "postgres-get-started"
resource "platform-orchestrator_module" "postgres_get_started" {
  id            = "postgres-get-started"
  description   = "Simple cloud-based Postgres instance"
  resource_type = platform-orchestrator_resource_type.postgres_get_started.id
  module_source = "git::https://github.com/stellwerk-labs/get-started//modules/postgres/${var.enabled_cloud_provider}"
  provider_mapping = {
    google = "${platform-orchestrator_provider.get_started.provider_type}.${platform-orchestrator_provider.get_started.id}"
  }
}
```

{{% /details %}}

{{% details "Azure" %}}

```json
# Create a provider leveraging AKS workload identity
# Because workload identity has already been configured on the cluster,
# the provider configuration does not require any further authentication data
resource "platform-orchestrator_provider" "get_started" {
  id                 = "get-started"
  description        = "azurerm provider for the Get started tutorial"
  provider_type      = "azurerm"
  source             = "hashicorp/azurerm"
  version_constraint = "~> 4"
  configuration = jsonencode({
    use_aks_workload_identity = true
    use_cli                   = false
    subscription_id           = var.azure_subscription_id
    tenant_id                 = var.azure_tenant_id
    "features[0]"             = {}
  })
}
# Create a module "postgres-get-started"
resource "platform-orchestrator_module" "postgres_get_started" {
  id            = "postgres-get-started"
  description   = "Simple cloud-based Postgres instance"
  resource_type = platform-orchestrator_resource_type.postgres_get_started.id
  module_source = "git::https://github.com/stellwerk-labs/get-started//modules/postgres/${var.enabled_cloud_provider}"
  provider_mapping = {
    azurerm = "${platform-orchestrator_provider.get_started.provider_type}.${platform-orchestrator_provider.get_started.id}"
  }
}
```

{{% /details %}}

The last part is creating a [module rule]({{< relref "/platform-orchestrator/docs/configure/modules/module-rules" >}}) and is provider agnostic once more. Append to `orchestrator.tf`:

```json
# Create a module rule making the module applicable to the demo project
resource "platform-orchestrator_module_rule" "postgres_get_started" {
  module_id  = platform-orchestrator_module.postgres_get_started.id
  project_id = platform-orchestrator_project.get_started.id
}
```

{{% include "/platform-orchestrator/docs/tutorial/include-get-started-perform-tf-apply.md" %}}

Verify that the new resource type `postgres-get-started` is available:

```bash
octl get available-resource-types get-started development
```

You now have:

- ✅ Instructed the Orchestrator how to provision a PostgreSQL database by providing another module and module rule
- ✅ Configured a TF provider which can be injected into upcoming executions to access the target infrastructure

## Add the database to the manifest

Create another manifest that in addition to the workload requests a PostgreSQL database and connects the workload to it.

Return to the `manifests` directory::

```bash
cd ../manifests
```

Create a new file `manifest-2.yaml` containing this configuration. It expands the previous manifest to request a database resource and set a container environment variable, using outputs from the database resource to construct a connection string. Note the elements marked `NEW`:

```yaml
workloads:
  # The name you assign to the workload in the context of the manifest
  demo-app:
    resources:
      # The name of the workload resource in the context of the manifest
      demo-workload:
        # The resource type of the workload resource you wish to provision
        type: k8s-workload-get-started
        # The resource parameters. They are mapped to the module_params of the module
        params:
          image: ghcr.io/astromechza/demo-app:latest
          env_vars:
            # NEW: This environment variable is used by the demo image to create a connection to a postgres database
            OVERRIDE_POSTGRES: postgres://${resources.db.outputs.username}:${resources.db.outputs.password}@${resources.db.outputs.host}:${resources.db.outputs.port}/${resources.db.outputs.database}
      # NEW: The name of the database resource in the context of the manifest
      db:
        # NEW: The resource type of the database resource you wish to provision
        type: postgres-get-started
```

Requesting and connecting the database resource is literally a matter of a few lines added to the manifest file. The Orchestrator configuration you created previously (resource type, module, module rule, provider) will execute this request.

You now have:

- ✅ Extended the manifest to request an additional database resource
- ✅ Extended the manifest to inject outputs from the new database resource into the workload

## Re-deploy

Perform another deployment into the same `development` environment of the `get-started` project using the new manifest file:

```bash
octl deploy get-started development manifest-2.yaml
```

This new deployment will take a few minutes as it now creates a managed PostgreSQL instance. Use that time to inspect the TF code behind the database module. Expand the section below to see it.

Note that the module has a `required_providers` block but it does not include a `provider` block for configuring providers. Instead, the Orchestrator will inject the provider configuration at deploy time based on the [provider]({{< relref "/platform-orchestrator/docs/configure/providers" >}}) object you created earlier and mapped into the module via the `provider_mapping`.

{{% details "Database module main code (AWS)" %}}

{{% github-file filename="/stellwerk-labs/get-started/refs/heads/main/modules/postgres/aws/main.tf" %}}

{{% /details %}}

{{% details "Database module main code (GCP)" %}}

{{% github-file filename="/stellwerk-labs/get-started/refs/heads/main/modules/postgres/gcp/main.tf" %}}

{{% /details %}}

{{% details "Database module main code (Azure)" %}}

{{% github-file filename="/stellwerk-labs/get-started/refs/heads/main/modules/postgres/azure/main.tf" %}}

{{% /details %}}

Control over the providers and the authentication mechanisms they use therefore lies with the Orchestrator and is governed by the platform engineers.

Once the deployment finished, return to the Orchestrator console at [https://console.stellwerk.dev](https://console.stellwerk.dev) and open the `development` environment of the `get-started` project.

The resource graph now contains an additional active resource node for the PostgreSQL database. Click on the resource to explore its details. It exposes set of metadata on the real-world database resource, including a link to the cloud console or portal. Click the link to view it.

![Resource graph with workload and database](/images/get-started-tutorial/resource-graph-workload-database.png "Resource graph with workload and database")

{{< alert context="info" >}}
You can drag nodes around to modify the layout of the graph.
{{< /alert >}}

If you have `kubectl` available and your context set, you may again connect to the running pod:

```bash
kubectl port-forward pod/$(kubectl get pods -l app=get-started -o json \
  | jq -r ".items[0].metadata.name") 8080:8080
```

Open [http://localhost:8080](http://localhost:8080) to see the status output. The demo workload now displays the message `Database table count result: 0`, which means that it could connect to the PostgreSQL database and found it to be empty, which is expected.

Quit the `port-forward` and continue.

You now have:

- ✅ Expanded the running deployment by a PostgreSQL database instance

## Clean up

Once you are done exploring, clean up the objects you created in the process.

1. Delete the Orchestrator environment first. This will make the Orchestrator execute a `destroy` on all the resources in the environment, and may therefore take several minutes.

    Navigate to the `orchestrator` directory:

    ```bash
    cd ../orchestrator
    ```

{{% details "Terraform" %}}
```bash
terraform destroy -target="platform-orchestrator_environment.development" \
  -var-file=orchestrator.tfvars
```
{{% /details %}}
{{% details "OpenTofu" %}}
```bash
tofu destroy -target="platform-orchestrator_environment.development" \
  -var-file=orchestrator.tfvars
```
{{% /details %}}

Once complete, if you now inspect the cluster and your cloud console again, you will find both the workload and the database resource gone.

2. Destroy the remaining Orchestrator configuration objects.

{{% details "Terraform" %}}
```bash
terraform destroy -var-file=orchestrator.tfvars
```
{{% /details %}}
{{% details "OpenTofu" %}}
```bash
tofu destroy -var-file=orchestrator.tfvars
```
{{% /details %}}

3. Destroy all demo infrastructure created via TF. This will take several minutes.

    Navigate to the `infra` directory:

    ```bash
    cd ../infra
    ```

Then execute the `destroy`:

{{% details "Terraform" %}}
```bash
terraform destroy
```
{{% /details %}}
{{% details "OpenTofu" %}}
```bash
tofu destroy
```
{{% /details %}}

4. Finally, remove the local directory containing the cloned repository and your additions. If you want to keep them for later to review things, skip this step.

```bash
cd ../../
rm -rf get-started
```

## Recap

This concludes the tutorial. You have learned how to:

- ✅ Setup your infrastructure to run Orchestrator deployments
- ✅ Describe an application and its resource requirements
- ✅ Use the Orchestrator to deploy a workload
- ✅ Use the Orchestrator to deploy dependent infrastructure resources like a database
- ✅ Observe the results and status of deployments
- ✅ Create a link from the Orchestrator to real-world resources

The tutorial content made some choices we would like to highlight and make you aware of the options you have.

**Runner compute vs. target compute**: the tutorial uses the same compute (here: a Kubernetes cluster) to run both your runners and and an actual application workload. In a real-life setting, you may want to use a dedicated runner compute instance to reduce the risk of interference with applications.

**Containerized and non-containerized workloads**: the tutorial uses a containerized workload on Kubernetes as an example, but a "workload" can really have any shape, fitting its execution environment. You may deploy any flavor of workload artefacts by providing the proper module and TF code.

**Workload and/or infrastructure**: the tutorial deploys both a workload and a piece of infrastructure, but it can be just one of the two as well. You describe what is to be deployed via the manifest.

## Next steps

- Go [here]({{< relref "/platform-orchestrator/docs/tutorial/first-deployment" >}}) to follow an advanced showcase deploying workloads to VMs
