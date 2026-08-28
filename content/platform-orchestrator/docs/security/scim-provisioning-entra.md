---
title: "SCIM with Microsoft Entra ID"
description: "Configure a Microsoft Entra enterprise application to provision Platform Orchestrator users and groups."
lead: "Connect Microsoft Entra ID to an organization's SCIM endpoint."
draft: false
type: docs
weight: 41
toc: true
---

This guide configures a non-gallery Microsoft Entra enterprise application to
provision users and groups into one Platform Orchestrator organization.

Before starting, prepare the organization-specific URL and service user token
described in [SCIM provisioning]({{< relref
"/platform-orchestrator/docs/security/scim-provisioning" >}}):

```text
SCIM URL: https://<api-host>/scim/v2/orgs/<organization-id>
Token:    SU-...
```

You need at least the Application Administrator role in Entra to configure the
enterprise application.

## 1. Create the enterprise application

1. Open the [Microsoft Entra admin center](https://entra.microsoft.com/).
2. Go to **Entra ID → Enterprise apps**.
3. Select **New application → Create your own application**.
4. Name it, for example `Stellwerk production`.
5. Select **Integrate any other application you don't find in the gallery** and
   create the application.

This enterprise application is only the provisioning connection. Your SSO
application or Keycloak identity-broker configuration can remain separate.

## 2. Configure the SCIM connection

Open **Provisioning**, select **New configuration**, and enter:

| Field            | Example                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Tenant URL**   | `https://api.example.com/scim/v2/orgs/5e53c7a4-1df8-4cc4-95aa-91b713314a3f?aadOptscim062020` |
| **Secret Token** | The organization's `SU-...` provisioning token                                               |

Select **Test Connection**, then create the provisioning job.

The `aadOptscim062020` flag asks Entra to send RFC-compliant PATCH operations,
including boolean `active` values and filtered group-member removal. Microsoft
currently documents that the flag is not applied by **Provision on demand**.
Platform Orchestrator accepts both Entra payload variants, so on-demand tests
still work.

Do not leave **Secret Token** blank. Platform Orchestrator expects its own
service user bearer token and does not accept the Entra-issued test token.

## 3. Configure attribute mappings

Open **Attribute mapping** and review both object mappings. Use immutable Entra
object IDs as `externalId`; do not use a mutable UPN, email address, or display
name for that field.

### Users

The following is a minimal recommended mapping:

| Microsoft Entra source                 | SCIM target                    | Matching property | Notes                                                                                                            |
| -------------------------------------- | ------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `objectId`                             | `externalId`                   | Yes, precedence 1 | Stable identity across renames                                                                                   |
| `userPrincipalName`                    | `userName`                     | Yes, precedence 2 | Required by the SCIM user schema                                                                                 |
| `displayName`                          | `displayName`                  | No                | Displayed in Platform Orchestrator                                                                               |
| `Coalesce([mail],[userPrincipalName])` | `emails[type eq "work"].value` | No                | Expression falls back to the UPN when `mail` is empty                                                            |
| `IsSoftDeleted`                        | `active`                       | No                | Keep Entra's generated active-state expression so disable, unassign, and soft-delete events deprovision the user |

Remove mappings for unsupported target attributes unless another integration
needs them. Keeping the mapping small makes provisioning failures easier to
diagnose.

### Groups

Use these group mappings:

| Microsoft Entra source | SCIM target   | Matching property |
| ---------------------- | ------------- | ----------------- |
| `objectId`             | `externalId`  | Yes, precedence 1 |
| `displayName`          | `displayName` | Yes, precedence 2 |
| Group members          | `members`     | No                |

Group display names determine Platform Orchestrator role mappings. If a group
is renamed, replace its [group-to-role mapping]({{< relref
"/platform-orchestrator/docs/security/scim-provisioning#map-idp-groups-to-roles"
>}}) with the new name.

## 4. Choose the provisioning scope

For most installations, set **Scope** to **Sync only assigned users and
groups**. Open **Users and groups** and assign the groups whose members should
receive Platform Orchestrator access. If no users or groups are assigned, Entra
has nothing to provision.

Decide which Entra groups should grant which Platform Orchestrator roles before
starting the full sync. A group can be provisioned without a role mapping; its
users then receive Viewer unless another mapped group applies.

## 5. Test and start provisioning

1. Use **Provision on demand** with one assigned test user.
2. Confirm that the user appears in Platform Orchestrator with the expected
   email and role.
3. Provision a test group and verify its role mapping.
4. Disable or unassign the test user and confirm that their organization access
   is removed.
5. Configure notification email and accidental-deletion protection under the
   provisioning job's properties.
6. Select **Start provisioning**.

The first synchronization can take longer. Entra normally runs later
incremental cycles about every 40 minutes. Use **Provisioning logs** to inspect
the exact request and response for a failure.

For details about Entra's current UI and synchronization behavior, see
[Microsoft's SCIM provisioning guide](https://learn.microsoft.com/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups)
and [SCIM compatibility flags](https://learn.microsoft.com/entra/identity/app-provisioning/application-provisioning-config-problem-scim-compatibility).

## Entra troubleshooting

| Symptom                              | Fix                                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Test Connection** fails with `401` | Re-enter the Platform Orchestrator `SU-...` token in **Secret Token**.                       |
| **Test Connection** fails with `403` | Assign both provisioning permissions to the service user at organization scope.              |
| Nothing is provisioned               | Assign a user or group to the enterprise application and verify the selected **Scope**.      |
| A UPN rename creates a conflict      | Verify that `objectId` maps to `externalId` as the first matching property.                  |
| The job enters **Quarantine**        | Fix the repeated error in **Provisioning logs**, then restart provisioning.                  |
| Deprovisioning is delayed            | Use **Provision on demand** for an urgent test; normal incremental cycles are not immediate. |
