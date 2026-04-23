---
title: "Private module sources"
description: 'The Platform Orchestrator supports mechanisms to fetch module source code from private registries and Git repositories.'
lead: ""
draft: false
type: docs
weight: 6
toc: true
mermaid: true
aliases:
- /new-orchestrator/docs/configure/modules/private-module-sources
---

{{% description %}}

Without specific configuration, your [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) can only fetch module sources that are public and accessible from its network location. For example, if the runner has internet egress, it may use modules from public OpenTofu/Terraform registries and public Git repositories. If the runner only has access to an internal network, then it may fetch module source code that is hosted in the network and does not require additional credentials.

However, most organizations will wish to access module source code that is private and requires credentials to access.

## Private OpenTofu/Terraform registries

If your organization hosts its module source code within a private registry, you may use [Environment Variable Credentials](https://opentofu.org/docs/cli/config/config-file/#environment-variable-credentials) to specify the credential used to access the registry. These variables have a name that follows the pattern `TF_TOKEN_<hostname>` where the registry hostname has all dots replaced with underscores. For example, when accessing modules registered in the `app.terraform.io` registry, the variable name will appear as `TF_TOKEN_app_terraform_io`.

These variables can be set in your [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) configuration. For security reasons, you should [set this securely](#setting-sensitive-runner-environment-variables).

## Private Git repositories using SSH

If you wish to use module source code from a private Git repository using the [SSH protocol]({{< relref "/platform-orchestrator/docs/configure/modules/overview/#git-sources" >}}) you can install SSH keys into the runner to allow it to fetch this content.

In your Git provider, create a scoped SSH key that has read-only access to the specific repositories you wish to use. For example, in GitHub, you may do this with an [SSH deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#set-up-deploy-keys) or other similarly scoped user.

While you can manually mount the private key into the runner, and modify the `GIT_SSH_COMMAND` environment variable to point to it, the Platform Orchestrator provides a convenience feature in the runner via the `RUNNER_GIT_SSH_KEYS` environment variable. When you set `RUNNER_GIT_SSH_KEYS` to a new-line separated list of private SSH keys, the runner will detect these and automatically expose them securely to the OpenTofu/Terraform sub process.

For example, setting `RUNNER_GIT_SSH_KEYS` to the following will make two SSH keys available to the runner.

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAKKaPTl/x7Egy6FLEu7UPEq0T5cyIk4iglMrkZC3dGxwAAAKgSqqwSEqqs
EgAAAAtzc2gtZWQyNTUxOQAAACAKKaPTl/x7Egy6FLEu7UPEq0T5cyIk4iglMrkZC3dGxw
AAAEDwMcbXfbyvwyIwmMenC+NWpR6K9WTdWA6ZrHhXUbQ2Jgopo9OX/HsSDLoUsS7tQ8Sr
RPlzIiTiKCUyuRkLd0bHAAAAImJtZWllckBCZW5qYW1pbnMtTWFjQm9vay1Qcm8ubG9jYW
wBAgM=
-----END OPENSSH PRIVATE KEY-----
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIKQXkZfN1OgzS+a6Vrc9CTy4yeN9RZ/5svLt5CCKc4KAoAoGCCqGSM49
AwEHoUQDQgAE9RmC8JEc3ybe255WBqZyx9xXRFqvnTsAlqmIHQ/urDqDcB7GhBH0
u/A0IhY3igRxMd1V4G/wLLdsunwvyE+z8Q==
-----END EC PRIVATE KEY-----
```

As with private registry tokens, you should [set this securely](#setting-sensitive-runner-environment-variables).

This mechanism supports RSA, DSA, ECDSA, and Ed25519 private keys in PKCS#1, PKCS#8, OpenSSL, and OpenSSH formats. The keys must be unencrypted without passphrases.

## Private Git repositories using HTTP/HTTPS

Private Git modules using an [HTTP protocol]({{< relref "/platform-orchestrator/docs/configure/modules/overview/#git-sources" >}}) require a username and password combination accessible by the Git processes within the runner. You can read more about this in the [Git documentation](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage). The Platform Orchestrator does not provide any special utilities to configure this.

For example, if you wish to use the token `ghp_1234567890abcdefghijklmnopqrstuv` for all access to `github.com` repositories. You can configure the following environment variables in your runner:

- `GIT_CONFIG_COUNT=1`
- `GIT_CONFIG_KEY_0=url.https://ghp_1234567890abcdefghijklmnopqrstuv@github.com/.insteadOf` (This one contains a sensitive value, so you should [set this securely](#setting-sensitive-runner-environment-variables))
- `GIT_CONFIG_VALUE_0=https://github.com/`

## Setting sensitive runner environment variables

{{< include "/platform-orchestrator/docs/configure/runners/include-runner-secret-variables.md" >}}
