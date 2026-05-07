---
title: AWS Lambda function deployment
description: This use case demonstrates deploying an AWS Lambda function with the Platform Orchestrator using an ECS-based serverless runner.
draft: false
type: docs
weight: 1
toc: true
---

This use case demonstrates deploying an AWS Lambda function with the Platform Orchestrator using an ECS-based serverless runner.

## Overview

The use case sets up the complete infrastructure needed to deploy Lambda functions through the Platform Orchestrator, including:

- Platform Orchestrator project and environment
- Platform Orchestrator resource types and modules for Lambda deployment with optional Lambda function URL configuration
- ECS serverless runner for Lambda deployments
- IAM policies and roles for Lambda function management
- S3 integration for Lambda deployment packages

You need to supply a Lambda deployment package and place it in an S3 bucket to run this use case. A sample deployment package is provided.

## Prerequisites

- A Platform Orchestrator organization
- The [`octl` CLI](https://developer.humanitec.com/platform-orchestrator/docs/integrations/cli/) installed locally and authenticated (`octl login`)
- An AWS account with appropriate permissions to set up the objects named above
- AWS credentials configured for the [AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)
  - E.g. Having the `aws` CLI installed locally and authenticated
- Platform Orchestrator credentials configured for the [platform-orchestrator provider](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs)
  - E.g. Having the `htcl` CLI installed locally and authenticated
- Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed locally
- (optional) An S3 bucket for Lambda deployment packages
- (optional) A Lambda function deployment package of your choice

The setup uses an [ECS runner](https://developer.humanitec.com/platform-orchestrator/docs/configure/runners/runner-types/serverless-ecs/) for the Orchestrator to execute deployments. The use case can create all required infrastructure for you, or you can bring your own. The examples below show all scenarios.

## Usage

### 1. Provide a deployment package S3 bucket

If you do not have an S3 bucket to host Lambda deployment packages, create one now via the [AWS console](https://console.aws.amazon.com/s3/buckets), using all default settings.

### 2. Install the use case setup

Create a local file `main.tf` and populate it using one the example setups shown below. Fill in all values according to your setup.

<details>
<summary>Example 1: Create everything for me</summary>

This minimal prerequisites setup will create all AWS infrastructure and provide a publicly accessible function URL for testing.

```hcl
# main.tf
module "lambda_serverless" {
  source = "github.com/humanitec/platform-orchestrator-use-cases//serverless-targets/lambda"

  # Platform Orchestrator Configuration
  org_id = "your-org-id"

  # AWS Configuration
  aws_region = "your-aws-region" # "e.g. eu-central-1"

  # Lambda Configuration
  lambda_package_s3_bucket      = "your-deployment-package-bucket-name"
  lambda_enable_function_url    = true
  lambda_function_url_auth_type = "NONE"  # Make function URL publicly accessible
}
```

</details>
<details>
<summary>Example 2: Use existing OIDC provider</summary>

If you already have an OIDC provider configured for `oidc.humanitec.dev`, configure it here:

```hcl
# main.tf
module "lambda_serverless" {
  source = "github.com/humanitec/platform-orchestrator-use-cases//serverless-targets/lambda"

  # Platform Orchestrator Configuration
  org_id = "your-org-id"

  # AWS Configuration
  aws_region = "eu-central-1"

  # Lambda Configuration
  lambda_package_s3_bucket = "your-deployment-package-bucket-name"

  # OIDC configuration
  existing_oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/oidc.humanitec.dev"
}
```

</details>

<details>
<summary>Example 3: Use a different Lambda runtime and handler</summary>

If you are using your own deployment package, configure the proper Lambda runtime:

```hcl
# main.tf
module "lambda_serverless" {
  source = "github.com/humanitec/platform-orchestrator-use-cases//serverless-targets/lambda"

  # Platform Orchestrator Configuration
  org_id = "your-org-id"

  # AWS Configuration
  aws_region = "eu-central-1"

  # Lambda Configuration
  lambda_runtime = "<your-lambda-runtime>"
  lambda_handler = "<your-lambda-handler>"
}
```

</details>

<details>
<summary>Example 4: Showing advanced options</summary>

```hcl
module "lambda_serverless" {
  source = "github.com/humanitec/platform-orchestrator-use-cases//serverless-targets/lambda"

  # Platform Orchestrator Configuration
  org_id             = "your-org-id"
  project_id_prefix  = "lambda-use-case"
  env_id             = "dev"
  env_type_id_prefix = "development"

  # AWS Configuration
  aws_region = "eu-central-1"

  # Existing ECS Runner Configuration
  ecs_runner_cluster_name       = "your-ecs-cluster"
  ecs_runner_subnet_ids         = ["subnet-xxxxxxxxxxxxx"]
  ecs_runner_security_group_ids = ["sg-xxxxxxxxxxxxx"]

  # Optional: Prefix for ECS runner resources (used when ecs_runner_cluster_name is null)
  # ecs_runner_prefix = "ecs-runner-"

  # Optional: Specify a custom ECS runner ID instead of auto-generating one
  # ecs_runner_id = "my-custom-runner-id"

  # Optional: Pass environment variables to the ECS runner
  # ecs_runner_environment = {
  #   LOG_LEVEL = "info"
  #   DEBUG     = "false"
  # }

  # Optional: Pass secrets to the ECS runner (ARNs from AWS Secrets Manager or Systems Manager Parameter Store)
  # ecs_runner_secrets = {
  #   API_KEY     = "arn:aws:secretsmanager:eu-central-1:123456789012:secret:my-api-key-AbCdEf"
  #   DB_PASSWORD = "arn:aws:ssm:eu-central-1:123456789012:parameter/db/password"
  # }

  # Optional: Do not force delete the S3 bucket used for runner state files on destroy
  # ecs_runner_force_delete_s3 = false

  # OIDC Configuration
  oidc_hostname              = "your-oidc.hostname.dev"
  existing_oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/your-oidc.hostname.dev"

  # Lambda Configuration
  lambda_package_s3_bucket = "your-lambda-function-packages"
  lambda_timeout           = 100

  # Optional: customize the module/resource type ID
  # lambda_module_id_prefix = "lambda-zip"

  # Optional: customize the Lambda function name prefix
  # lambda_name_prefix = "$${context.project_id}-$${context.env_id}"

  # Optional: add or override inline IAM policies for Lambda execution role
  # lambda_additional_inline_policies = {
  #   s3_access = jsonencode({
  #     Version = "2012-10-17"
  #     Statement = [{
  #       Effect   = "Allow"
  #       Action   = ["s3:GetObject", "s3:PutObject"]
  #       Resource = "arn:aws:s3:::my-bucket/*"
  #     }]
  #   })
  # }

  lambda_runtime     = "provided.al2023"
  lambda_handler     = "bootstrap"
  lambda_memory_size = 128
  # lambda_architectures = ["arm64"]  # Use ARM architecture instead of x86_64

  # Optional: Use a custom IAM role for Lambda
  # lambda_iam_role_arn = "arn:aws:iam::123456789012:role/my-lambda-role"

  # Optional: Add managed IAM policies to Lambda execution role
  # lambda_additional_managed_policy_arns = [
  #   "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  # ]

  # Optional: Add tags to Lambda function
  # lambda_additional_tags = {
  #   Application = "MyApp"
  #   Component   = "Backend"
  # }

  # Function URL Configuration (disabled by default)
  # lambda_enable_function_url = true  # Uncomment to enable function URL
  # lambda_function_url_auth_type = "NONE"  # Make function URL publicly accessible
  # lambda_function_url_cors = {
  #   allow_origins     = ["https://example.com"]
  #   allow_methods     = ["GET", "POST"]
  #   allow_headers     = ["Content-Type"]
  #   max_age           = 300
  # }

  # Optional: Additional tags for ECS runner and other resources
  additional_tags = {
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}
```

</details>

<br/>
Apply the setup:

```bash
# When using Terraform
terraform init
terraform apply
```

```bash
# When using OpenTofu
tofu init
tofu apply
```

### 3. Upload a deployment package

Upload a deployment package to the S3 bucket.

A sample deployment package containing a simple Node.js application is available for download [here](https://github.com/humanitec/platform-orchestrator-use-cases/raw/refs/heads/main/serverless-targets/lambda/deployment_package/function.zip).

If you are using your own deployment package, make sure the Lambda runtime is set correctly. Refer to the example above to see how to set a different runtime.

Upload the package to the S3 bucket in this folder structure using the AWS console. It uses the Orchestrator project/environment hiearchy as a way to organize the packages:

`<project_id>/development/function.zip`

You may obtain the `<project_id>` of the newly created Orchestrator project from the TF outputs:

```bash
# When using Terraform
export PROJECT_ID=$(terraform show -json terraform.tfstate | jq -r '.values.root_module.child_modules[].resources[] | select(.address == "module.lambda_serverless.platform-orchestrator_project.this") | .values.id')
echo $PROJECT_ID
```

```bash
# When using OpenTofu
export PROJECT_ID=$(tofu show -json terraform.tfstate | jq -r '.values.root_module.child_modules[].resources[] | select(.address == "module.lambda_serverless.platform-orchestrator_project.this") | .values.id')
echo $PROJECT_ID
```

### 4. Perform a deployment

Create a deployment manifest file named `manifest.yaml`:

```yaml
workloads:
  # The name you assign to the workload in the context of the manifest
  demo-app:
    resources:
      # The name you the assign to this resource in the context of the manifest
      demo-workload:
        # The resource type of the resource you wish to provision
        type: lambda-zip
        # The resource parameters. They are mapped to the module_params of the module
        params:
          s3_key: "${context.project_id}/${context.env_id}/function.zip"
          environment_variables:
            ENV: ${context.env_id}
```

Deploy the manifest into the project environment created by the use case:

```bash
octl deploy $PROJECT_ID development manifest.yaml
```

### 5. Validate the result

Once the deployment finished, open the [Orchestrator console](https://console.humanitec.dev) and find the project created for this use case in the "Projects" view. Use `echo $PROJECT_ID` to obtain the project ID.

Open the "development" environment. In the resource graph, select the `lambda-zip` resource representing the Lambda function.

Click on the AWS Console URL metadata to open the function in the AWS console.

Click on the Function URL metadata to open the function URL. If you used the sample deployment package, the URL will show a message from the running function, including the environment which was injected into an environment variable in the manifest.

## Clean up

First remove the environment to deprovision all real-world resources:

```bash
# When using Terraform
terraform destroy -target="module.lambda_serverless.platform-orchestrator_environment.this"
```

```bash
# When using OpenTofu
tofu destroy -target="module.lambda_serverless.platform-orchestrator_environment.this"
```

Then destroy all resources created by this use case:

```bash
# When using Terraform
terraform destroy
```

```bash
# When using OpenTofu
tofu destroy
```

## Resources Created

This module creates the following resources:

- **Platform Orchestrator Resources**
  - Project
  - Environment
  - Runner rule
  - Resource type (lambda-zip)
  - Module configuration
  - Module rule

- **AWS Resources**
  - IAM policy for Lambda deployment
  - IAM role policy attachment

- **External Modules**
  - ECS serverless runner

## IAM Permissions

The module creates an IAM policy that grants the ECS runner the following permissions:

- Lambda function lifecycle management (create, update, delete)
- Lambda function URL configuration
- IAM role and policy management for Lambda execution roles
- S3 access for deployment packages

## Security Considerations

- When the module creates IAM roles (`lambda_iam_role_arn` is null), the ECS runner is granted permissions to manage roles matching the `lambda_iam_role_prefix` pattern (default: `lambda-role-*`)
- When using a custom IAM role (`lambda_iam_role_arn` is provided), no IAM role/policy management permissions are granted to the ECS runner
- S3 bucket access is limited to the specified deployment package bucket
- Lambda functions have inline policies for accessing project-specific S3 buckets
- All resources are tagged for tracking and governance

## References

- [Platform Orchestrator Documentation](https://developer.humanitec.com)
- [Platform Orchestrator Terraform Modules](https://github.com/humanitec-tf-modules)

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.8.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 4.0 |
| <a name="requirement_platform-orchestrator"></a> [platform-orchestrator](#requirement\_platform-orchestrator) | ~> 2.0 |
| <a name="requirement_random"></a> [random](#requirement\_random) | >= 3.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 6.21.0 |
| <a name="provider_platform-orchestrator"></a> [platform-orchestrator](#provider\_platform-orchestrator) | 2.10.1 |
| <a name="provider_random"></a> [random](#provider\_random) | 3.7.2 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_ecs_runner"></a> [ecs\_runner](#module\_ecs\_runner) | github.com/humanitec-tf-modules/serverless-ecs-orchestrator-runner | v1.1.0 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_policy.lambda_deployment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_role_policy_attachment.ecs_runner_lambda_deployment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [platform-orchestrator_environment.this](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/environment) | resource |
| [platform-orchestrator_environment_type.this](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/environment_type) | resource |
| [platform-orchestrator_module.lambda_zip](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/module) | resource |
| [platform-orchestrator_module_rule.lambda_zip](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/module_rule) | resource |
| [platform-orchestrator_project.this](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/project) | resource |
| [platform-orchestrator_resource_type.lambda_zip](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/resource_type) | resource |
| [platform-orchestrator_runner_rule.this](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/runner_rule) | resource |
| [random_id.env_type_id](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id) | resource |
| [random_id.lambda_module_id](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id) | resource |
| [random_id.project_id](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id) | resource |
| [aws_iam_policy_document.lambda_deployment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_additional_tags"></a> [additional\_tags](#input\_additional\_tags) | Additional tags to apply to resources | `map(string)` | `{}` | no |
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | AWS region where resources will be deployed | `string` | `"eu-central-1"` | no |
| <a name="input_ecs_runner_cluster_name"></a> [ecs\_runner\_cluster\_name](#input\_ecs\_runner\_cluster\_name) | Name of the existing ECS cluster for the runner | `string` | `null` | no |
| <a name="input_ecs_runner_environment"></a> [ecs\_runner\_environment](#input\_ecs\_runner\_environment) | Plain text environment variables to expose in the ECS runner | `map(string)` | `{}` | no |
| <a name="input_ecs_runner_force_delete_s3"></a> [ecs\_runner\_force\_delete\_s3](#input\_ecs\_runner\_force\_delete\_s3) | Force delete the ECS runner S3 state files bucket on destroy even if it's not empty | `bool` | `false` | no |
| <a name="input_ecs_runner_id"></a> [ecs\_runner\_id](#input\_ecs\_runner\_id) | The ID of the ECS runner. If not provided, one will be generated using ecs\_runner\_prefix | `string` | `null` | no |
| <a name="input_ecs_runner_prefix"></a> [ecs\_runner\_prefix](#input\_ecs\_runner\_prefix) | Prefix for the ECS runner resources (used when ecs\_runner\_cluster\_name is null) | `string` | `"ecs-runner"` | no |
| <a name="input_ecs_runner_secrets"></a> [ecs\_runner\_secrets](#input\_ecs\_runner\_secrets) | Secret environment variables to expose in the ECS runner. Each value should be a secret or property ARN | `map(string)` | `{}` | no |
| <a name="input_ecs_runner_security_group_ids"></a> [ecs\_runner\_security\_group\_ids](#input\_ecs\_runner\_security\_group\_ids) | List of security group IDs for the ECS runner | `list(string)` | `[]` | no |
| <a name="input_ecs_runner_subnet_ids"></a> [ecs\_runner\_subnet\_ids](#input\_ecs\_runner\_subnet\_ids) | List of subnet IDs for the ECS runner | `list(string)` | `[]` | no |
| <a name="input_env_id"></a> [env\_id](#input\_env\_id) | The environment ID within the project | `string` | `"development"` | no |
| <a name="input_env_type_id_prefix"></a> [env\_type\_id\_prefix](#input\_env\_type\_id\_prefix) | The environment type ID prefix (e.g., 'development', 'production') | `string` | `"development"` | no |
| <a name="input_existing_oidc_provider_arn"></a> [existing\_oidc\_provider\_arn](#input\_existing\_oidc\_provider\_arn) | ARN of the existing OIDC provider | `string` | `null` | no |
| <a name="input_lambda_additional_inline_policies"></a> [lambda\_additional\_inline\_policies](#input\_lambda\_additional\_inline\_policies) | Map of additional inline IAM policies to attach to the Lambda execution role. Each key is the policy name and value is the JSON-encoded policy document. | `map(string)` | `{}` | no |
| <a name="input_lambda_additional_managed_policy_arns"></a> [lambda\_additional\_managed\_policy\_arns](#input\_lambda\_additional\_managed\_policy\_arns) | List of additional managed IAM policy ARNs to attach to the Lambda execution role | `list(string)` | `[]` | no |
| <a name="input_lambda_additional_tags"></a> [lambda\_additional\_tags](#input\_lambda\_additional\_tags) | Additional tags to apply to the Lambda function | `map(string)` | `{}` | no |
| <a name="input_lambda_architectures"></a> [lambda\_architectures](#input\_lambda\_architectures) | Instruction set architecture for the Lambda function. Valid values: ['x86\_64'] or ['arm64'] | `list(string)` | <pre>[<br/>  "x86_64"<br/>]</pre> | no |
| <a name="input_lambda_enable_function_url"></a> [lambda\_enable\_function\_url](#input\_lambda\_enable\_function\_url) | Enable Lambda function URL | `bool` | `false` | no |
| <a name="input_lambda_function_url_auth_type"></a> [lambda\_function\_url\_auth\_type](#input\_lambda\_function\_url\_auth\_type) | Authorization type for the Function URL. 'NONE' = public access, 'AWS\_IAM' = requires AWS credentials | `string` | `"AWS_IAM"` | no |
| <a name="input_lambda_function_url_cors"></a> [lambda\_function\_url\_cors](#input\_lambda\_function\_url\_cors) | CORS configuration for the Function URL. Only applies if lambda\_enable\_function\_url is true | <pre>object({<br/>    allow_credentials = optional(bool, false)<br/>    allow_origins     = optional(list(string), ["*"])<br/>    allow_methods     = optional(list(string), ["*"])<br/>    allow_headers     = optional(list(string), [])<br/>    expose_headers    = optional(list(string), [])<br/>    max_age           = optional(number, 0)<br/>  })</pre> | `null` | no |
| <a name="input_lambda_handler"></a> [lambda\_handler](#input\_lambda\_handler) | Lambda function handler | `string` | `"index.handler"` | no |
| <a name="input_lambda_iam_role_arn"></a> [lambda\_iam\_role\_arn](#input\_lambda\_iam\_role\_arn) | Optional IAM role ARN to use for the Lambda function. If not provided, a new role will be created | `string` | `null` | no |
| <a name="input_lambda_iam_role_prefix"></a> [lambda\_iam\_role\_prefix](#input\_lambda\_iam\_role\_prefix) | Prefix for Lambda execution IAM role names when roles are created by the module (only used when lambda\_iam\_role\_arn is null) | `string` | `"lambda-role-"` | no |
| <a name="input_lambda_memory_size"></a> [lambda\_memory\_size](#input\_lambda\_memory\_size) | Amount of memory in MB that your Lambda function can use at runtime. Valid value between 128 MB to 10,240 MB | `number` | `128` | no |
| <a name="input_lambda_module_id_prefix"></a> [lambda\_module\_id\_prefix](#input\_lambda\_module\_id\_prefix) | Prefix for the Lambda module and resource type IDs | `string` | `"lambda-zip-"` | no |
| <a name="input_lambda_name_prefix"></a> [lambda\_name\_prefix](#input\_lambda\_name\_prefix) | Prefix for Lambda function names. Supports Platform Orchestrator context variables like ${context.project\_id} | `string` | `"${context.project_id}"` | no |
| <a name="input_lambda_package_s3_bucket"></a> [lambda\_package\_s3\_bucket](#input\_lambda\_package\_s3\_bucket) | S3 bucket name for Lambda deployment packages | `string` | n/a | yes |
| <a name="input_lambda_runtime"></a> [lambda\_runtime](#input\_lambda\_runtime) | Lambda runtime environment | `string` | `"nodejs22.x"` | no |
| <a name="input_lambda_timeout"></a> [lambda\_timeout](#input\_lambda\_timeout) | Default timeout for Lambda functions in seconds | `number` | `100` | no |
| <a name="input_oidc_hostname"></a> [oidc\_hostname](#input\_oidc\_hostname) | OIDC hostname for authentication | `string` | `"oidc.humanitec.dev"` | no |
| <a name="input_org_id"></a> [org\_id](#input\_org\_id) | The Platform Orchestrator organization ID | `string` | n/a | yes |
| <a name="input_project_id_prefix"></a> [project\_id\_prefix](#input\_project\_id\_prefix) | The Platform Orchestrator project ID prefix | `string` | `"lambda-project-"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_ecs_runner_id"></a> [ecs\_runner\_id](#output\_ecs\_runner\_id) | The ID of the ECS runner |
| <a name="output_ecs_runner_task_role_arn"></a> [ecs\_runner\_task\_role\_arn](#output\_ecs\_runner\_task\_role\_arn) | The ARN of the ECS runner task role |
| <a name="output_ecs_runner_task_role_name"></a> [ecs\_runner\_task\_role\_name](#output\_ecs\_runner\_task\_role\_name) | The name of the ECS runner task role |
| <a name="output_environment_id"></a> [environment\_id](#output\_environment\_id) | The ID of the Platform Orchestrator environment |
| <a name="output_lambda_deployment_policy_arn"></a> [lambda\_deployment\_policy\_arn](#output\_lambda\_deployment\_policy\_arn) | The ARN of the IAM policy for Lambda deployment |
| <a name="output_lambda_deployment_policy_name"></a> [lambda\_deployment\_policy\_name](#output\_lambda\_deployment\_policy\_name) | The name of the IAM policy for Lambda deployment |
| <a name="output_lambda_zip_module_id"></a> [lambda\_zip\_module\_id](#output\_lambda\_zip\_module\_id) | The ID of the lambda-zip module |
| <a name="output_lambda_zip_resource_type_id"></a> [lambda\_zip\_resource\_type\_id](#output\_lambda\_zip\_resource\_type\_id) | The ID of the lambda-zip resource type |
| <a name="output_project_id"></a> [project\_id](#output\_project\_id) | The ID of the Platform Orchestrator project |
<!-- END_TF_DOCS -->
