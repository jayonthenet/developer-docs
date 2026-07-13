---
title: Infrastructure drift detection
description: The Platform Orchestrator can remediate infrastructure drift by detecting resources having drift and re-aligning them with the desired state through a re-deployment.
draft: false
type: docs
weight: 1
toc: true
---

The Platform Orchestrator can remediate infrastructure drift by detecting resources having drift and re-aligning them with the desired state through a re-deployment.

> ℹ️ **Note**
> 
> While we are preparing the full use case implementation, you can already see the Platform Orchestrator in action with your own technology stack. [Book a session with us here](https://stellwerk.dev).

Infrastructure drift occurs when the actual state of infrastructure resources diverges from the intended, declared configuration. This can result from manual changes, failed deployments, or external modifications. The Stellwerk Platform Orchestrator is being developed to provide drift detection capabilities that continuously monitor infrastructure and help alert platform teams when such divergence is detected.

Drift identified by the Orchestrator can be surfaced in the tool of your choice so you can notify teams, enabling them to quickly assess and remediate the issue. Remediation can be performed by re-deploying the environment, which realigns the actual state with the approved configuration. This approach helps maintain consistency and reliability across environments, and serves as a critical security feature by detecting unauthorized changes that could introduce vulnerabilities or compliance violations.

The Orchestrator’s drift detection ensures that infrastructure remains aligned with organizational standards and policies, supporting operational efficiency and security objectives. Teams can remediate drift rapidly, ensuring their infrastructure stays consistent with the declared configuration through a simple re-deployment process.

## References

- [Platform Orchestrator Documentation](https://docs.stellwerk.dev)
- [Platform Orchestrator Terraform Modules](https://github.com/stellwerk-tf-modules)

<!-- BEGIN_TF_DOCS -->

<!-- END_TF_DOCS -->