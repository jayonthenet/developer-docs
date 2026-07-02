---
title: Progressive rollouts
description: The Platform Orchestrator can rollout infrastructure updates gradually across your estate in controlled waves, providing full rollout control and progress visibilty.
draft: false
type: docs
weight: 1
toc: true
---

The Platform Orchestrator can rollout infrastructure updates gradually across your estate in controlled waves, providing full rollout control and progress visibilty.

> ℹ️ **Note**
> 
> While we are preparing the full use case implementation, you can already see the Platform Orchestrator in action with your own technology stack. [Book a session with us here](https://stellwerk.dev).

Platform teams need to evolve shared infrastructure components (such as database operators) without risking widespread outages. The Platform Orchestrator provides a controlled way to roll out new module versions across environments while limiting blast radius and preserving the ability to roll back quickly.

A typical rollout starts by creating a new version of a module that encapsulates the updated infrastructure behavior (for example, a new Terraform/OpenTofu module version wired via the Orchestrator’s module catalog). The platform team then uses the Orchestrator to apply this version selectively across environments, following a staged progression rather than updating everything at once. Environments can be ordered from lowest-risk to highest-risk (for example, ephemeral and development environments first, then staging, then production), leveraging the Orchestrator’s project/environment structure and promotion capabilities.

Each rollout “wave” is executed as a normal deployment, driven via CLI or CI/CD, which updates the resource graph and regenerates the Terraform/OpenTofu for that environment. Teams can use their existing observability stack (for example, metrics dashboards and alerts) to validate behavior after each wave before proceeding. If issues are detected, the Orchestrator’s rollback capabilities allow reverting a specific environment to a previous working deployment state, using the historic manifest and resource graph and the same module versions that were active at that time without affecting other environments still on older versions.

This pattern enables:

- **Fine-grained control of blast radius** by scoping changes to selected environments or subsets of workloads
- **Progressive rollout** of new infrastructure versions across the estate, aligned with environment progression practices
- **Safe experimentation and fast remediation**, through a combination of deployment history, rollback, and repeatable module-based configuration

## References

- [Platform Orchestrator Documentation](https://docs.stellwerk.dev)
- [Platform Orchestrator Terraform Modules](https://github.com/humanitec-tf-modules)

<!-- BEGIN_TF_DOCS -->

<!-- END_TF_DOCS -->