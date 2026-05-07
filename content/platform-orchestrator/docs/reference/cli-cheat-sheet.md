---
title: "CLI cheat sheet"
description: ""
lead: ""
draft: false
type: docs
weight: 20
toc: true
aliases:
- /new-orchestrator/docs/reference/cli-cheat-sheet
---

This page contains a list of commonly used `octl` CLI commands and flags.

## Installation

Visit the [CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) page for instructions on installing the `octl` CLI.

## Prequisites

All CLI commands shown on this page require the target [organization]({{< relref "/platform-orchestrator/docs/configure/organizations" >}}) to be set via environment variable or CLI command:

```bash
# Option 1: set target organization via environment variable
export HUMANITEC_ORG=my-org
# Option 2: set target organization via local config
octl config set-org my-org
```

When [self-hosting]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) the Orchestrator, also set the API URL to your own endpoint:

```bash
# Option 1: set API URL via environment variable
export HUMANITEC_API_URL=https://my-platform-orchestrator.example.com
# Option 2: set API URL via local config
octl config set-url https://my-platform-orchestrator.example.com
```

See [CLI configuration]({{< relref "/platform-orchestrator/docs/integrations/cli#configuration" >}}) for details.

## Configuration

### Login

{{< include "/platform-orchestrator/docs/security/include-cli-authentication.md" >}}

### CLI base configuration

```bash
octl config set-org    # Set the id of the default Organization in which to run commands in the local config
octl config set-url    # Set the base URL of the Orchestrator API in the local config
octl config set-token  # Set an authentication token

octl config show       # Show the effective configuration, taking env var overrides into account
```

### Project structure

```bash
octl create project my-project             # Create a project named "my-project"
octl get projects                          # List all projects
octl create environment-type development   # Create an environment type named "development"

# Create an environment named "dev" in the project "my-project" with environment type "development"
octl create environment my-project dev --set=env_type_id=development
```

### Providers

```bash
# Create a provider named "default" of type "kubernetes" with a version contraint and blank configuration
octl create provider kubernetes default --set source=hashicorp/kubernetes \
  --set version_constraint='~> 2.36' \
  --set-json '{"configuration": {}}'

octl get providers                     # List all providers
octl get providers --type kubernetes   # List all providers of type "kubernetes"
octl get provider kubernetes default   # Get the provider of type "kubernetes" named "default"
```

### Runners

```bash
# Create a runner named "default" of type "kubernetes" reading data from a local kubeconfig
# running jobs in the "default" namespace using the "humanitec-runner" service account
# and using "kubernetes" state storage
octl create runner default \
  --set=runner_type=kubernetes \
  --set=runner_configuration='{"cluster":{"cluster_data":{"certificate-authority-data": "'"$(kubectl config view -o jsonpath='{.clusters[?(@.name == "my-cluster")].cluster.certificate-authority-data}' --raw)"'","server":"https://kubernetes.default.svc.cluster.local"},"auth":'"$(kubectl config view -o jsonpath='{.users[?(@.name == "my-user")].user}' --raw)"'}, "job":{"namespace":"default","service_account":"humanitec-runner"}}' \
  --set=state_storage_type=kubernetes \
  --set=state_storage_configuration='{"namespace":"default","secret_suffix":""}'

octl get runners         # List all runners
octl get runner default  # Get the runner named "default"

# Create a runner rule for runner "my-runner", project "my-project" and environment type "development"
octl create runner-rule --set=runner_id=my-runner \
  --set=project_id=my-project \
  --set=env_type_id=development
octl create runner-rule --set=runner_id=my-runner # Create an empty runner rule ("always match")
```

### Resource types

```bash
# List available resource types in the "development" environment of project "my-project"
# Only shows resource types with the `is_developer_accessible` property set to `true`
octl get available-resource-types my-project development

# Create a resource type named "s3" with a non-empty output schema
octl create resource-type s3 \
  --set=name=S3 \
  --set=output_schema='{"type":"object","properties":{"arn":{"type":"string"},"bucket":{"type":"string"},"region":{"type": "string"},"endpoint":{"type": "string"}}}'
```

### Modules

```bash
octl get modules           # List all modules
octl get module my-module  # Get the module named "my-module"

# Create a module named "my-module" with a resource type of "example-type"
# referencing a module in an external git repository,
# mapping the module provider "kubernetes" to the Orchestrator provider "kubernetes.default",
# and providing a value for the module input variable "my-variable"
octl create module my-module \
    --set=resource_type=example-type \
    --set=module_source=git::https://git.example.com/my-project/my-repo \
    --set=provider_mapping='{"kubernetes": "kubernetes.default"}' \
    --set=module_params='{"user-variable": {"type": "string"}}' \
    --set=module_inputs='{"platform-variable": "my-value"}'

# Create a blank module rule ("match anything") on the module "my-module"
octl create rule --set=module_id=my-module
```

## Deployments

### Performing deployments

```bash
# Deploy a local manifest file into the "development" environment of project "my-project"
octl deploy my-project development ./my-app-manifest.yaml
# Deploy a local manifest file and show the deployment outputs
octl deploy my-project development ./my-app-manifest.yaml --result -

# Deploy a local Score file into the "development" environment of project "my-project"
octl score deploy my-project development ./score.yaml
# Write the deployment manifest produced by a Score file conversion to the file at the given path and exit
octl score deploy my-project development ./score.yaml --print-manifest=manifest.yaml
# Write the deployment manifest produced by a Score file conversion to stdout and exit
octl score deploy my-project development ./score.yaml --print-manifest=-

octl deploy my-project development my-app-manifest.yaml --dry-run   # Validate the request but do not execute the deployment
octl deploy my-project development my-app-manifest.yaml --plan-only # Set deployment mode to plan only

# Promote the last stateful deployment in the "staging" environment into the "production" environment in the same project
octl deploy my-project production environment://staging
# Deploy the last stateful deployment for the "development" environment, this acts like a redeployment
octl deploy my-project development deployment://HEAD
# Cross-deploy a deployment id in the same org to the "development" environment
octl deploy my-project development deployment://01234567-89ab-cdef-0123-456789abcdef

# Re-deploy the last stateful deployment and remove one workload
octl deploy my-project development deployment://HEAD --drop-workload deprecated-workload
# Re-deploy the last stateful deployment and remove a shared resource
octl deploy my-project development deployment://HEAD --drop-shared unused-database-resource
```

### Observing deployments

```bash
octl get deployments                                     # List all deployments
octl get deployments my-project                          # Get the deployments in project "my-project"
octl get deployment 12345678-abcd-dcba-1234-ba0987654321 # Get the deployment with id 12345678-abcd-dcba-1234-ba0987654321

# View the Terraform/OpenTofu code generated for the deployment with id 12345678-abcd-dcba-1234-ba0987654321
octl get tf 12345678-abcd-dcba-1234-ba0987654321
```

### Rollback deployments

```bash
# rollback to the resource graph of a previous deployment
octl rollback my-project development 01234567-89ab-cdef-0123-456789abcdef

octl rollback my-project development 01234567-89ab-cdef-0123-456789abcdef --dry-run   # Validate the rollback request but do not execute the deployment
octl rollback my-project development 01234567-89ab-cdef-0123-456789abcdef --plan-only # Set rollback mode to plan only
octl rollback my-project development 01234567-89ab-cdef-0123-456789abcdef --result -  # Show the deployment outputs of the rollback
```

## Active resources

```bash
octl get active-resource-nodes my-project development  # Get all active resources nodes in the "development" environment of project "my-project"
```
