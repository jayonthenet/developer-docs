---
title: "Connectivity"
description: "Learn about network connectivity requirements for the Platform Orchestrator."
lead: "Configure network access between your Platform Orchestrator installation, runners, and external services."
draft: false
type: docs
weight: 1
toc: true
---

Network administrators and platform engineers need to configure connectivity between the Platform Orchestrator and their infrastructure. Because the Orchestrator is self-hosted, endpoint and source addresses are assigned by your own load balancers, ingress controllers, NAT gateways, and network policies.

## Orchestrator endpoints

Expose the console and API hostnames configured during [installation]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) to the users and systems that need them. Agent and ECS runners outside the installation cluster require outbound access to an operator-provided TLS NATS endpoint, normally on TCP port 4222. The bundled NATS service is cluster-local and plaintext by default; chart `0.2.0` does not expose it externally or provision its TLS certificates.

Direct runners require the data plane to reach the target infrastructure. Use the installation's egress source ranges when target systems use IP allowlists.

There are no shared Stellwerk endpoint or source IP ranges.

### Optional OIDC endpoint

AWS and Google Cloud federation require the cloud identity service to retrieve the per-install OIDC discovery and signing-key documents over HTTPS. Configure public reachability and trusted TLS for the hostname set in `data-plane.config.OIDC_ISSUER_URL`.

The exposed paths are:

- `/.well-known/openid-configuration`
- `/.well-known/jwks`

Installations that do not use OIDC-based AWS or Google Cloud federation can leave this endpoint disabled.

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

For a direct runner, configure ingress from the data plane's egress source ranges to the target infrastructure where the runner will execute.

For example, a [kubernetes-gke runner]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-gke" >}}) requires ingress access from those source ranges to the GKE cluster's API server, typically on TCP port 443, so the Orchestrator can create runner jobs in the cluster.

### Agent

For an agent runner, configure egress from the system hosting the agent
component to the operator-provided TLS NATS endpoint, normally on TCP port
4222. The runner maintains an outbound connection and JetStream buffers
commands while an edge is disconnected, eliminating the need for inbound
firewall rules at the runner cluster.

For example, a [kubernetes-agent runner]({{< relref "/platform-orchestrator/docs/configure/runners/runner-types/kubernetes-agent" >}}) requires egress access from the cluster nodes where the agent pod runs to your NATS endpoint.
