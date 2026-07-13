---
title: Rightsizing for cost control
description: The Platform Orchestrator can assist in rightsizing infrastructure resources by applying more cost efficient configurations.
draft: false
type: docs
weight: 1
toc: true
---

The Platform Orchestrator can assist in rightsizing infrastructure resources by applying more cost efficient configurations.

> ℹ️ **Note**
>
> This use case is planned but not implemented yet.

Organizations often encounter situations where infrastructure resources, such as databases, are over-provisioned relative to their actual workload requirements. This leads to unnecessary operational costs and inefficient resource utilization. The Stellwerk Platform Orchestrator addresses this challenge by providing a centralized, rule-based orchestration layer that enables proactive rightsizing of resources for optimal cost control.

Once underutilized or oversized resources are identified, teams can adjust resource parameters such as changing the size class of a database directly within the deployment manifest. The Orchestrator then enforces these changes across all relevant environments through the regular deployment cadence, ensuring that the updated configuration is applied consistently and securely.

This dynamic configuration management approach not only streamlines the process of rightsizing resources but also enforces organizational standards and policies. By automating the rollout of configuration changes, the Orchestrator helps organizations maintain lean resource allocation, reduce costs, and prevent resource sprawl, all while maintaining compliance and operational efficiency. The ability to audit changes and track deployment history further supports governance and transparency in resource management.

## References

- [Platform Orchestrator Documentation](https://docs.stellwerk.dev/platform-orchestrator/)
- [Platform Orchestrator Terraform Modules](https://github.com/stellwerk-tf-modules)

<!-- BEGIN_TF_DOCS -->

<!-- END_TF_DOCS -->
