---
title: "SCIM with Authentik"
description: "Configure an Authentik SCIM provider to provision Platform Orchestrator users and groups."
lead: "Use Authentik as an outbound SCIM client for one Platform Orchestrator organization."
draft: false
type: docs
weight: 42
toc: true
---

Authentik's SCIM provider pushes users and groups into Platform Orchestrator. It
is a backchannel provider, used alongside the main OIDC or SAML provider that
handles interactive SSO.

Before starting, prepare the organization-specific URL and service user token
described in [SCIM provisioning]({{< relref
"/platform-orchestrator/docs/security/scim-provisioning" >}}):

```text
SCIM URL: https://<api-host>/scim/v2/orgs/<organization-id>
Token:    SU-...
```

## 1. Create the provider and application

In the Authentik Admin interface:

1. Go to **Applications → Applications** and select **Create with provider**.
   In Authentik versions that show **New Application** instead, use that wizard.
2. Create an application such as `Stellwerk production`.
3. Select **SCIM** as the provider type.
4. Configure the provider with these example values:

| Field                        | Example                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| **Name**                     | `stellwerk-production-scim`                                                            |
| **Authentication mode**      | `Static token`                                                                         |
| **URL**                      | `https://api.example.com/scim/v2/orgs/5e53c7a4-1df8-4cc4-95aa-91b713314a3f`            |
| **Token**                    | The organization's `SU-...` provisioning token                                         |
| **Verify certificates**      | Enabled                                                                                |
| **Exclude service accounts** | Enabled, unless Authentik service accounts should become Platform Orchestrator members |

Keep certificate verification enabled. If the Platform Orchestrator uses a
private certificate authority, add that CA to the trust store of every
Authentik worker rather than disabling verification.

The default Authentik SCIM user and group property mappings are sufficient.
Platform Orchestrator uses `userName`, `externalId`, `active`, `displayName`, the
primary email, group `displayName`, and group `members`. Remove or avoid custom
mappings for attributes not listed in the [supported schema]({{< relref
"/platform-orchestrator/docs/security/scim-provisioning#supported-attributes"
>}}).

## 2. Attach the backchannel provider

After creating the objects:

1. Edit the Authentik application.
2. Add the SCIM provider under **Backchannel Providers**.
3. Leave the application's main **Provider** field for the OIDC or SAML login
   provider, or empty when this application exists only for provisioning.
4. Save the application.

Do not attach SCIM as the main provider. Authentik runs outbound SCIM
synchronization only for a provider attached as a backchannel provider.

## 3. Limit who is synchronized

Bind the users or, preferably, a dedicated group to the Authentik application.
Only users with access to that application are synchronized. With no user or
group binding, Authentik synchronizes all users, which is usually a rather
larger blast radius than intended.

Group filters on the SCIM provider control which **group resources** are sent;
they do not restrict the synchronized users. Also note that changing a group
filter does not remove groups or memberships sent by an earlier sync. Use
application bindings to control user scope and deprovision users cleanly.

For example:

| Authentik object              | Configuration                                                   |
| ----------------------------- | --------------------------------------------------------------- |
| Application binding           | Group `stellwerk-production-users`                              |
| SCIM group filters            | `stellwerk-production-users`, `stellwerk-production-admins`     |
| Platform Orchestrator mapping | `stellwerk-production-admins` → your Admin-equivalent role UUID |

Create the Platform Orchestrator group-to-role mappings separately. The SCIM
token intentionally cannot create them.

## 4. Test synchronization

1. Add one test user with a valid email address to the bound Authentik group.
2. Open the SCIM provider and run a manual synchronization.
3. Confirm that the provider task succeeds and the user appears in Platform
   Orchestrator.
4. Add the user to a group with a configured role mapping and verify the role.
5. Remove the user from the application binding, run synchronization, and
   verify that their Platform Orchestrator organization access is removed.

Authentik also pushes user and group changes when they occur and runs a full
synchronization approximately once per hour. The worker executes these tasks,
so inspect worker task logs when the provider reports a failure.

For the current Authentik UI and synchronization behavior, see the official
[SCIM provider](https://docs.goauthentik.io/add-secure-apps/providers/scim/)
and [provider creation](https://docs.goauthentik.io/add-secure-apps/providers/scim/create-scim-provider/)
documentation.

## Authentik troubleshooting

| Symptom                                      | Fix                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| No synchronization task runs                 | Verify that the SCIM provider is listed under the application's **Backchannel Providers**, not its main provider.             |
| Every Authentik user is provisioned          | Add a user or group binding to the application. An unbound application includes all users.                                    |
| Users synchronize but expected groups do not | Select the groups in the provider's group filters and check their Platform Orchestrator name mappings.                        |
| TLS verification fails                       | Install the Platform Orchestrator issuer CA in the Authentik workers' trust store. Do not disable verification in production. |
| A task returns `401`                         | Replace the provider token with the current Platform Orchestrator `SU-...` token.                                             |
| A task returns `403`                         | Assign both provisioning permissions to the service user at organization scope.                                               |
