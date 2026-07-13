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

To access the Platform Orchestrator console, users authenticate through the Keycloak instance deployed with their installation.

{{< alert context="info" >}}
If your identity provider email changes, your email will be updated in the Orchestrator as well on your next log in.
{{< /alert >}}

### Identity providers

Installation administrators manage local users and identity-provider connections in Keycloak. Keycloak can also broker external OpenID Connect and SAML identity providers.

## Authentication in the CLI

{{< include "/platform-orchestrator/docs/security/include-cli-authentication.md" >}}

## Single Sign-On (SSO)

{{< include "/platform-orchestrator/docs/security/include-sso.md" >}}
