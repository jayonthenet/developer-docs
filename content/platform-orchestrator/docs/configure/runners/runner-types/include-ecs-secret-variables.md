---
title: "Serverless ECS secret variables"
draft: true # This page is made for being included in other pages, not standalone
---

[ECS runners]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/serverless-ecs" >}}) support a `runner_configuration.job.secrets` field which may contain a mapping from environment variable key to [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) Secret ARN or [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) Parameter ARN:

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
  runner_configuration = {
    job = {
      secrets = {
        TF_EXAMPLE   = "arn:aws:secretsmanager:eu-central-1:123456789012:secret:myapp/api-key-XyZ9Qw"
        TF_EXAMPLE_2 = "arn:aws:ssm:eu-central-1:123456789012:parameter/app/config/api-endpoint"
      }
    }
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  job:
    secrets:
      TF_EXAMPLE: arn:aws:secretsmanager:eu-central-1:123456789012:secret:myapp/api-key-XyZ9Qw
      TF_EXAMPLE_2: arn:aws:ssm:eu-central-1:123456789012:parameter/app/config/api-endpoint
```

{{% /tab %}}
{{< /tabs >}}

We recommend using secrets manager ARNs for sensitive values.

The `job.execution_role_arn` of the ECS runner will be used to access these ARNs, therefor you will need to create an appropriate IAM policy to grant the required actions:

```json
[
    {
        "Version": "2012-10-17",
        "Action": [
            "secretsmanager:GetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:eu-central-1:123456789012:secret:myapp/*"
    },
    {
        "Version": "2012-10-17",
        "Action": [
            "ssm:GetParameter"
        ],
        "Resource": "arn:aws:ssm:eu-central-1:123456789012:parameter/app/config/api-endpoint"
    }
]
```
