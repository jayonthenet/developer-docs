---
title: "Authentication"
description: "How to authenticate to Platform Orchestrator Console and CLI"
lead: ""
draft: false
type: docs
weight: 10
toc: true
aliases:
- /new-orchestrator/security/authentication
---

## Authentication in the console

To access the [Platform Orchestrator Console](https://console.humanitec.dev), users must authenticate using an identity provider.

{{< alert context="info" >}}
If your identity provider email changes, your email will be updated in the Orchestrator as well on your next log in.
{{< /alert >}}

### Supported identity providers

- <img src="/images/google_cloud.png" alt="Google Cloud logo" width="16rem"/> Google
- <img src="/images/microsoft-logo.svg" alt="Microsoft logo" width="16rem"/> Microsoft (personal or work account) 🆕
- [Single Sign-On (SSO)](#single-sign-on-sso) 🆕

<img src="/images/signup-page.png" alt="Sign up page" width="400rem"/>

## Authentication in the CLI

{{< include "/platform-orchestrator/docs/security/include-cli-authentication.md" >}}

## Single Sign-On (SSO)

{{< include "/platform-orchestrator/docs/security/include-sso.md" >}}
