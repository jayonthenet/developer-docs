---
title: Rollback
description: The Platform Orchestrator can remediate application or infrastructure issues introduced by faulty deployments by executing a rollback to a previous, stable configuration.
draft: false
type: docs
weight: 1
toc: true
---

The Platform Orchestrator can remediate application or infrastructure issues introduced by faulty deployments by executing a rollback to a previous, stable configuration.

> ℹ️ **Note**
>
> This use case is planned but not implemented yet.

When a deployment causes instability in an application or its dependencies, the Platform Orchestrator allows teams to rapidly restore a previously known good state without manual reconstruction of configs or infrastructure.

Using the Orchestrator’s deployment history, teams can identify the last successful deployment for a given environment and trigger a rollback against that specific deployment ID. A rollback deployment reuses both the manifest and the resource graph from that earlier deployment and regenerates the Terraform/OpenTofu code with the same module versions that were used at the time, ensuring that application and infrastructure configuration are reverted together in a consistent way.

The rollback is executed like any other deployment and supports dry run and plan-only mode for safe validation. It appears in the normal deployment history with its own logs and outputs. This lets teams quickly mitigate production issues, restore service health, and maintain a full audit trail of what was changed and when.

## References

- [Platform Orchestrator Documentation](https://docs.stellwerk.dev/platform-orchestrator/)
- [Platform Orchestrator Terraform Modules](https://github.com/stellwerk-tf-modules)

<!-- BEGIN_TF_DOCS -->

<!-- END_TF_DOCS -->
