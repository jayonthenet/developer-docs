---
title: "Connectivity"
description: "Learn about network connectivity requirements and IP addresses for the Platform Orchestrator."
lead: "Configure network access for the Platform Orchestrator and runners, including required IP addresses and port configurations."
draft: false
type: docs
weight: 1
toc: true
---

Network administrators and platform engineers need to configure connectivity between the Platform Orchestrator and your infrastructure. This page provides the IP addresses and connectivity requirements necessary for firewall rules, network security groups, and other network access controls.

## Orchestrator IPs

### Endpoint IPs

The public endpoint IPs for accessing the Orchestrator are:

- `34.128.156.4`

This IP address resolves to:
- `console.humanitec.dev` - The Orchestrator web console
- `api.humanitec.dev` - The Orchestrator API endpoint

### Source IPs

The Orchestrator initiates connections from the following source IPs:

- `35.198.140.114`
- `35.246.198.96`

Configure your firewall rules to allow traffic from both IP addresses to ensure uninterrupted connectivity.

{{< alert context="info" title="Self-Hosted Deployments" >}}
When [self-hosting]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) the Orchestrator, all IP addresses (both endpoint and source) are assigned and managed by you according to your infrastructure configuration.
{{< /alert >}}

## Runner network requirements

### General connectivity

Runners require network connectivity to all external services they interact with during deployment execution. This includes:

- Cloud provider APIs (AWS, GCP, Azure)
- Kubernetes cluster API servers
- Container registries
- Storage services (S3 buckets, Azure Blob Storage, etc.)
- Any custom APIs or services referenced in your Resource Definitions

For example, a runner deploying to an AWS environment needs network access to the AWS API endpoints for services like EKS, S3, and IAM.

**Runner image registry access**: All runners must have egress access on TCP port 443 to pull the runner container image from its registry. The specific registry depends on your runner configuration. See [runner image]({{< relref "/platform-orchestrator/docs/configure/runners/overview#runner-image" >}}) for details.

{{< include "/platform-orchestrator/docs/configure/runners/include-runner-agent.md" >}}

### Direct

For a direct runner, you must configure ingress from the Orchestrator [source IPs](#source-ips) to the target infrastructure where the runner will execute.

For example, a [kubernetes-gke runner]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-gke" >}}) requires ingress access from the Orchestrator source IPs to the GKE cluster's API server (typically on TCP port 443) so the Orchestrator can create runner jobs in the cluster.

### Agent

For an agent runner, you must configure egress from the system hosting the agent component to the Orchestrator [endpoint IPs](#endpoint-ips) on TCP port 443. The agent maintains a persistent, outbound-only connection to the Orchestrator, eliminating the need for inbound firewall rules.

For example, a [kubernetes-agent runner]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-agent" >}}) requires egress access from the cluster nodes (where the agent pod runs) to the Orchestrator endpoint IPs.
