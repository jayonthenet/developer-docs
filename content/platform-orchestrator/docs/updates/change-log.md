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
