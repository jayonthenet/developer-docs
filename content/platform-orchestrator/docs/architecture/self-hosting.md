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

The installation is based on [Helm](https://helm.sh) charts bundled via [Helmfile](https://github.com/helmfile/helmfile).

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
- [Helmfile](https://github.com/helmfile/helmfile)
- [Helm Diff](https://github.com/databus23/helm-diff)
- `kubectl` with cluster admin access

<!-- This part is auto-generated -->
<!-- BEGIN_HELM_README -->

## Platform Orchestrator Helm Charts

Helm charts to install and operate Platform Orchestrator in Kubernetes.

## Charts

All releases are managed via [Helmfile](helmfile.yaml.gotmpl). The main chart
is `platform-orchestrator`; the others are prerequisites (operators, CRDs, and
infrastructure) that it depends on.

| Release | Chart | Type | Description |
|---------|-------|------|-------------|
| `envoy-gateway` | `oci://docker.io/envoyproxy/gateway-helm` | External | Envoy Gateway controller |
| `gatewayclass` | [charts/gatewayclass](charts/gatewayclass) | Local | GatewayClass resource for Envoy Gateway |
| `cnpg` | `cnpg/cloudnative-pg` | External | CloudNativePG operator for PostgreSQL |
| `seaweedfs-operator` | `seaweedfs-operator/seaweedfs-operator` | External | SeaweedFS operator |
| `cert-manager` | `oci://quay.io/jetstack/charts/cert-manager` | External | TLS certificate management |
| `rabbitmq-cluster-operator` | [charts/rabbitmq-cluster-operator](charts/rabbitmq-cluster-operator) | Local | RabbitMQ Cluster Operator |
| `spicedb-operator` | [charts/spicedb-operator](charts/spicedb-operator) | Local | SpiceDB operator |
| `keycloak-operator` | [charts/keycloak-operator](charts/keycloak-operator) | Local | Keycloak operator |
| `vault` | `vault/vault` | External | HashiCorp Vault |
| `cluster-issuer` | [charts/cluster-issuer](charts/cluster-issuer) | Local | cert-manager ClusterIssuer resource |
| `opentelemetry-operator` | `opentelemetry-operator/opentelemetry-operator` | External | OpenTelemetry operator |
| `opentelemetry` | [charts/opentelemetry](charts/opentelemetry) | Local | OpenTelemetry Collector configuration |
| **`platform-orchestrator`** | [**charts/platform-orchestrator**](charts/platform-orchestrator) | **Local** | **Platform Orchestrator and its dependencies** ([values reference](charts/platform-orchestrator/README.md)) |

Each release can be toggled on/off via the helmfile environment state values (e.g., `installEnvoyGateway`, `installPostgres`, etc.).

## Installation in the KinD cluster

Create `test-credentials.json` file containing GCP credentials with permissions to pull Platform Orchestrator images from GCR.

Run:
```bash
make create-kind
make deploy-local
make add-certs-macos # for MacOS, for other OSes see how to trust self-hosted certs there
```
OR (which is the same):
```bash
make setup-local
````

Add the following to `/etc/hosts`:
```
127.0.0.1 console.local.humanitec.dev
127.0.0.1 api.local.humanitec.dev
127.0.0.1 keycloak.local.humanitec.dev
```

## Installation in a random cluster with default values

Important: you need to switch your kubectl context to the correct cluster before running this command!

### Configure image registry

Workaround for now: create `test-credentials.json` file containing GCP credentials with permissions to pull Platform Orchestrator images from GCR and run `bash scripts/create-gcr-secret.sh` to create a namespace registry secrets in your cluster.

TODO: configure local registry, provide a way to copy required images and charts to this registry, configure helmfile / helm charts to use this registry.

### Install Platform Orchestrator

```bash
make deploy
```

## Organization and user management

### Create organizations with admin API

Get superuser token:
```bash
export SUPERUSER_TOKEN=$(kubectl get secret platform-orchestrator-secrets -n platform-orchestrator -o jsonpath='{.data.superUserToken}' | base64 --decode)
```

List all organizations:
```bash
export API_URL=https://api.local.humanitec.dev
curl -k -H "Authorization: Bearer ${SUPERUSER_TOKEN}" ${API_URL}/admin/orgs
```

Create new organization:
```bash
curl -k -XPOST \
	 -H "Content-Type: application/json" -H "Authorization: Bearer ${SUPERUSER_TOKEN}" \
	 -d '{"id":"my-org"}' \
	 ${API_URL}/admin/orgs
```

### User management with Keycloak

- Get Keycloak admin credentials:
```bash
make print-keycloak-admin
```
- Login to https://keycloak.local.humanitec.dev/
- Switch realm from `master` to `platform-orchestrator` (the realm is created with the helm installation, you can customize its name with helm values)
- Add a new user under Users and set a password
- Go to https://console.local.humanitec.dev/ and click on SSO Login
- Put in your org name

## Smoke Tests

The `test/` directory contains a smoke test that provisions a minimal Platform Orchestrator setup (project, environment, runner, module) and triggers a deployment to validate the full pipeline end-to-end.

### Prerequisites

- [`terraform`](https://developer.hashicorp.com/terraform/install) installed
- [`octl`](https://docs.humanitec.com/getting-started/cli) installed and authenticated
- `kubectl` configured and pointing at the target cluster (used to pull cluster credentials)
- Platform Orchestrator deployed and accessible

### Setup

```bash
cd test/
terraform init
terraform apply
```

> **Note:** All variable defaults are pre-configured for the local KinD cluster set up via `make setup-local`. No variable overrides are needed when running against that cluster.

This provisions:
- A Humanitec project, environment, and environment type
- A Kubernetes runner registered with Platform Orchestrator
- A test resource type, module, and module rule

### Run the test

```bash
cd test/
bash run-test.sh
```

This deploys `manifest.yaml` using `octl`, which triggers the runner to execute the test module and verify the pipeline is working end-to-end.

### Teardown

```bash
cd test/
terraform destroy
```

<!-- END_HELM_README -->
