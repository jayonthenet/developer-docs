---
title: "Public TF modules"
description: "We maintain a public collection of TF modules to help you get started more quickly setting up your Orchestrator estate."
lead: ""
draft: false
type: docs
weight: 80
toc: true
---

{{% description %}}

{{< include "content/platform-orchestrator/docs/tutorial/include-terraform-opentofu-tf.md" >}}

We maintain all modules in the [humanitec-tf-modules](https://github.com/humanitec-tf-modules) GitHub organization. We provide them on a best-effort basis.

There are two categories of modules:

- [Orchestrator configuration](#orchestrator-configuration): These modules contain TF code for Orchestrator configuration objects such as [runners]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) or [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}).
- [Module sources](#module-sources): These modules contain TF code for provisionig real world objects. You can use them as the `module_source` in Orchestrator [modules]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}).

## Orchestrator configuration

| Module | About |
| --- | --- |
| [common-resource-types](https://github.com/humanitec-tf-modules/common-resource-types) | A module for provisioning common resource types in the Platform Orchestrator |
| [kubernetes-agent-orchestrator-runner](https://github.com/humanitec-tf-modules/kubernetes-agent-orchestrator-runner) | A module for setting up a Kubernetes agent runner for the Humanitec Platform Orchestrator |
| [serverless-ecs-orchestrator-runner](https://github.com/humanitec-tf-modules/serverless-ecs-orchestrator-runner) | A module for setting up an ECS Runner for the Platform Orchestrator |

## Module sources

| Module | About |
| --- | --- |
| [k8s-namespace-kubernetes](https://github.com/humanitec-tf-modules/k8s-namespace-kubernetes) | Module source for a Kubernetes namespace |
| [k8s-role-kubernetes](https://github.com/humanitec-tf-modules/k8s-role-kubernetes) | Module source for a Kubernetes Role |
| [k8s-service-account-kubernetes](https://github.com/humanitec-tf-modules/k8s-service-account-kubernetes) | Module source for a Kubernetes service account |
| [k8s-workload-kubernetes](https://github.com/humanitec-tf-modules/k8s-workload-kubernetes) | Module source for Kubernetes workload resources |
| [route-kubernetes-http-route](https://github.com/humanitec-tf-modules/route-kubernetes-http-route) | Module source to provision GatewayAPI http routes on Kubernetes |
| [score-cronjob-kubernetes](https://github.com/humanitec-tf-modules/score-cronjob-kubernetes) | Module source to provision score-cronjob resources on a Kubernetes cluster |
| [score-workload-kubernetes](https://github.com/humanitec-tf-modules/score-workload-kubernetes) | Module source to provision score-workload resources on a Kubernetes cluster |
| [serverless-lambda](https://github.com/humanitec-tf-modules/serverless-lambda) | Module source for an AWS Lambda function |
