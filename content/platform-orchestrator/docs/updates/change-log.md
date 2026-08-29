---
title: "Change Log"
description: ""
lead: ""
draft: false
type: docs
weight: 1
aliases:
- /updates/change-log
---

This change log starts with the open source publication of the Platform Orchestrator ecosystem.

## August 29, 2026

- **New:** Released
  [`platform-orchestrator-cli v1.2.0`](https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/tag/v1.2.0)
  with role and permission discovery, SCIM group-mapping administration,
  service-user creation and credential rotation, and metadata-key lifecycle
  commands.
- **New:** Released
  [`terraform-provider-platform-orchestrator v1.1.0`](https://github.com/stellwerk-labs/terraform-provider-platform-orchestrator/releases/tag/v1.1.0)
  with resources for configurable roles, SCIM group mappings, and metadata
  keys, plus data sources for roles, permissions, mappings, and metadata-key
  inventories.
- **API:** Released IAM
  [`v2.3.1`](https://github.com/stellwerk-labs/platform-orchestrator-iam/releases/tag/v2.3.1)
  with stable service-user cursor pagination and corrected member pagination,
  preventing skipped rows during automation inventory reads.
- **API:** Released data plane
  [`v3.1.1`](https://github.com/stellwerk-labs/platform-orchestrator-dp/releases/tag/v3.1.1)
  with explicit omission, null, and value semantics for metadata-key updates.
  Terraform can now clear optional constraints without replacing the key.
- **Self-hosted:** Released Platform Orchestrator Helm chart
  [`v0.6.1`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.6.1)
  with IAM `v2.3.1` and data plane `v3.1.1`.
- **Secure:** Updated vulnerable runtime dependencies in the data plane and
  Terraform provider. Reachability analysis found no remaining called
  vulnerable symbols in IAM, data plane, CLI, or provider.
- **Docs:** Added complete CLI examples and Terraform/OpenTofu configuration
  for the new automation surface. Service users remain intentionally excluded
  from Terraform so one-time bearer credentials are not persisted in state.
- **Qualified:** All four repositories passed generation, build, unit,
  integration or acceptance, lint, and hosted CI gates. The final fork images
  also passed complete CLI/API/SCIM and Terraform lifecycle exercises on WX1,
  including cleanup and direct residue checks.

## August 28, 2026

- **New:** Released IAM
  [`v2.3.0`](https://github.com/stellwerk-labs/platform-orchestrator-iam/releases/tag/v2.3.0)
  with organization-scoped SCIM 2.0 user and group provisioning, scoped
  service-user bearer credentials, group-to-role mappings, and provisioning
  audit events.
- **Secure:** SCIM deprovisioning now revokes sessions and device logins, blocks
  SSO and invitation paths from restoring access, preserves access in other
  organizations, and keeps every directory operation tenant-scoped.
- **Compatible:** Added SCIM discovery resources, pagination and filtering,
  case-insensitive PATCH operations, full-resource PUT updates, and the wire
  formats required by common Entra and Authentik provisioning flows.
- **Improved:** Released self-hosted chart
  [`v0.6.0`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.6.0)
  with IAM `v2.3.0` and public routes for the SCIM protocol and group-mapping
  management API.
- **Docs:** Added the [SCIM provisioning guide]({{< relref "/platform-orchestrator/docs/security/scim-provisioning" >}}),
  including worked configurations for
  [Microsoft Entra ID]({{< relref "/platform-orchestrator/docs/security/scim-provisioning-entra" >}})
  and [Authentik]({{< relref "/platform-orchestrator/docs/security/scim-provisioning-authentik" >}}).
- **Qualified:** The final IAM release passed 430 unit tests, 348
  clean-database integration tests, authorization-upgrade coverage, static
  analysis, and vulnerability scanning. The audited image and feature chart
  also completed a SCIM end-to-end exercise on WX1 before release.

## August 25, 2026

- **New:** Released IAM
  [`v2.2.0`](https://github.com/stellwerk-labs/platform-orchestrator-iam/releases/tag/v2.2.0)
  with an authoritative catalog of 34 entity-specific read and write
  permissions. Role create and update requests now reject unknown permission
  identifiers.
- **New:** Released control plane
  [`v2.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-cp/releases/tag/v2.1.0)
  and data plane
  [`v3.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-dp/releases/tag/v3.1.0)
  with granular authorization checks for each supported orchestrator entity.
- **New:** Released console
  [`v1.2.0`](https://github.com/stellwerk-labs/platform-orchestrator-frontend/releases/tag/v1.2.0)
  with a role editor that loads, describes, and groups the permission catalog,
  so operators can build roles without guessing identifiers.
- **API:** Added the permission-catalog endpoint, complete request and response
  examples, valid permission values, role payloads, and end-to-end role and
  service-user workflows to the
  [RBAC guide]({{< relref "/platform-orchestrator/docs/security/rbac" >}})
  and [API specification]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}).
- **Compatible:** Existing built-in and configurable roles keep their previous
  effective access through explicit legacy permission implications. This also
  permits IAM to roll out before the control plane and data plane.
- **Improved:** Released self-hosted chart
  [`v0.5.0`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.5.0)
  with the granular components and the public permission-catalog route.
- **Qualified:** Verified a module-only role returned `403` for project and
  deployment writes on WX1, then completed the installer base, Redis,
  PostgreSQL, independent verification, and teardown scenarios.

## August 21, 2026

- **New:** Added configurable organization roles with explicit permissions,
  while keeping the built-in Admin, Deployer, and Viewer roles immutable.
  Released console
  [`v1.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-frontend/releases/tag/v1.1.0)
  with role listing, creation, editing, and deletion under **Settings → Roles**.
- **API:** Published the complete `listRoles`, `createRole`, `getRole`,
  `updateRole`, and `deleteRole` contract in the
  [API specification]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}#/Role/listRoles).
- **Improved:** Released
  [`platform-orchestrator-cli v1.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/tag/v1.1.0)
  with IAM client bindings generated from the same Casbin RBAC and configurable
  role API contract.
- **Changed:** Released IAM
  [`v2.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-iam/releases/tag/v2.1.0)
  with Casbin authorization evaluated inside IAM and policy data stored in the
  existing IAM PostgreSQL database.
- **Improved:** Added bounded in-process authorization caches and NATS
  invalidation so role and assignment changes propagate across IAM replicas
  without a shared remote authorization service on every request.
- **Simplified:** Released self-hosted chart
  [`v0.4.0`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.4.0),
  removing the SpiceDB workload, operator, endpoint, pre-shared key, and
  separate runtime database dependency.
- **Fixed:** Released qualified chart
  [`v0.4.3`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.4.3)
  with console `v1.1.0`, an application-account-safe NATS bootstrap probe, and
  the runner gateway wired to the documented NATS endpoint. It supersedes the
  intermediate `0.4.1` and `0.4.2` chart revisions.
- **Upgrade:** Chart `0.4.3` automatically migrates qualified IAM `v2.0.1`
  installations from schema 29 to Casbin during an ordinary Helm upgrade. The
  migration is serialized, resumable, verified before readiness, and retains
  the former SpiceDB database for a guarded rollback window. Follow the
  [upgrade procedure](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/blob/main/docs/migrations/spicedb-to-casbin.md)
  before rollout.

## August 11, 2026

- **Breaking:** Standardized runner communication on outbound HTTPS through a
  stateless runner gateway. Runner agents and deployment Jobs no longer receive
  broker endpoints or credentials; JetStream remains the Orchestrator's
  internal durable transport.
- **New:** Added short-lived Ed25519 agent authentication, deployment-scoped Job
  tokens, encrypted portable delivery receipts, separate public and
  cluster-internal gateway endpoints, and multi-replica gateway operation
  without sticky sessions.
- **New:** Added simple, edge, and air-gap deployment modes. Edge installations
  persist results and encrypted logs in an RWX HTTPS outbox during outages.
  Air-gap installations run a protected-side gateway and broker and require a
  separately authorized reverse relay to return results and logs.
- **Changed:** Released runner and data plane `v3.0.0`, Kubernetes runner chart
  `0.3.0`, Kubernetes and ECS runner modules `v4.0.0`, use cases `v3.0.0`, and
  self-hosted chart `v0.3.0` for the gateway architecture.
- **Simplified:** Documented that `kubernetes`, `kubernetes-gke`, and
  `kubernetes-eks` use the same Kubernetes Job executor. Their differences are
  cluster discovery and temporary cloud authentication, not separate runtime
  implementations.

## July 23, 2026

- **Improved:** Migrated GitHub Actions across the Stellwerk Labs and Stellwerk Terraform module repositories from Node 20-backed action releases to Node 24-compatible releases.
- **Improved:** Moved the remaining Terraform module CI callers from the former Humanitec reusable workflows to [`stellwerk-tf-modules/reusable-workflows`](https://github.com/stellwerk-tf-modules/reusable-workflows).
- **Improved:** Enabled Dependabot updates for GitHub Actions in workflow-bearing repositories so future runtime migrations arrive as routine dependency updates.
- **Improved:** Updated the developer documentation build to Node.js 22 LTS while keeping GitHub Actions themselves on their supported Node 24 runtime.

## July 20, 2026

- **New:** Published the shared [`golib`](https://github.com/stellwerk-labs/golib) and [`platform-orchestrator-graph`](https://github.com/stellwerk-labs/platform-orchestrator-graph) source repositories and their `v1.0.0` releases.
- **New:** Published the Platform Orchestrator [`control plane`](https://github.com/stellwerk-labs/platform-orchestrator-cp), [`data plane`](https://github.com/stellwerk-labs/platform-orchestrator-dp), [`frontend`](https://github.com/stellwerk-labs/platform-orchestrator-frontend), [`IAM service`](https://github.com/stellwerk-labs/platform-orchestrator-iam), and [`runner`](https://github.com/stellwerk-labs/platform-orchestrator-runner) source repositories.
- **New:** Published the [`images`](https://github.com/stellwerk-labs/images) catalog and versioned, multi-platform container images for the control plane, data plane, frontend, IAM service, and runner under `ghcr.io/stellwerk-labs`.
- **New:** Released the hardened runner as [`v1.0.3`](https://github.com/stellwerk-labs/platform-orchestrator-runner/releases/tag/v1.0.3); remote mode now requires an explicitly configured endpoint.
- **Improved:** Released the self-hosted Platform Orchestrator Helm chart as [`v0.1.8`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.1.8), with current public Stellwerk images for all five services.
- **New:** Published the Kubernetes agent runner chart `0.1.1` at `oci://ghcr.io/stellwerk-labs/charts/platform-orchestrator-kubernetes-agent-runner`.
- **New:** Published the signed [`stellwerk-labs/platform-orchestrator`](https://search.opentofu.org/provider/stellwerk-labs/platform-orchestrator/latest) provider in the OpenTofu Registry.
- **Improved:** Updated the documentation for a self-hosted-only offering and per-installation OIDC issuers; the guides no longer assume a hosted Stellwerk API or central OIDC service.

## July 13, 2026

- **New:** Published [`module-definition-library v1.0.0`](https://github.com/stellwerk-labs/module-definition-library/releases/tag/v1.0.0) and updated the provider examples to use the public Stellwerk module library.
- **New:** Published [`platform-orchestrator-use-cases v1.0.0`](https://github.com/stellwerk-labs/platform-orchestrator-use-cases/releases/tag/v1.0.0) with validated Terraform and OpenTofu examples.
- **New:** Published the [`platform-orchestrator-helm-chart`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart) source repository and its initial [`v0.1.0`](https://github.com/stellwerk-labs/platform-orchestrator-helm-chart/releases/tag/v0.1.0) release.
- **New:** Released the public Kubernetes agent and serverless ECS runner modules as `v2.0.0` under the [`stellwerk-tf-modules`](https://github.com/stellwerk-tf-modules) organization.
- **New:** Published the migrated [`first-deployment`](https://github.com/stellwerk-labs/first-deployment) repository with validated local, AWS, Google Cloud, and Azure configurations.
- **New:** Published the [`terraform-provider-platform-orchestrator`](https://github.com/stellwerk-labs/terraform-provider-platform-orchestrator) source repository under the `stellwerk-labs` GitHub organization.
- **New:** Released [`terraform-provider-platform-orchestrator` v1.0.0](https://github.com/stellwerk-labs/terraform-provider-platform-orchestrator/releases/tag/v1.0.0) with signed provider archives for Terraform and OpenTofu.
- **Improved:** Released [`terraform-provider-platform-orchestrator v1.0.1`](https://github.com/stellwerk-labs/terraform-provider-platform-orchestrator/releases/tag/v1.0.1) with public module-library examples and signed checksums.
- **New:** Published the [`stellwerk-labs/platform-orchestrator`](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest) provider in the Terraform Registry.
- **New:** Submitted `stellwerk-labs/platform-orchestrator` to the OpenTofu Registry; publication completed on July 20.

## July 10, 2026

- **New:** Published the [`platform-orchestrator-cli`](https://github.com/stellwerk-labs/platform-orchestrator-cli) source repository under the `stellwerk-labs` GitHub organization.
- **New:** Released [`platform-orchestrator-cli` v1.0.0](https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/tag/v1.0.0) with installation archives for Linux, macOS, and Windows.
- **New:** Published the public `octl` container image as [`ghcr.io/stellwerk-labs/octl`](https://github.com/stellwerk-labs/platform-orchestrator-cli/pkgs/container/octl).
- **New:** Published package-manager distribution metadata through [`homebrew-tap`](https://github.com/stellwerk-labs/homebrew-tap) and [`scoop-bucket`](https://github.com/stellwerk-labs/scoop-bucket).

## July 9, 2026

- **New:** Published the supporting [`semantic-release-action`](https://github.com/stellwerk-labs/semantic-release-action), [`homebrew-tap`](https://github.com/stellwerk-labs/homebrew-tap), and [`scoop-bucket`](https://github.com/stellwerk-labs/scoop-bucket) repositories under the `stellwerk-labs` GitHub organization.
