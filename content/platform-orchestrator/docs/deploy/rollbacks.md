---
title: "Rollbacks"
description: '_Rollback_ deployments can be used to redeploy the manifest and resource graph from a previous deployment in an environment.'
lead: ""
draft: false
type: docs
weight: 20
toc: true
aliases:
- /new-orchestrator/docs/deploy/rollbacks
---

{{% description %}}

When the Platform Orchestrator executes a rollback deployment, it loads the manifest and resource graph from the target deployment and regenerates the Terraform/OpenTofu using the same module versions used in the past. This ignores any new module rules or changes to modules that have been made since the target deployment was executed. Provider configuration is not rolled back and will continue to use the latest state.

Apart from using the resource graph and manifest from a previous deployment, a rollback is the same as a traditional [deployment]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}) and will appear in the deployment history as normal and produce logs and output results.

## Basic Examples

You can rollback an environment using the `rollback` command of the `octl` CLI. This will produce a diff of any manifest changes, prompt for acceptance, and return results and logs just like a normal deployment.

```shell
octl rollback my-project my-environment 01234567-89ab-cdef-0123-456789abcdef
```

If you are unsure about the effects or configuration of a rollback, you can execute it with `--dry-run` or `--plan-only`.

```shell
octl rollback my-project my-environment 01234567-89ab-cdef-0123-456789abcdef --dry-run
octl rollback my-project my-environment 01234567-89ab-cdef-0123-456789abcdef --plan-only
```

See the help output from `octl rollback` for details of other supported flags and options to adjust the deployment behavior.
