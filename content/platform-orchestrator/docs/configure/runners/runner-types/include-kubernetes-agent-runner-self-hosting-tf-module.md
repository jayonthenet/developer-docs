---
title: "Common kubernetes-agent runner snippet on TF module for self hosting"
description: "Common kubernetes-agent runner snippet on TF module for self hosting"
draft: true # This page is made for being included in other pages, not standalone
---

Visit the [module documentation](https://github.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner) to see further configuration options and available releases.

Apply the HTTPS gateway endpoint and key paths to the module. Use the
optional source, chart, and image overrides only when using private mirrors:

```hcl
module "kubernetes_agent_runner" {
  # Use an internally hosted registry for the TF module. Append "?ref=vX.Y.Z" to pin a specific release
  source = "mygitservice.example.com/stellwerk-tf-modules/kubernetes-agent-orchestrator-runner"
  #
  # Existing properties ...
  #
  ###
  # Parameters for this installation
  # Remove those that do not apply
  ###
  # Use an internally hosted Helm chart registry
  kubernetes_agent_runner_chart_repository = local.kubernetes_agent_runner_chart_repository
  kubernetes_agent_runner_chart_version    = local.kubernetes_agent_runner_chart_version
  #
  # Public key is registered; the module mounts the private key in the agent
  public_key_path  = "./runner_public_key.pem"
  private_key_path = "./runner_private_key.pem"
  gateway_url      = local.gateway_url
  #
  # Use an internally hosted image registry
  kubernetes_agent_runner_image_repository = local.kubernetes_agent_runner_image_repository
  kubernetes_agent_runner_image_tag        = local.kubernetes_agent_runner_image_tag
  pod_template = jsonencode({
    metadata = {
      labels = {
        "app.kubernetes.io/name"    = "platform-orchestrator-runner"
        "app.kubernetes.io/version" = local.kubernetes_agent_runner_image_tag
      }
    }
    spec = {
      containers = [
        {
          name            = "main" # Use this exact value
          image           = "${local.kubernetes_agent_runner_image_repository}:${local.kubernetes_agent_runner_image_tag}"
          imagePullPolicy = "IfNotPresent"
        }
      ]
      # If your registry requires authentication, configure and reference an image pull secret
      # Otherwise remove the imagePullSecrets property
      imagePullSecrets = [
        {
          name = "regcred"
        }
      ]
    }
  })
}
```
