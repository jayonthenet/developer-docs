---
title: "serverless-ecs"
description: "The `serverless-ecs` runner type lets you execute runners on AWS ECS (Elastic Container Service) Fargate clusters within your AWS account."
draft: false
type: docs
weight: 100
toc: true
---

{{% description %}}

The Platform Orchestrator can execute the runner as an ECS task for each deployment. This task will run on your ECS cluster which means:

1. It stores its state in your choice of state storage backend within your AWS account
2. It is bound to a subnet within your own VPC for networking
3. It executes as an IAM role within your account and may read and write infrastructure within your account according to the permissions you delegate to it

Each task makes outbound HTTPS requests to the installation's
[runner gateway]({{< relref "/platform-orchestrator/docs/architecture/runner-gateway" >}})
for its deployment bundle, result, and encrypted logs. The data plane injects
the gateway URL and a deployment-scoped token when it launches the task. The
Terraform module does not require broker credentials.

To access the ECS cluster, the Platform Orchestrator uses temporary credentials granted through OIDC and an assume-role-with-web-identity policy to assume a role within your AWS account.

Although you can use most state storage backends with the ECS runner, we recommend you use the [`s3` state storage]({{< relref "/platform-orchestrator/docs/configure/runners/state-storage-types/s3" >}}) type for the best integration and centralised management.

## Basic example

{{< tabs >}}
{{% tab name="TF" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_serverless_ecs_runner/resource.tf" %}}

{{% /tab %}}
{{% tab name="CLI" %}}

`runner-config.yaml`:

```yaml
runner_configuration:
  type: serverless-ecs
  auth:
    # The role the Platform Orchestrator assumes within your account
    role_arn: arn:aws:iam::123456789012:role/orchestrator-role
  job:
    region: eu-central-1
    cluster: my-ecs-cluster
    # The role the task executes with
    execution_role_arn: arn:aws:iam::123456789012:role/runner-execution-role
    subnets: ["subnet-a"]
state_storage_configuration:
  ...
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

The following configuration shows all available options for the `serverless-ecs` runner type:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/resources/serverless_ecs_runner#schema) or [OpenTofu](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest/docs/resources/serverless_ecs_runner#schema) provider documentation.

{{% details "Extended example" %}}

{{% github-file filename="/stellwerk-labs/terraform-provider-platform-orchestrator/refs/heads/main/examples/resources/platform-orchestrator_serverless_ecs_runner/resource.tf" %}}

{{% /details %}}

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  # Runner type
  type: serverless-ecs

  auth:
    # The ARN of the role that the Platform Orchestrator will assume in your account.
    role_arn: arn:aws:iam::123456789012:role/orchestrator-role

  job:
    # The AWS region of the ECS cluster
    region: us-west-2

    # The name of the AWS ECS cluster to execute tasks in
    cluster: my-ecs-cluster

    # The ARN of the role that will be used to execute the task. You should grant this role at least the `arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy` or equivalent permissions. This role will also be used inside the task if no `task_role_arn` is defined.
    execution_role_arn: arn:aws:iam::123456789012:role/runner-execution-role

    # A list of at least one AWS subnet ID within your account to use as the networking for the task.
    subnets:
    - subnet-1

    # An optional ARN of the role that will be used inside the task. This defaults to the `execution_role_arn` if you don't define it. You should grant this role at least the permissions to use the target state store configuration.
    task_role_arn: arn:aws:iam::123456789012:role/runner-task-role

    # An optional boolean to request a public IP for each task. This may be required in subnets using an internet gateway for egress routing.
    is_public_ip_enabled: true

    # An optional list of security groups to associate with the ECS tasks.
    security_groups:
    - runner-security-group

    # An optional map of plain-text environment variables to populate in the runner.
    environment:
      EXAMPLE_ENVIRONMENT_VARIABLE: value

    # An optional of environment variable names with either AWS Secrets Manager or AWS Parameter Store parameters to mount in the runner.
    secrets:
      SECRET_ENVIRONMENT_VARIABLE: "arn:aws:secretsmanager:eu-central-1:123456789012:secret:myapp/api-key-XyZ9Qw"
      PROPERTY_ENVIRONMENT_VARIABLE: "arn:aws:ssm:eu-central-1:123456789012:parameter/app/config/api-endpoint"

    # An optional custom container image to use instead of the default platform-orchestrator-runner image.
    image: your-registry.com/your-custom-runner:v1.0.0

state_storage_configuration:
  # ...
```

{{% /tab %}}
{{< /tabs >}}

{{< alert context="warning" >}}
The `environment` property is for plain text and non sensitive values only since it is stored in the database of the Platform Orchestrator. All sensitive values should be mounted from `secrets`.
{{< /alert >}}

### Using custom container images

{{< include "/platform-orchestrator/docs/configure/runners/include-custom-image.md" >}}

For private registries, ensure your ECS execution role has the necessary permissions to pull the image.

To use a custom image with your serverless ECS runner, specify the `image` property in the `job` configuration:

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
resource "platform-orchestrator_serverless_ecs_runner" "runner" {
  id = "my-custom-runner"

  runner_configuration = {
    type = "serverless-ecs"

    auth = {
      role_arn = "arn:aws:iam::123456789012:role/orchestrator-role"
    }

    job = {
      region = "us-west-2"
      cluster = "my-ecs-cluster"
      execution_role_arn = "arn:aws:iam::123456789012:role/runner-execution-role"
      subnets = ["subnet-12345"]

      # Custom container image
      image = "your-registry.com/your-custom-runner:v1.0.0"
    }
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  type: serverless-ecs

  auth:
    role_arn: arn:aws:iam::123456789012:role/orchestrator-role

  job:
    region: us-west-2
    cluster: my-ecs-cluster
    execution_role_arn: arn:aws:iam::123456789012:role/runner-execution-role
    subnets:
      - subnet-12345

    # Custom container image
    image: your-registry.com/your-custom-runner:v1.0.0
```

{{% /tab %}}
{{< /tabs >}}

{{< include "/platform-orchestrator/docs/configure/runners/include-custom-image-alert.md" >}}

### Setting sensitive environment variables

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-ecs-secret-variables.md" >}}

## Connectivity

ECS task launching is done through the AWS APIs. Besides proper [permissions](#required-permissions), the Orchestrator needs network connectivity to AWS APIs, typically over HTTPS to AWS endpoints.

Provide outgoing AWS API access from the data plane to the relevant [AWS service endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html) according to your networking layout. AWS also needs public HTTPS access to the discovery and JWKS documents of your installation's OIDC issuer.

## Required permissions

### `auth.role_arn`

The Platform Orchestrator will assume this role using OIDC and use it to manage ECS task definitions and execute one-off tasks. Therefore it needs:

1. OIDC federation to allow your installation's issuer to assume the role where the `sub` (subject) claim is `${PO_ORG_ID}+${RUNNER_ID}`
2. A policy allowing it to be passed to the ecs-tasks service
3. Permissions to List, Register, Deregister, and Delete ECS task definitions in the account
4. Permissions to List, Describe, Run, and Tag ECS tasks within the target ECS cluster

### `job.execution_role_arn`

The Platform Orchestrator will use this role to setup and launch each ECS task for the runner. Therefore it needs:

1. A policy allowing it to be passed to the ecs-tasks service

No additional permissions are required. However, because this role will be used as the `job.task_role_arn` if you do not specify one, it may need additional runtime permissions. See the next section.

If your ECS cluster has Container Insights, KMS encryption, or other configuration settings that require additional permissions, you will need to assign them to this role.

### `job.task_role_arn`

The Platform Orchestrator will expose this role within each ECS task for the runner using the `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI` and the local ECS container endpoint (`http://169.254.179.2`). This allows any AWS SDK within the runner to assume this role. This will be used by default for the `s3` state storage backend or `hashicorp/aws` provider if used.

At minimum this role needs a policy allowing it to be assumed by the ecs-tasks service.

## Setup guide

The steps below serve as a general guide of the steps to configure the runner using the either Terraform/OpenTofu ("TF") code or the CLI. Your unique use case may require a more complex setup.

### Before you begin

- An existing [AWS ECS cluster with Fargate serverless capacity](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) enabled
- An existing AWS Subnet ID within the same region as the ECS cluster. The subnet must have egress internet access configured via an appropriate gateway setup
- The [`aws` CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed and authenticated with a principal having permission to manage IAM roles and policies in the AWS account of the ECS cluster
- Depending on your choice of tooling:
  - TF: Either the [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) or the [OpenTofu CLI](https://opentofu.org/docs/intro/install/) installed
  - CLI: The [`octl` CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}) installed and authenticated against your Orchestrator organization

{{< alert context="info" >}}
A [public Terraform/OpenTofu module](https://github.com/stellwerk-tf-modules/serverless-ecs-orchestrator-runner) is available for the ECS runner. Instead of creating the TF code manually as shown below, we recommend you use the module for greater convenience. Refer to the module description for usage instructions.
{{< /alert >}}

### Prepare the cloud environment

Perform the following to allow the runner to execute:

The steps use the optional OIDC issuer exposed by your Platform Orchestrator installation. Replace `oidc.orchestrator.example.com` with its hostname. The value must match `data-plane.config.OIDC_ISSUER_URL`, and AWS must be able to retrieve its discovery and JWKS documents over publicly trusted HTTPS.

1. Set values

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
locals {
  aws_account_id = "<my-aws-account-id>"
  aws_region     = "<my-aws-region>"
  ecs_cluster    = "<my-ecs-cluster-name>"
  subnet_id      = "<my-subnet-id>"
  platform_orchestrator_org = "<my-org>"
  oidc_hostname  = "oidc.orchestrator.example.com"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
export AWS_ACCOUNT_ID=<my-aws-account-id>
export AWS_REGION=<my-aws-region>
export ECS_CLUSTER=<my-ecs-cluster-name>
export SUBNET_ID=<my-subnet-id>
export PO_ORG_ID=<my-org>
export OIDC_HOSTNAME=oidc.orchestrator.example.com
```

{{% /tab %}}
{{< /tabs >}}

2. Create an IAM role for the Orchestrator, creating the open-id-connect provider if you don't have one already

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
locals {
  ecs_runner_id = "ecs-${local.ecs_cluster}-${local.aws_region}"
}

resource "aws_iam_openid_connect_provider" "provider" {
  url = "https://${local.oidc_hostname}"
  client_id_list = [
    "sts.amazonaws.com",
  ]
}

data "aws_iam_policy_document" "ecs_runner_orchestrator_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.provider.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_hostname}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_hostname}:sub"
      values   = ["${local.platform_orchestrator_org}+${local.ecs_runner_id}"]
    }
  }
}

resource "aws_iam_role" "ecs_runner_orchestrator_role" {
  name_prefix        = "ecs_orchestrator"
  assume_role_policy = data.aws_iam_policy_document.ecs_runner_orchestrator_role.json
  description        = "Role for the Orchestrator to access ECS clusters for launching runners"
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
aws iam create-open-id-connect-provider \
  --url https://${OIDC_HOSTNAME} \
  --client-id-list sts.amazonaws.com

export RUNNER_ID=ecs-${ECS_CLUSTER}-${AWS_REGION}

cat <<EOF > platform-orchestrator-runner-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_HOSTNAME}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_HOSTNAME}:aud": "sts.amazonaws.com",
          "${OIDC_HOSTNAME}:sub": "${PO_ORG_ID}+${RUNNER_ID}"
        }
      }
    }
  ]
}
EOF

export ORCHESTRATOR_IAM_ROLE=ecs-runner-orchestrator-role

aws iam create-role \
  --role-name ${ORCHESTRATOR_IAM_ROLE} \
  --assume-role-policy-document file://platform-orchestrator-runner-trust-policy.json \
  --description "Role for the Orchestrator to access ECS clusters for launching runners"
```

{{% /tab %}}
{{< /tabs >}}

3. Create an IAM policy with minimal ECS permissions and assign it to the role

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
resource "aws_iam_role_policy" "ecs_runner_orchestrator_role" {
  name_prefix = "ecs_orchestrator"
  role = aws_iam_role.ecs_runner_orchestrator_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        {
            Effect = "Allow",
            Action = [
                "ecs:ListTaskDefinitions",
                "ecs:DeregisterTaskDefinition"
            ],
            Resource = "*"
        },
        {
            Effect = "Allow",
            Action = [
                "ecs:RegisterTaskDefinition",
                "ecs:DeleteTaskDefinitions"
            ],
            Resource = [
              "arn:aws:ecs:${local.aws_region}:${local.aws_account_id}:task-definition/platform_orchestrator_*",
            ]
        },
        {
            Effect = "Allow",
            Action = [
                "ecs:ListTasks",
                "ecs:DescribeTasks",
                "ecs:RunTask",
                "ecs:TagResource",
            ],
            Resource = [
              "arn:aws:ecs:${local.aws_region}:${local.aws_account_id}:task-definition/platform_orchestrator_*",
              "arn:aws:ecs:${local.aws_region}:${local.aws_account_id}:cluster/${local.ecs_cluster}",
              "arn:aws:ecs:${local.aws_region}:${local.aws_account_id}:task/${local.ecs_cluster}/*",
              "arn:aws:ecs:${local.aws_region}:${local.aws_account_id}:container-instance/${local.ecs_cluster}/*"
            ]
        },
        {
            Effect = "Allow",
            Action = "iam:PassRole",
            Resource = "*",
            Condition = {
                StringLike = {
                    "iam:PassedToService" = "ecs-tasks.amazonaws.com"
                }
            }
        },
    ]
  })
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat <<EOF > platform-orchestrator-role-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:ListTaskDefinitions",
        "ecs:DeregisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:RegisterTaskDefinition",
        "ecs:DeleteTaskDefinitions"
      ],
      "Resource": [
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task-definition/platform_orchestrator_*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:ListTasks",
        "ecs:DescribeTasks",
        "ecs:RunTask",
        "ecs:TagResource"
      ],
      "Resource": [
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task-definition/platform_orchestrator_*",
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:cluster/${ECS_CLUSTER}",
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:task/${ECS_CLUSTER}/*",
        "arn:aws:ecs:${AWS_REGION}:${AWS_ACCOUNT_ID}:container-instance/${ECS_CLUSTER}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "iam:PassedToService": "ecs-tasks.amazonaws.com"
        }
      }
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name ${ORCHESTRATOR_IAM_ROLE} \
  --policy-name ecs-runner-orchestrator-role-policy \
  --policy-document file://platform-orchestrator-role-policy.json
```

{{% /tab %}}
{{< /tabs >}}

4. Create an IAM role to use as the execution role

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
data "aws_iam_policy_document" "ecs_runner_exec_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_runner_exec_role" {
  name_prefix = "ecs_exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_runner_exec_role.json
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat <<EOF > ecs-runner-exec-role-trust.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

export EXEC_IAM_ROLE=ecs-runner-exec-role

aws iam create-role \
  --role-name ${EXEC_IAM_ROLE} \
  --assume-role-policy-document file://ecs-runner-exec-role-trust.json \
  --description "Role for the Orchestrator to launch ECS tasks"
```

{{% /tab %}}
{{< /tabs >}}

5. You can repeat the previous steps to create the task role. Note that this is the role that will be available from within the ECS runner, so if you need to use an S3 state storage configuration or provision AWS infrastructure you should attach an appropriate policy to this role.

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
data "aws_iam_policy_document" "ecs_runner_task_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_runner_task_role" {
  name_prefix = "ecs_task"
  assume_role_policy = data.aws_iam_policy_document.ecs_runner_task_role.json
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat <<EOF > ecs-runner-task-role-trust.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

export TASK_IAM_ROLE=ecs-runner-task-role

aws iam create-role \
  --role-name ${TASK_IAM_ROLE} \
  --assume-role-policy-document file://ecs-runner-task-role-trust.json \
  --description "Role for the Orchestrator to use within ECS tasks"
```

Or re-use the execution role here:

```bash
export TASK_IAM_ROLE=${EXEC_IAM_ROLE}
```

{{% /tab %}}
{{< /tabs >}}

## Configure a state storage

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-configure-state-storage.md" >}}

## Create a runner

1. Prepare the runner configuration

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
resource "platform-orchestrator_serverless_ecs_runner" "runner" {
  id = local.ecs_runner_id
  runner_configuration = {
    auth = {
      role_arn = aws_iam_role.ecs_runner_orchestrator_role.arn
    }
    job = {
      region = local.aws_region
      cluster = local.ecs_cluster
      execution_role_arn = aws_iam_role.ecs_runner_exec_role.arn
      task_role_arn = aws_iam_role.ecs_runner_task_role.arn
      subnets = [local.subnet_id]
    }
  }
  state_storage_configuration = {
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare the `runner_configuration` in a local file:

```bash
cat <<EOF > runner-config.yaml
runner_configuration:
  type: serverless-ecs
  auth:
    role_arn: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${ORCHESTRATOR_IAM_ROLE}
  job:
    region: ${AWS_REGION}
    cluster: ${ECS_CLUSTER}
    subnets: [${SUBNET_ID}]
    execution_role_arn: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${EXEC_IAM_ROLE}
    task_role_arn: arn:aws:iam::${AWS_ACCOUNT_ID}:role/${TASK_IAM_ROLE}
EOF
```

{{% /tab %}}
{{< /tabs >}}

{{< include "/platform-orchestrator/docs/configure/runners/runner-types/include-common-runner-config.md" "platform-orchestrator_serverless_ecs_runner" >}}
