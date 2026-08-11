---
title: "Self-hosting"
description: 'Install and operate the Platform Orchestrator in your own infrastructure.'
lead: ""
draft: false
type: docs
weight: 10
toc: true
---

{{% description %}}

The Platform Orchestrator is currently offered as self-hosted software. You manage the installation and its infrastructure in your own data center ("on premise"), a shared hosting facility, or your account with a public cloud provider.

The installation is based on [Helm](https://helm.sh) charts bundled via [Helmfile](https://github.com/helmfile/helmfile).

Since you also manage the data storage, the self-hosted setup enables data sovereignty.

An air-gapped runner design without internet ingress or egress is included for
runner types that do not depend on a public OIDC issuer. It is not
production-qualified in release `0.2.0`; refer to the limitations below.

## Prerequisites

Infrastructure:

- Kubernetes cluster
- PostgreSQL database (v17+)
  - Or use the optional in-cluster PostgreSQL as part of the [installation](#installation) package (not recommended for production use)
- NATS JetStream, either installed by chart `0.2.0` or provided as an external
  service
- DNS and TLS certificates for the domains of the Orchestrator console and API endpoint
- Optional: a dedicated public DNS name and publicly trusted TLS certificate for the per-install OIDC issuer when using AWS or Google Cloud identity federation

For planned air-gapped environments, in addition to the above:

- Internal container registry (OCI-compatible)
- Ability to [mirror Terraform providers](https://developer.hashicorp.com/terraform/internals/provider-network-mirror-protocol)

Air-gapped installations cannot use runner types that require AWS or Google Cloud to retrieve public OIDC discovery and signing-key documents. Other runner types remain available.

The NATS air-gap relay is included in runner `v2.0.0`, but it has not been
qualified with a physical diode. Do not treat that path as production-validated
until it has passed acceptance tests with the selected device.

## Messaging and runner connectivity

Chart `0.2.0` uses NATS JetStream for service events, runner commands, results,
and encrypted log references. Runner commands are buffered centrally while an
edge runner is disconnected. Edge runner results and logs use a persistent
outbound spool; multi-node clusters require `ReadWriteMany` storage.

The bundled NATS service is cluster-local and uses a plaintext listener by
default. Remote Kubernetes and ECS runners need an operator-provided,
externally reachable TLS NATS endpoint. Operators can use an external NATS
service or securely expose and add TLS to the bundled service; chart `0.2.0`
does not create that external endpoint or its certificates. Do not expose the
bundled plaintext listener outside the installation cluster.

The chart-generated shared token is acceptable only for local bootstrap.
Production installations need per-service and per-runner subject-scoped
credentials plus issuance, rotation, revocation, and emergency-recovery
procedures before remote runners are connected.

Tools:

- [Helm](https://helm.sh) (3+)
- [Helmfile](https://github.com/helmfile/helmfile)
- [Helm Diff](https://github.com/databus23/helm-diff)
- `kubectl` with cluster admin access

## Optional OIDC issuer

The data plane includes an optional OIDC issuer for authenticating runners to AWS and Google Cloud without long-lived cloud credentials. It is disabled unless `data-plane.config.OIDC_ISSUER_URL` is set.

To enable it, configure a dedicated hostname under `global.gatewayApi.oidc.hostname`, terminate it with publicly trusted TLS, and set `data-plane.config.OIDC_ISSUER_URL` to the exact public URL, for example `https://oidc.orchestrator.example.com`. The cloud identity service must be able to retrieve these endpoints:

- `/.well-known/openid-configuration`
- `/.well-known/jwks`

The issuer belongs to this installation. Stellwerk does not operate a shared OIDC issuer.

<!-- This part is auto-generated -->
<!-- BEGIN_HELM_README -->

## Platform Orchestrator Helm Charts

Helm charts to install and operate Platform Orchestrator in Kubernetes.

Chart `0.2.0` is the breaking NATS transport release. Read the
[`v0.2.0` release notes](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.2.0) before upgrading; mixed `v1`
and `v2` backend or runner images are unsupported.

## Charts

All releases are managed via [Helmfile](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/blob/main/helmfile.yaml.gotmpl). The main chart
is `platform-orchestrator`; the others are prerequisites (operators, CRDs, and
infrastructure) that it depends on.

| Release | Chart | Type | Description |
|---------|-------|------|-------------|
| `envoy-gateway` | `oci://docker.io/envoyproxy/gateway-helm` | External | Envoy Gateway controller |
| `gatewayclass` | [charts/gatewayclass](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/gatewayclass) | Local | GatewayClass resource for Envoy Gateway |
| `cnpg` | `cnpg/cloudnative-pg` | External | CloudNativePG operator for PostgreSQL |
| `cert-manager` | `oci://quay.io/jetstack/charts/cert-manager` | External | TLS certificate management |
| `spicedb-operator` | [charts/spicedb-operator](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/spicedb-operator) | Local | SpiceDB operator |
| `keycloak-operator` | [charts/keycloak-operator](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/keycloak-operator) | Local | Keycloak operator |
| `openbao` | `openbao/openbao` | External | OpenBao (Vault-compatible secret store) |
| `cluster-issuer` | [charts/cluster-issuer](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/cluster-issuer) | Local | cert-manager ClusterIssuer resource |
| `opentelemetry-operator` | `opentelemetry-operator/opentelemetry-operator` | External | OpenTelemetry operator |
| `opentelemetry` | [charts/opentelemetry](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/opentelemetry) | Local | OpenTelemetry Collector configuration |
| **`platform-orchestrator`** | [**charts/platform-orchestrator**](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/tree/main/charts/platform-orchestrator) | **Local** | **Platform Orchestrator and its dependencies** ([values reference](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/blob/main/charts/platform-orchestrator/README.md)) |

Each release can be toggled on/off via the helmfile environment state values (e.g., `installEnvoyGateway`, `installPostgres`, etc.).

## Installation in the KinD cluster

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

Add your domains to `/etc/hosts`, e.g.:
```
127.0.0.1 api.example.com
127.0.0.1 console.example.com
127.0.0.1 keycloak.example.com
```
(The domains are configured in `state-values.yaml` in `platformOrchestratorValues.global.[api|console|keycloak].hostname`)

## Installation in a random cluster with default values

Important: you need to switch your kubectl context to the correct cluster before running this command!

### Configure image registry

The default chart values use the public images under `ghcr.io/stellwerk-labs`,
so no registry credentials are required. To use a private mirror, override the
component image repositories and configure `global.imagePullSecrets`.

### Install Platform Orchestrator

```bash
make deploy
```

The chart-generated NATS token is intended for local bootstrap. Before a
production rollout, provision per-service and per-runner subject-scoped NATS
credentials and establish rotation and revocation procedures.

## Releasing the OCI chart

Chart publication is deliberately manual. Updating a component image does not
publish a chart by itself. When a coherent set of image tags is ready, update
the default image tags in `charts/platform-orchestrator/values.yaml`, increment
the chart version in `charts/platform-orchestrator/Chart.yaml`, and commit the
change. Create and push a signed `v<chart-version>` tag on that commit, then run
the **Release Chart** workflow from that tag. The workflow validates the tag and
chart version, lints and packages the chart, pushes it to
`oci://ghcr.io/stellwerk-labs/charts`, and creates the matching GitHub release.

## Organization and user management

### Create organizations with admin API

Get superuser token:
```bash
export SUPERUSER_TOKEN=$(kubectl get secret platform-orchestrator-secrets -n platform-orchestrator -o jsonpath='{.data.superUserToken}' | base64 --decode)
```

List all organizations (take the API URL from `platformOrchestratorValues.global.api.hostname` in `state-values.yaml`):
```bash
export API_URL=https://api.example.com
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
- Login to your Keycloak instance (see the hostname in state-values.yaml, `platformOrchestratorValues.global.keycloak.hostname`), e.g. https://keycloak.example.com/
- Switch realm from `master` to `platform-orchestrator` (the realm is created with the helm installation, you can customize its name with helm values)
- Add a new user under Users and set a password
- Go to Console (see the hostname in state-values.yaml, `platformOrchestratorValues.global.gatewayApi.frontend.hostname`), e.g. https://console.example.com/ and click on SSO Login
- Put in your org name

## Smoke Tests

The `test/` directory contains a smoke test that provisions a minimal Platform Orchestrator setup (project, environment, runner, module) and triggers a deployment to validate the full pipeline end-to-end.

### Prerequisites

- [`terraform`](https://developer.hashicorp.com/terraform/install) installed
- [`octl`](https://docs.stellwerk.dev/platform-orchestrator/docs/integrations/cli/) installed and authenticated
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
- A Platform Orchestrator project, environment, and environment type
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
