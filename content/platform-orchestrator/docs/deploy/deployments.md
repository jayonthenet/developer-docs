---
title: "Deployments"
description: '_Deployments_ drive the provisioning of infrastructure and applications within each _environment_. Deployments are executed within a _runner_.'
lead: ""
draft: false
type: docs
weight: 20
toc: true
aliases:
- /new-orchestrator/docs/deploy/deployments
---

{{% description %}}

{{< include "/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

## Basic Examples

You create deployments using the [CLI]({{< relref "/platform-orchestrator/docs/integrations/CLI" >}}). Deployments may be executed directly by your developers, by the platform engineers testing a new configuration, or more frequently by your automated CI/CD processes.

If you maintain a single [manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) file as the source of truth for an environment, you may execute deployments directly against that:

```shell
octl deploy my-project my-environment ./manifest.yaml
```

If the environment is a combination of multiple partial manifests, you will use the `--merge` flag to avoid removing resources declared by other partial manifests:

```shell
octl deploy my-project my-environment ./acme-app-manifest.yaml --merge
```

See the help output from `octl deploy` for details of other supported flags and options to adjust the deployment behavior.

## Validating deployments and manifests before execution

You may wish to validate or test a deployment without executing any changes or changing any state. The Platform Orchestrator supports multiple levels of detail for this.

### The `--dry-run` flag

When the `--dry-run` flag is specified, the Orchestrator will validate the manifest, construct and validate the full resource graph, and attempt to resolve placeholders where possible before returning a success or failure result. Dry run deployments do not record any deployment history or logs and can be used as a light-weight check for commit-hooks, pull request tests, or other validation steps.

### The `--plan-only` flag

When the `--plan-only` flag is set, the Orchestrator performs a deployment as normal, however, it stops the deployment after the Plan step and before Apply. The deployment history is captured, and the caller can examine the logs of the deployment to see the planned changes. The planned deployment will fail if modules, providers, or runners are misconfigured. This may also be used as a pull request validation step during CI/CD.

## What happens during a deployment

When you create a deployment against an environment, the Platform Orchestrator performs the following high-level steps:

1. The Platform Orchestrator receives the [manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) as an input to the deployment request.
2. Once the manifest is finalized, the Platform Orchestrator creates a [resource graph]({{< relref "/platform-orchestrator/docs/deploy/resource-graph" >}}) using the resources requested in the manifest as the initial nodes.
3. The Platform Orchestrator uses the configured [resource-types]({{< relref "/platform-orchestrator/docs/configure/resource-types" >}}) and [modules]({{< relref "/platform-orchestrator/docs/configure/modules" >}}) to expand the resource graph and follow any dependency or co-provisioning rules.
4. Once the resource graph is complete and valid, the Platform Orchestrator then converts this internally into a TF file describing the desired state of the environment. The matched modules become the module sources used to provision each node in the resource graph. Mapped providers are [declared and passed into modules]({{< relref "/platform-orchestrator/docs/configure/providers#providers-in-the-generated-tf-code" >}}).
5. The Platform Orchestrator launches a new [runner]({{< relref "/platform-orchestrator/docs/configure/runners" >}}) instance which executes a Plan and Apply of the TF file against the state storage for the environment. The runner is chosen based on the [runner-rules]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}). The runner returns metadata and status information to the Orchestrator.
6. Finally, any requested outputs are returned in an encrypted form to the client.

## Returning resource outputs securely

In some deployment scenarios, you may rely on the Platform Orchestrator to provision infrastructure only and return to your CI/CD pipeline to perform the final application deployment or configuration using the outputs of the Orchestrator deployment. For example, passing values into a Helm deployment or Ansible playbook.

When a [manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}}) defines workload `outputs`, these values are returned by the runner to the Orchestrator. Because these outputs may include sensitive data such as database credentials, these outputs are stored in an end-to-end encrypted form. Only the client that initiated the deployment may decrypt the outputs.

To obtain the `outputs`, use the `--result` flag to specify a file or '-' for standard output:

```shell
octl deploy my-project my-environment ./manifest.yaml --result=-
```

## Returning runner logs securely

Each deployment records logs of the runner setup, `plan`, and `apply` steps. Again, for security reasons, these logs are stored in an end-to-end encrypted form and you will need the decryption key which is printed during deployment execution in this way:

`[...] To access logs use this secret key: AGE-SECRET-KEY-2DVHUZSNDVH65R0VZECTJ4G8Y5MF7YJQGVJNRJ8GFK92PGDP922FQGTKKNL, e.g. 'octl logs f4565116-57b6-4720bae1f-956912e53636 --key=AGE-SECRET-KEY-2DVHUZSNDVH65R0VZECTJ4G8Y5MF7YJQGVJNRJ8GFK92PGDP922FQGTKKNL'`

The logs can be retrieved using the `octl logs` CLI command shown, or made part of the output with the `--show-logs` flag. The decryption key can be shared to allow trusted parties such as platform engineers to view the logs.

These logs do not include contents of the workload runtimes such as pod logs. If you wish to see runtime logs, you will need to use other observability tools in combination with the Platform Orchestrator.

The format of the logs is generally JSON, but may vary due to the providers used, the value of the `TF_LOG` environment variable within the runner, or other factors.

This script snippet shows how to obtain the `octl logs` command from the output and use it to retrieve the deployment logs:

```bash
#!/bin/bash
set -e

# Perform a regular deployment using the --no-prompt flag to proceed non-interactively
# Capture output from interactive shell in output.txt using the "script" command
# Add the --plan-only flag to perform a TF plan
script -eq -c "octl deploy my-project my-environment ./manifest.yaml --no-prompt" output.txt

# Obtain the command to retrieve deployment logs
GET_LOGS_CMD=$(egrep -o "'octl logs .*AGE-SECRET-KEY.*'" output.txt | tr -d "'")

# Share the command or use it to retrieve the logs:
if [ -z "$GET_LOGS_CMD" ]; then
  echo "octl logs command not found in output"
else
  echo "Writing logs to logs.json"
  $GET_LOGS_CMD > logs.json
fi
```

## Cloning and promoting the manifest between environments

When you manage multiple environments of the same project, you may wish to promote the manifest from one environment to another. This may be to promote from staging to production, or to clone development to an ephemeral environment. You can do this by specifying the environment name as the manifest source:

```shell
octl deploy my-project my-new-environment environment://my-source-environment
```

Or by specifying the deployment id:

```shell
octl deploy my-project my-new-environment deployment://12345678-abcd-dcba-1234-ba0987654321
```

Note that this clones the manifest but may result in different modules being used to provision the resources since the new environment may be subject to different [module rules]({{< relref "/platform-orchestrator/docs/configure/modules/module-rules" >}}) than the source environment.

## Deployment history

Each environment maintains a history of deployments executed against it. This includes the manifest, status information, and metadata regarding the resolved resource graph.

You can list all past deployments into an environment:

```shell
octl get deployments my-project my-environment
```

Using the deployment ID of any deployment, query its details:

```shell
octl get deployment 12345678-abcd-dcba-1234-ba0987654321 -o yaml
```

If you wish to redeploy the manifest used in a previous deployment, you can specify the ID as the manifest source:

```shell
octl deploy my-project my-environment deployment://12345678-abcd-dcba-1234-ba0987654321
```

If you wish to perform a full rollback of the manifest and resource graph, use a [rollback deployment]({{< relref "/platform-orchestrator/docs/deploy/rollbacks" >}}).

## Viewing the generated TF code

You can view the TF code that was generated internally for a deployment using this CLI command:

```bash
octl get tf <deployment-id>
```

Observing the TF code can be critical for debugging failed deployments and understanding the logs for a deployment.

Use the command `octl get deployments` or view the target environment in the Orchestrator console to see past deployments and obtain their deployment ID. The previous section on [deployment history](#deployment-history) has more details.

The `octl get tf` command works for regular deployments as well as for `--plan-mode`. It does not work for the `--dry-run` case because that does not persist a deployment record.

## Destroying environments

Apart from the normal deployment mode, and the plan-only mode, the third type of deployment is a "destroy". This deployment type is triggered when you delete an environment from a project. During a destroy deployment, the Platform Orchestrator executes a TF `destroy` against the current state of the environment to teardown all provisioned infrastructure and applications. If the destroy fails, the environment status will be set to "delete_failed" and the delete can be retried. This may be necessary if the runner or provider configurations need to be updated.

In some situations, you may need to force delete the environment without waiting for a fully successful destroy deployment. This will leave any resources and state behind and simply forget the environment in the Orchestrator. You can force delete an environment using the CLI command `octl delete env my-project my-env --force`. This should be considered a manual "break-glass" operation only and not performed as part of regular CI/CD.
