---
title: "Single Sign-On (SSO)"
description: "Configuring Single Sign-On (SSO)"
draft: true # This page is made for being included in other pages, not standalone
---

Single Sign-On (SSO) allows users to authenticate using their organization's existing identity provider (IdP).

The Platform Orchestrator supports SSO through SAML 2.0 and OIDC protocols.

To streamline integration with multiple IdPs, we use [WorkOS](https://workos.com/single-sign-on) as our SSO backend. WorkOS doesn't store any user credentials or information, it serves only as a bridge to your SSO provider.

### Supported Identity Providers

* Okta
* Google
* Microsoft Entra ID (Azure AD)
* Microsoft AD FS
* Auth0
* Keycloak
* OneLogin
* Cloudflare
* Oracle Cloud
* Custom SAML / OIDC
* [Other providers supported by WorkOS](https://workos.com/docs/integrations)

### Using Admin Portal to configure SSO

To enable SSO for your organization, please contact [Support](https://humanitec.com/support). You need to provide your _organization ID_, _domain_ and _the email of the SSO administrator_, who will set up SSO for your organization.

We send you a link to Admin Portal where you can choose your identity provider and follow instructions to configure SSO.

- Choosing your provider:

![SSO Admin Portal](/images/sso-admin-portal-1.png "SSO Admin Portal")

- Instructions and configuration:

![SSO Admin Portal](/images/sso-admin-portal-2.png "SSO Admin Portal")

{{< alert context="info" >}}
Only one SSO provider connection can be configured for an organization.
{{< /alert >}}

### Signing in

Use your organization's SSO sign-in page for authenticating: `https://console.humanitec.dev/sso/<your-org-id>`:

![SSO Sign-In](/images/sso-sign-in.png "SSO Sign-In")

{{< alert context="info" >}}
When signing in via SSO for the first time, a user is assigned with [Viewer role]({{< relref "/platform-orchestrator/docs/security/rbac/#built-in-roles" >}}) automatically, but it can be changed by your organization's Admins.
{{< /alert >}}
