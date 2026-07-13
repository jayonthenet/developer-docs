---
title: Impact analysis
description: The Platform Orchestrator can detect infrastructure drift on a resource level and pinpoint the impacted environments for a complete situation assessment.
draft: false
type: docs
weight: 1
toc: true
---

The Platform Orchestrator can detect infrastructure drift on a resource level and pinpoint the impacted environments for a complete situation assessment.

> ℹ️ **Note**
> 
> While we are preparing the full use case implementation, you can already see the Platform Orchestrator in action with your own technology stack. [Book a session with us here](https://stellwerk.dev).

Rollout management in the context of the Stellwerk Platform Orchestrator enables platform teams to safely and efficiently propagate infrastructure changes, such as security patches or configuration updates, across multiple environments. When a misconfiguration is detected in a shared module (for example, a module provisioning S3 buckets with incorrect access controls), the Orchestrator provides the ability to immediately assess the scope and impact of the issue.

The Orchestrator’s impact analysis tools allow teams to visualize which workloads and environments are currently using the affected module version. This includes detailed insights into which environments are at risk, which are unaffected, and which teams are responsible for each workload. With this visibility, platform teams can:

- Identify all affected environments and workloads using the problematic module version
- Understand the exact scope (blast radius) of required updates, reducing uncertainty and manual investigation
- Plan and execute targeted rollouts or forced updates, minimizing disruption and ensuring compliance
- Maintain a clear audit trail of changes and updates across the platform

By leveraging these capabilities, the Platform Orchestrator ensures that updates can be rolled out in a controlled and transparent manner, reducing the risk of widespread outages and enabling rapid incident response. This approach eliminates the need for manual repository checks or guesswork, providing a single source of truth for infrastructure state and change management.

## References

- [Platform Orchestrator Documentation](https://docs.stellwerk.dev)
- [Platform Orchestrator Terraform Modules](https://github.com/stellwerk-tf-modules)

<!-- BEGIN_TF_DOCS -->

<!-- END_TF_DOCS -->