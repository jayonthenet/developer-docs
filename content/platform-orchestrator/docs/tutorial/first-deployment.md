---
title: "First deployment"
description: "First deployment tutorial"
lead: ""
draft: false
type: docs
weight: 20
toc: true
aliases:
- /new-orchestrator/docs/tutorial/first-deployment
---
## Welcome

Welcome to your first deployment tutorial!

In this tutorial you will learn how to create your organization and configure the Orchestrator to be able to deploy into your infrastructure. This is the platform engineer perspective.

You will also execute several deployments to understand how the Orchestrator works in general and specifically how to use the created configuration. This is the developer perspective.

To make sure you are able to understand all of the moving pieces, we will review the object system of the Orchestrator at the beginning.

{{< alert context="info" >}}
This tutorial focuses on Google Cloud, Amazon Web Services and Microsoft Azure as the deployment target and demonstrates deployments onto Kubernetes and VMs. The Platform Orchestrator itself is fully cloud- and compute-agnostic. Support for additional technologies and runtimes is continuously expanding. If you’d like to see the Orchestrator in action with technologies not covered here, [book a demo with us](https://stellwerk.dev).
{{< /alert >}}

## Prerequisites

To get started with this tutorial, you’ll need:

- The [octl]({{< relref "/platform-orchestrator/docs/integrations/cli#installation" >}}) CLI installed locally
- Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed locally
- [Git](https://git-scm.com/downloads) installed locally
- A Platform Orchestrator organization. To create one, please go [here](https://console.stellwerk.dev/auth/register) and follow the instructions
- (optional) The Kubernetes [kubectl](https://kubernetes.io/docs/tasks/tools/) CLI installed locally

### Amazon Web Services (AWS)

When using AWS, you'll also need:

- Access to an AWS project that has sufficient quota to run a Kubernetes cluster and deploy workloads on top of it. It is also expected that additional resources can be created, e.g. additional VMs.
- The [`AWS` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and authenticated. The tutorial will use this authenticated user to perform all actions against AWS

### Google Cloud (GCP)

When using Google Cloud (GCP), you'll also need:

- Access to a GCP project that has sufficient quota to run a Kubernetes cluster and deploy workloads on top of it. It is also expected that additional resources can be created, e.g. additional VMs.
- The [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated. The tutorial will use this authenticated user to perform all actions against Google Cloud
- To be able to execute all parts of the tutorial, it is expected that your user has the **Owner** role in the project.
- You need to have the following APIs enabled in your GCP project:
  - compute.googleapis.com
  - container.googleapis.com

### Microsoft Azure

When using Azure, you'll also need:

- Access to an Azure subscription that has sufficient quota to run a Kubernetes cluster and deploy workloads on top of it. It is also expected that additional resources can be created, e.g. additional VMs.
- The [`az` CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) installed and authenticated. The tutorial will use this authenticated user to perform all actions against Azure.
- To be able to execute all parts of the tutorial, it is expected that your user has the **Owner** role in the subcription.

## What is a Platform Orchestrator?

In most engineering organizations today, developers are blocked by ticket-based provisioning or overly rigid CI/CD flows. The Platform Orchestrator helps platform teams enable dynamic, policy-enforced environments that still respect governance, identity, and existing infra setups.

## Overview of the Orchestrator objects

The Orchestrator makes use of an internal representation of the world that captures all necessary details, but exposes only the relevant parts to each persona that takes part in the software development lifecycle.

- {{% description "/platform-orchestrator/docs/configure/projects.md" %}}
- {{% description "/platform-orchestrator/docs/configure/environments.md" %}}
- {{% description "/platform-orchestrator/docs/configure/environment-types.md" %}}
- {{% description "/platform-orchestrator/docs/deploy/deployments.md" %}}
- {{% description "/platform-orchestrator/docs/deploy/manifests.md" %}}
- {{% description "/platform-orchestrator/docs/configure/resource-types.md" %}}
- {{% description "/platform-orchestrator/docs/configure/modules/overview.md" %}}
- {{% description "/platform-orchestrator/docs/configure/providers.md" %}}
- {{% description "/platform-orchestrator/docs/configure/runners/overview.md" %}}

Platform engineers provide rules that describe when a concrete object of a type should be used. Most objects can lend themselves to this system either over their ID or type.

- {{% description "/platform-orchestrator/docs/configure/modules/module-rules.md" %}}
- {{% description "/platform-orchestrator/docs/configure/runners/runner-rules.md" %}}

{{% include "/platform-orchestrator/docs/what-is-the-platform-orchestrator/include-tf-only.md" %}}

### Object Landscape

If you combine all of the pieces and show their relations, you will get to this landscape of the object system of the Orchestrator.

{{% details "Orchestrator object landscape" %}}

![Orchestrator object system landscape](/images/tutorial_first_deployment_landscape.png "Orchestrator object system landscape")

{{% /details %}}

## Obtain the code

This tutorial comes with a cloud infrastructure and Orchestrator setup completely prepared as Terraform/OpenTofu code.

The code uses the appropriate providers for the cloud provider of your choice, as well as our [own provider]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}) for Platform Orchestrator configuration objects.

Clone the repository:

```bash
git clone https://github.com/Platform-Orchestrator/first-deployment
cd first-deployment
```
## Review the code

The repository contains these files for setting up the base infrastructure in the `infra` directory:

- `main.tf` contains the basic providers and allows you to activate the cloud provider of your choice.
- `humanitec.tf` contains Orchestrator configuration like the project and any non-cloud-specific providers and types. The actual implementations of modules are mostly found in the cloud provider specific module.

If you want to learn what cloud provider specific infrastructure and Orchestrator configuration is being created, please review the corresponding files under `infra/modules/<yourCloudProvider>`. On top the cloud provider specific module will call the runner module to facilitate the installation of the runner for that cloud - see `infra/modules/shared/runner-integration`.

The most interesting part to review is probably the `humanitec.tf` and cloud provider specific `humanitec-resources.tf` which combined together include all infrastructure components that you actually want the Orchestrator to create.

You will always find triplets of resources in the Terraform/OpenTofu code:

- A `resource-type` describing the formal structure of a kind of resource
- A `module` defining how to actually provision a resource
- A `module_rule` defining when to use that module

For modules, there is always a `module_source` configured, which specifies where the Terraform/OpenTofu code is hosted that makes up the module. This makes it trivial to later write wrapping module definitions for your own existing Terraform modules.

## Prepare your configuration

The repository comes with a `terraform.tfvars.template` file. You can copy this file and remove the template extension. It should contain all necessary explanations on how to obtain the needed configuration for your Terraform/OpenTofu run. Please fill all necessary variables with their needed contents.

```bash
cd infra
cp terraform.tfvars.template terraform.tfvars
```

## Prepare a service user and token

All requests to the Orchestrator must be authenticated. To this end, the Orchestrator lets you create "Service users" with an associated token that you can supply to code-based interactions such as the Platform Orchestrator Terraform/OpenTofu provider.

- Open the Orchestrator web console at [https://console.stellwerk.dev/](https://console.stellwerk.dev/)
- Select the **Service users** view
- Click **Create service user**
- Enter "`first-deployment-tutorial`" as the name and keep the default expiry
- Click **Create**
- Copy the token value to the clipboard
- and include it in your `terraform.tfvars`, that you created from the `terraform.tfvars.template` in the last step

- Click **OK**

The token value will now be passed in as the Terraform/OpenTofu variable `humanitec_auth_token` declared in the `variables.tf` file.

## Configure your cloud provider

Go to `main.tf` and uncomment the module of the cloud provider you want to use.

## Set up the infrastructure

Now execute the Terraform/OpenTofu code to create the base infrastructure.

If you are using Terraform:

```bash
terraform init --upgrade
terraform plan # Optional - review the plan before you apply
terraform apply
```

If you are using OpenTofu:

```bash
tofu init --upgrade
tofu plan # Optional - review the plan before you apply
tofu apply
```

The execution will take a few minutes. Use the time to explore the code a little more, especially the Orchestrator objects in the `humanitec.tf` file.

Note: For simplicity, the Terraform/OpenTofu code uses a local backend by default to store the state. We will clean up the entire setup at the end of this tutorial.

## Identify the new Orchestrator project

The Terraform run will output the configured organization and created project after a successful run. In case you want to locate that information using the `octl` CLI, please follow along.

Ensure you are logged in:

```bash
octl login
```

Ensure that the CLI is set to use your Orchestrator organization:

```bash
octl config show
```

If the `default_org_id` is empty, set the organization to your value like this:

```bash
octl config set-org your-org-id
```

Now list all projects in your organization. You should see one named `<random-string>-tutorial` that was created just now:

```bash
octl get projects --out table
```

Set a variable to the project id you see in the list:

```bash
export PROJECT_ID=the-tutorial-project-id
```

## The first deployment

Our first deployment is going to attest that the technical round-trip between the Orchestrator and your infrastructure works before actually deploying any real resources.

Navigate into the `manifests` folder:

```bash
cd ../manifests
```

We are using this empty `manifest.yaml` located in this folder:

{{% github-file filename="/Platform-Orchestrator/first-deployment/refs/heads/main/manifests/manifest.yaml" %}}

The [deployment manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) format is purpose built to enable to deploy basically any application or resource. It provides the right abstraction level to create infrastructure with the "what" and leave the "how" to the platform engineer that encoded this concern into the module that the Orchestrator will be using. The next deployment steps will expand the manifest.

Perform a deployment into the `dev` environment of the newly created project:

```bash
octl deploy ${PROJECT_ID} dev ./manifest.yaml
```

To see the outcome, return to the Orchestrator console at [https://console.stellwerk.dev/](https://console.stellwerk.dev/) in your browser and open the **Projects** view. Select the `*-tutorial` project and open the `dev` environment.

As the deployment was empty, there is not much to see yet. Still, this first step shows that

- ✅ A new Orchestrator project and environment was configured correctly
- ✅ You can execute a deployment. The Orchestrator can
  - ✅ Connect to the target Kubernetes cluster
  - ✅ Launch a runner job for the deployment execution

Now proceed to deploying something for real.

## More resources

In this step we are going to deploy a containerized application directly to the Kubernetes cluster where the runner is scheduled and add an in-cluster database to it.

We are using the `manifest2.yaml` file located in the current `manifests` folder:

{{% github-file filename="/Platform-Orchestrator/first-deployment/refs/heads/main/manifests/manifest2.yaml" %}}

This manifest defines a logical workload named `demo-app` made up out of two resources:

- A resource named `score-workload` of `type: score-workload`
- A resource named `db` of `type: postgres`

The workload also defines a variable `OVERRIDE_POSTGRES` which dynamically constructs the connection string to the database from outputs of the `db` resource.

Perform a deployment using this manifest into the same project and environment as before:

```shell
octl deploy ${PROJECT_ID} dev ./manifest2.yaml
```

The deployment command will prompt you to confirm the changes which are being applied to the target environment. Accepting this will deploy the application to the cluster and connect the workload to the database which is deployed into the cluster as well.

Return to the console view of the project environment. Refresh if necessary to show the current state.

The view now shows a resource graph containing the Orchestrator resources and their dependencies.

This step demonstrated these Orchestrator capabilities:

- ✅ Deploy a containterized workload to some runtime, in this case a Kubernetes cluster (but could be anything)
- ✅ Deploy an infrastructure resource such like a PostgreSQL database, in this case as a containerized in-cluster version (but could be a managed cloud service as well)
- ✅ Connect two resources, in this case by providing a variable holding a database connection string to the workload

## Cloud resources and alternative runtimes

For the last deployment, we’re going to leave the cluster behind and deploy the same workload onto a fleet of VMs. The fleet is going to be fronted by a loadbalancer, so we can directly access the application without any port-forwarding. This time we’re going to drop the deployment manifest in favor of a [Score](https://score.dev/) file. This format allows for a higher level abstraction that developers prefer, as it aligns well with more of their tooling and requirements.

You can create a `score.yaml` file with the following contents (or locate it in the manifests folder to save yourself from C&P)

{{% github-file filename="/Platform-Orchestrator/first-deployment/refs/heads/main/manifests/score.yaml" %}}

and deploy it like this

```shell
octl score deploy ${PROJECT_ID} score ./score.yaml
```

After the deployment is complete (which can take around 5 minutes) you should now be able to observe three new VMs in your cloud project which are behind a loadbalancer. Calling to this loadbalancer should immediately show you the application.

The reason this was so simple is that the entire "how" is encoded into the `score-workload` module. It knows that you want to create those VMs and uses Ansible internally to configure those VMs to install a Docker instance that can serve the container specified in the image part of your `Score` file.

This is different to how the deployment before performed the conversion of the `score-workload` - the reason being the matching according to the defined rules. Locate the `platform-orchestrator_module_rule.ansible_score_workload` in `modules.tf`. The `rule` specifies the `env_id` as matching criterion.

Feel free to browse the inside of the modules - you can find them by opening the `module_source` and browse to understand what is really happening.

This step demonstrated these Orchestrator capabilities:

- ✅ Use Score as an alternative way for developers to describe their containerized workload and its resource requirements
- ✅ Deploy workloads to VMs
- ✅ Automatically spin up the supporting infrastructure such as a VM fleet and a loadbalancer

## Recap

We’ve made it to the end of this tutorial, which means that you have successfully created a configuration for the Orchestrator to deploy to your own cloud infrastructure.

You have done so and deployed different applications and sets of infrastructure. While doing so, you didn't need to be aware of where you were deploying. The abstraction that the Orchestrator provides makes sure, that deploying to e.g. GCP or AWS makes zero difference to the developer.

Exploring those outcomes should have reinforced your learning of the Orchestrator’s object system by providing practical examples of how the different objects work together to create those outcomes.

You should be ready to create your own modules now, that allow your developers deploy any kind of custom infrastructure through the Orchestrator with just the „what“ and without the need to understand the „how“.

Welcome aboard, fellow platform engineer!

## Cleanup

If you want to remove your tutorial infrastructure and Orchestrator config completely, there is an easy way to do so. The tutorial comes equipped with a script to handle the process. You can simply execute it and watch it clean.

{{< alert context="info" >}}
If you try to remove the created infrastructure manually using just Terraform / OpenTofu, you might come to a broken state. One of the reasons why you have the Orchestrator is that it knows about more dependencies than just your Terraform / OpenTofu state. Those dependencies need to be disentangled and removed in order which is exactly what the cleanup script will do for you.
{{< /alert >}}

```bash
cd ../infra
./destroy-order.sh
```

## Feedback

We’re always looking to improve this tutorial. If you found something unclear, ran into issues, or have suggestions for making it better, please let us know through [this feedback form](https://form.typeform.com/to/lOiMFHQ6).

## Known Issues

### Destroying and re-applying the tutorial Terraform code for GCP

This has become highly unlikely since the introduction of auto-generated prefixes, but if you should choose your own prefix might still haunt you.

Due to how GCP handles certain resources, you cannot apply multiple times without manual intervention. The reason is that GCP will not allow you to immediately delete `Workload Identity Pools` and contained `Providers`. They will remain in soft-delete status for 30 days after being deleted. You can either wait for 30 days before you can reuse the same name or undelete them and import them into your current state before applying.

E.g. with the following shell commands:
```shell
  gcloud iam workload-identity-pools undelete <pool-id> \
    --location=global \
    --project=<project-id>

  gcloud iam workload-identity-pools providers undelete <provider-id> \
    --location=global \
    --project=<project-id> \
    --workload-identity-pool=<pool-id>

terraform import google_iam_workload_identity_pool.wip projects/<project-id>/locations/global/workloadIdentityPools/<pool-id>
terraform import google_iam_workload_identity_pool_provider.wip_provider projects/<project-id>/locations/global/workloadIdentityPools/<pool-id>/providers/<provider-id>
```
