---
title: "Self-hosting"
description: 'You may self-host the Platform Orchestrator on your own infrastructure instead of using the SaaS version.'
lead: ""
draft: false
type: docs
weight: 10
toc: true
---

{{% description %}}

While the SaaS version of the Orchestrator is fully managed by us, a self-hosted installation will be managed by you. The hosting infrastructure may be located anywhere, including in your own data center ("on premise"), a shared hosting facility, or in your account with a public cloud provider.

Since you also manage the data storage, the self-hosted setup enables data sovereignty.

A fully air-gapped setup without internet ingress or egress is supported. Refer to the detailed requirements below.

## Prerequisites

Infrastructure:

- Kubernetes cluster
- PostgreSQL database (v17+)
  - Or use the optional in-cluster PostgreSQL as part of the [installation](#installation) package (not recommended for production use)
- DNS and TLS certificates for the domains of the Orchestrator console and the API endpoint

For air-gapped environments, in addition to the above:

- Internal container registry (OCI-compatible)
- Ability to [mirror Terraform providers](https://developer.hashicorp.com/terraform/internals/provider-network-mirror-protocol)

Tools:

- [Helm](https://helm.sh) (3+)
- `kubectl` with cluster admin access

## Installation

We are working to provide a detailed installation and upgrade manual. Contact our support at [support@humanitec.com](mailto:support@humanitec.com) in the meantime. These are the general installation steps:

### Air-gapped specifics

- Copy container images and Helm chart to your internal OCI registry
- Configure the Terraform provider mirror for `humanitec/platform-orchestrator`
- Use an internal CA for TLS certificates

### Installation steps

- Prepare the PostgreSQL: create databases for Orchestrator, SpiceDB, and Keycloak
- Configure DNS & TLS: point your domains to the cluster ingress
- Create Helm `values.yaml`: configure domains, database connections, and optional IdP integration (LDAP/Okta/etc.)

Install the Orchestrator Helm chart:

```bash
helm install platform-orchestrator humanitec/platform-orchestrator \
  --namespace humanitec-orchestrator \
  --values values.yaml
```

The Orchestrator Helm chart includes:

- Orchestrator core services (control plane, data plane, IAM, frontend)
- Envoy Gateway as Kubernetes Gateway API implementation (optional, but not all implementations are supported)
- PostgreSQL database (optional)
- Keycloak identity provider for authentication (optional)
- RabbitMQ message queue (optional)
- SpiceDB authorization engine (optional)
- Vault secrets management (optional)

ALl optional components must be provided externally if not installed via Helm.
