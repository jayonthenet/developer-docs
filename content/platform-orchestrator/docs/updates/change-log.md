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

This document provides regular updates on changes to the [Platform Orchestrator]({{< relref "../what-is-the-platform-orchestrator/overview.md" >}}).

## March 27, 2026

- **New:** Added resource graphs for plan-only and historical deployments in the Orchestrator console.
- **New:** Added context and references in our documentation for our [public Terraform/OpenTofu modules]({{< relref "../integrations/public-tf-modules.md" >}}), a collection of configuration and module sources that you can use to set up your cloud estate in the Orchestrator.

## March 13, 2026

- **New:** Added data on Identity Provider to membership information in the API and web UI.
- **New:** Added documentation for running the [`kubernetes-agent` in your AKS cluster]({{< relref "../configure/runners/runner-types/kubernetes-agent.md#aks-specific-setup" >}}).
- **Improved:** Fixed a number of minor bugs.

## February 26, 2026

- **New:** Added documentation for how to configure [Google Cloud Storage (GCS)]({{< relref "../configure/runners/state-storage-types/gcs.md" >}}) and [Azure Blob Storage]({{< relref "../configure/runners/state-storage-types/azurerm.md" >}}) as the default state storage mechanism for Platform Orchestrator runners.
- **New:** Added documentation for [how to use `kubernetes-agent` when self-hosting]({{< relref "../configure/runners/runner-types/kubernetes-agent.md#self-hosting-requirements" >}}) the Platform Orchestrator.
- **Improved:** Added support for Azure in our [Get Started tutorial]({{< relref "../tutorial/get-started.md" >}}).
- **Improved:** Rebuilt how we display messages generated on the web application when a deployment encounters an error.
- **Improved:** Fixed a number of minor bugs.

#### Latest Terraform / OpenTofu providers:
- [`humanitec/platform-orchestrator` Terraform provider 2.13.0](https://registry.terraform.io/providers/humanitec/platform-orchestrator/2.13.0)
- [`humanitec/platform-orchestrator` OpenTofu provider 2.13.0](https://search.opentofu.org/provider/humanitec/platform-orchestrator/v2.13.0)


## January 23, 2026

- **New:** Added support for [scoped permissions in role-based access control (RBAC)]({{< relref "../security/rbac.md#scopes" >}})
- **New:** Added support for [self placeholders]({{< relref "/platform-orchestrator/docs/reference/placeholder-expressions#self-placeholders" >}}) for passing current resource outputs to co-provisioned resources
- **Improved:** The [Get started tutorial]({{< relref "/platform-orchestrator/docs/tutorial/get-started" >}}) now has lower tooling prerequisites due to an improved backing code structure

## January 9, 2026
- **New:** Added support for [using custom images on serverless ECS runners]({{< relref "../configure/runners/runner-types/serverless-ecs.md#using-custom-container-images" >}}).
- **Improved:** Added more specificity and clarity in messages generated when the runner encounters an error.
- **Improved:** Fixed a number of minor bugs.

## December 12, 2025
- **New:** Documentation released with specifics on the [resource graph]({{< relref "../deploy/resource-graph.md" >}}).
- **New:** Documentation released for self-hosting the [Platform Orchestrator]({{< relref "../architecture/self-hosting.md" >}}).
- **New:** Documentation released for [integration scenarios]({{< relref "/platform-orchestrator/docs/integrations/integrating-with-your-estate/overview" >}}) with the customer tooling landscape.
- **Improved:** Streamlined the process to accept an invitation to an organization.
- **Improved:** Fixed a number of minor bugs.

## November 28, 2025
- **Improved:** Documentation released for the [kubernetes-agent runner type]({{< relref "../configure/runners/runner-types/kubernetes-agent.md" >}})
- **Improved:** Documentation released for [network connectivity]({{< relref "/platform-orchestrator/docs/security/connectivity" >}}) requirements
- **Improved:** Inline module definitions character limit has increased 5x from 2k to 10k. This allows much more useful inline modules, although repo based sources are still preferable for testing and sharing.
- **Improved:** Runner rules are now evaluated on first deployment, not on environment creation. This allows you to create an environment without having a runner, and also improves Terraform ordering and decoupling.
- **New:** The command-line interface has a new command, `octl rollback`. See our [Rollbacks documentation]({{< relref "../deploy/rollbacks.md" >}}) for details and examples.
- **Improved:** `octl` will now warn if a module or runner rule references a nonexistent project or environment. It also now offers to delete rules referenced when deleting a project or environment.
- **New:** A new sub-command, `octl get tf`, returns the OpenTofu source that was generated internally and applied as part of a deployment. It is intended to support debugging failed deployments, as well as understanding deployments' logs. Check out our [Deployments documentation]({{< relref "../deploy/deployments.md#viewing-the-generated-tf-code" >}}) for details and example usage.
- **New:** Added support for Sign in with Microsoft.
- **New:** Added support for [single sign-on (SSO)]({{< relref "../security/authentication.md#single-sign-on-sso" >}}) via SAML/OIDC.
- **New**: The [`humanitec-tf-modules` GitHub organization](https://github.com/humanitec-tf-modules) provides new modules to [provision score-workload resources on Kubernetes](https://github.com/humanitec-tf-modules/score-workload-kubernetes), and a [reusable module to set up an ECS runner for the Platform Orchestrator](https://github.com/humanitec-tf-modules/serverless-ecs-orchestrator-runner).
- **New**: A collection of [Platform Orchestrator Use Cases](https://github.com/Platform-Orchestrator/platform-orchestrator-use-cases) are now available, as well.

#### Latest Terraform / OpenTofu providers:
- [`humanitec/platform-orchestrator` Terraform provider 2.10.2](https://registry.terraform.io/providers/humanitec/platform-orchestrator/2.10.2)
- [`humanitec/platform-orchestrator` OpenTofu provider 2.10.2](https://search.opentofu.org/provider/humanitec/platform-orchestrator/v2.10.2)

**Note:** Changes prior to November 2025 are not documented in this change log.
