---
title: "Overview"
description: ""
lead: ""
draft: false
type: docs
weight: 100
toc: true
aliases:
- /new-orchestrator
- /new-orchestrator/docs
- /platform-orchestrator/docs
- /platform-orchestrator/docs/what-is-the-new-orchestrator/core-concepts
- /platform-orchestrator
---

The Platform Orchestrator delivers an orchestration layer that standardizes how resources are requested, provisioned, and continuously updated across environments. Resources may include application workloads, infrastructure, or any combination thereof.

The Orchestrator maintains a real-time, queryable resource graph of all infrastructure elements and their relationships, powering automation and self-service via API integrations with any interface (CLI, portals, agents, IDE plug-ins). It seamlessly orchestrates existing IaC based on Terraform or OpenTofu and CI/CD workflows with zero lock-in or required architectural overhaul.

{{% include "/platform-orchestrator/docs/what-is-the-platform-orchestrator/include-tf-only.md" %}}

The Orchestrator is available as a SaaS offering hosted by us or [self-hosted]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) by you.

The Platform Orchestrator is compute and cloud-provider agnostic. While the documentation currently highlights the most common use cases, with more technologies being added over time, the Orchestrator can support a wide range of environments. If you’d like to see it in action with the stack you care about, you can [book a demo with us](https://stellwerk.dev).

## How does the Orchestrator work?

![The Orchestrator overview](/images/platform-orchestrator-overview.png "The Orchestrator overview")

You **configure** the Orchestrator by defining reusable standard modules referencing your Terraform or OpenTofu code. You may also define rules for combining and linking modules. Finally, you set up projects and environments as deployment targets for your dev teams. Platform engineers or organization admins usually own the Orchestrator configuration.

You may then **deploy** workloads, supporting resources, or both, via the Orchestrator using the standardized modules. Developers usually own this process. Dev teams create, build, package, and test workload code just like today. They maintain just a lean additional manifest describing their resource requirements which they can post to the Orchestrator to request a deployment, either locally or from their existing CI/CD pipelines. The Orchestrator will use the configured modules and rules to provision all required resources and create fully functional project environments.

The Orchestrator **integrates** with your existing tooling estate, including CI/CD, observability, and hosting infrastructure. Go to [integrations]({{< relref "/platform-orchestrator/docs/integrations/integrating-with-your-estate/overview" >}}) to see how.

## Key features

_Dynamically generate, update, and deploy app and infrastructure configurations per environment_. The rule-based orchestrator engine combines your modules into a coherent set of resources for each deployment request, picking the right-sized approach according to your rules. Automatically apply your configuration and security standards.

_Declarative workload definition_. Developers use a lean YAML syntax ([manifest]({{< relref "/platform-orchestrator/docs/deploy/manifests" >}})) to describe their workload and its infrastructure resource requirements. There is no need to change your coding, testing, or packaging tools. The Orchestrator lets developers self-serve app and infrastructure deployments by issuing a single CLI command.

_Resource Graph to visualize and explore current and past deployments_. The Orchestrator creates a visual, interactive graph of each project environment showing all resource dependencies and metadata. The Graph is always up to date as it reflects the real structure used by the Orchestrator to perform its deployments. You may explore the Graph to see and grasp your resource structure, perform impact analysis, and govern real-world resources.

_Deploy to any compute_. The Orchestrator will deploy containerized, packaged, or raw code to any compute as long as there is a Terraform provider available for handling the deploy. You may configure your own, private providers or use prebuilt ones.

_Stay in control of sensitive data_. State and secrets never leave your runtime, and any outputs required for using in workload code are end-to-end encrypted.

_Rollback and deployment history tracking_. The Orchestrator stores all past deployment data, giving you both an audit trail of changes as well as rollback capabilities.

The Orchestrator makes it extremely easy to take advantage of all these benefits.

## What the Orchestrator is not

Unlike Terraform or raw automation, there’s no new DSL, complex config, or rebuild required. It does not replace your tools, it orchestrates and connects them into coherent, manageable workflows.

The Orchestrator is not a CI/CD tool. You leave existing pipeline and approval flows in place and only add some lean deployment calls for the Orchestrator integration.

The Orchestrator does not replace your IaC estate. You continue to use existing Terraform or OpenTofu modules and only register them with the Orchestrator to create an end-to-end provisioning automation.
