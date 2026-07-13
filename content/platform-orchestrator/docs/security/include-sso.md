---
title: "Single Sign-On (SSO)"
description: "Configuring Single Sign-On (SSO)"
draft: true # This page is made for being included in other pages, not standalone
---

Single Sign-On (SSO) allows users to authenticate using their organization's existing identity provider (IdP). The self-hosted installation includes Keycloak, which supports brokering external OpenID Connect and SAML identity providers.

### Configure SSO

An installation administrator configures identity providers in the Keycloak administration console for the `platform-orchestrator` realm. Refer to the [Keycloak identity brokering documentation](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker) for the provider-specific setup.

### Signing in

Open your Platform Orchestrator console, select **SSO Login**, and enter your organization ID.

{{< alert context="info" >}}
When signing in via SSO for the first time, a user is assigned with [Viewer role]({{< relref "/platform-orchestrator/docs/security/rbac/#built-in-roles" >}}) automatically, but it can be changed by your organization's Admins.
{{< /alert >}}
