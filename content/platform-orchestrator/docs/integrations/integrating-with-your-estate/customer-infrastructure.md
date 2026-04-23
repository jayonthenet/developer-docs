---
title: "Customer infrastructure"
description: "The Platform Orchestrator integrates with customer infrastructure by launching runners and provisioning resources via deployments."
lead: ""
draft: false
type: docs
weight: 40
toc: true
aliases:
- /platform-orchestrator/docs/integrations/customer-infrastructure
---

> Relevant tools: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure, Oracle Cloud Infrastructure (OCI), Alababa Cloud, vmware, private data centers / private clouds, Kubernetes, and others

{{% description %}}

## Integrations overview

{{< include "/platform-orchestrator/docs/integrations/integrating-with-your-estate/include-integrations-overview.md" >}}

{{< integration-diagram "infrastructure" >}}

## Launching runners

{{% description "/platform-orchestrator/docs/configure/runners/overview.md" %}}

Various runner types exist to launch runners on different kinds of infrastructure. Go to [runners]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) to learn more.

## Provisioning resources

{{% description "/platform-orchestrator/docs/deploy/deployments.md" %}}

[Deployments]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}) may provision any kind of resource for which a TF provider exists. You may configure [providers]({{< relref "/platform-orchestrator/docs/configure/providers" >}}) centrally in the Orchestrator to gain the required level of access to your target infrastructure.

{{% description "/platform-orchestrator/docs/configure/providers.md" %}}
