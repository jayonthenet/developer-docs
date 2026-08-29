---
title: "SCIM provisioning"
description: "Automatically provision and deprovision Platform Orchestrator members from your identity provider using SCIM 2.0."
lead: "Keep organization membership in sync with your identity provider without manual invitations."
draft: false
type: docs
weight: 40
toc: true
---

[SCIM 2.0](https://www.rfc-editor.org/rfc/rfc7644) lets an identity provider
(IdP) create, update, and deprovision Platform Orchestrator members. It solves
the directory lifecycle problem: who should exist in an organization and which
role should their IdP groups grant.

SCIM does not authenticate people. Configure [SSO]({{< relref
"/platform-orchestrator/docs/security/authentication#single-sign-on-sso" >}})
separately, then use SCIM to provision accounts before their first login and to
withdraw access during offboarding.

## How it works

1. The IdP calls an organization-specific SCIM endpoint with a service user
   token.
2. User records become Platform Orchestrator members. A user with no mapped IdP
   group receives the Viewer role by default.
3. Optional group-to-role mappings translate IdP group membership into
   Platform Orchestrator roles.
4. Deactivating or deleting a user at the IdP removes their access to that
   organization.

Configure one provisioning connection for each Platform Orchestrator
organization. Users and groups are never synchronized across organizations.

## Endpoint and schema

Each organization has its own SCIM base URL:

```text
https://<api-host>/scim/v2/orgs/<organization-id>
```

Use the externally reachable Platform Orchestrator API hostname and the
organization ID shown in the console. The IdP must be able to reach this URL
over HTTPS.

### Supported resources

| Resource                | Supported operations                      |
| ----------------------- | ----------------------------------------- |
| `Users`                 | Create, read, replace, update, and delete |
| `Groups`                | Create, read, replace, update, and delete |
| `ServiceProviderConfig` | Read without authentication               |
| `Schemas`               | Read without authentication               |
| `ResourceTypes`         | Read without authentication               |

The endpoint supports pagination and these equality filters:

| Resource | Filters                                       |
| -------- | --------------------------------------------- |
| `Users`  | `userName eq "..."`, `externalId eq "..."`    |
| `Groups` | `displayName eq "..."`, `externalId eq "..."` |

Bulk operations, sorting, and ETags are not supported. The discovery endpoint
advertises those capabilities accurately.

### Supported attributes

Keep the IdP mapping small. Attributes outside this table are not persisted.

| Resource | Attribute     | Behavior                                                                                    |
| -------- | ------------- | ------------------------------------------------------------------------------------------- |
| User     | `userName`    | Required and unique within the organization                                                 |
| User     | `externalId`  | Recommended immutable identifier from the IdP                                               |
| User     | `active`      | Controls activation and deprovisioning; defaults to `true`                                  |
| User     | `displayName` | Updates the shared user profile when this is its only provisioning organization             |
| User     | `emails`      | The primary email, or first email when none is marked primary, is used for account matching |
| Group    | `displayName` | Required, unique within the organization, and used for role mapping                         |
| Group    | `externalId`  | Recommended immutable identifier from the IdP                                               |
| Group    | `members`     | References SCIM user IDs returned by this endpoint                                          |

Use a stable directory object ID for `externalId`. Platform Orchestrator first
matches a new SCIM request by the organization-scoped `externalId`, then by
primary email. Stable IDs prevent a rename from producing a second account.

## Create the provisioning credential

SCIM resource requests use a Platform Orchestrator service user token. Create a
dedicated token so its permissions and lifetime are limited to provisioning.

1. Create a configurable role containing exactly `provisioning_read` and
   `provisioning_write`.
2. In the console, open **Service Users** and select **Create new service user**.
3. Give the service user a recognizable name, such as `Entra provisioning`,
   and choose an expiry.
4. Copy the generated `SU-...` token. It is shown only once.
5. Assign the provisioning role to the service user at organization scope.

Enter the token in the IdP's bearer-token field. Depending on the IdP, this is
called **Secret Token**, **Token**, or **API Token**.

The SCIM endpoint currently supports this static service user token. It does not
provide an OAuth token endpoint for client credentials or workload identity
federation.

{{< alert context="warning" >}}
Treat the token as a secret. It can read the organization's provisioned user
directory and add or remove access. Store it in the IdP's secret field, use a
finite lifetime, and rotate it before expiry. After deleting or regenerating a
service user credential, allow up to 60 seconds for cached authorization to
expire.
{{< /alert >}}

The provisioning token cannot manage group-to-role mappings. That separation
prevents a compromised IdP credential from mapping an attacker-controlled group
to an administrative role.

## Configure an identity provider

Use the guide for your IdP:

- [Microsoft Entra ID]({{< relref
  "/platform-orchestrator/docs/security/scim-provisioning-entra" >}})
- [Authentik]({{< relref
  "/platform-orchestrator/docs/security/scim-provisioning-authentik" >}})

Other SCIM 2.0 clients should use the same base URL and bearer token. Platform
Orchestrator accepts the common PATCH and full-resource PUT forms used by Entra,
Okta, and Authentik.

The Keycloak installation bundled with Platform Orchestrator brokers SSO but is
not an outbound SCIM client. Configure the upstream directory to provision
Platform Orchestrator directly.

## Map IdP groups to roles

A newly provisioned user receives Viewer access when no mapped group applies
and no role was granted manually. Group-role mappings let selected IdP groups
grant other roles.

Mapping management is part of membership administration, not part of the SCIM
protocol:

| Operation                   | Method and path                                                        | Required permission |
| --------------------------- | ---------------------------------------------------------------------- | ------------------- |
| List mappings               | `GET /orgs/{organizationId}/scim/group-mappings`                       | `membership_read`   |
| Create or replace a mapping | `PUT /orgs/{organizationId}/scim/group-mappings/{groupDisplayName}`    | `membership_write`  |
| Remove a mapping            | `DELETE /orgs/{organizationId}/scim/group-mappings/{groupDisplayName}` | `membership_write`  |

Use a human or separate administrative service user for these calls, not the
SCIM provisioning token. The `role_id` is the UUID of a role in the same
organization:

```bash
curl -X PUT "${PO_API_URL}/orgs/${ORG_ID}/scim/group-mappings/Engineering" \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "role_id": "11111111-1111-1111-1111-111111111111"
  }'
```

List the configured mappings:

```bash
curl "${PO_API_URL}/orgs/${ORG_ID}/scim/group-mappings" \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

URL-encode a group name before placing it in the path when it contains spaces
or reserved characters.

The CLI handles path encoding and can manage the same mappings:

```bash
octl create scim-group-mapping "Engineering" \
  --set role_id=11111111-1111-1111-1111-111111111111

octl get scim-group-mappings
octl get scim-group-mapping "Engineering"
octl delete scim-group-mapping "Engineering"
```

Provider `v1.1.0` and later can manage mappings declaratively:

```hcl
resource "platform-orchestrator_scim_group_mapping" "engineering" {
  group_display_name = "Engineering"
  role_id            = platform-orchestrator_role.engineering.id
}
```

Existing mappings can be imported using the group display name. Use the
[`platform-orchestrator_scim_group_mappings`](https://registry.terraform.io/providers/stellwerk-labs/platform-orchestrator/latest/docs/data-sources/scim_group_mappings)
data source when another configuration owns the mappings.

### Mapping behavior

- Group display names match case-insensitively.
- Renaming a group at the IdP breaks the name-based role mapping. Replace the
  mapping with the new display name.
- A group without a mapping is still synchronized but grants no additional
  role.
- Creating, changing, or deleting a mapping immediately reconciles the current
  members of that group.
- Removing someone from a group removes only roles previously managed by SCIM.
  A role granted manually remains in place.
- Deactivating or deleting the user is different: it removes every membership
  in that organization, including roles granted manually.

## Deprovisioning and reactivation

Both `active: false` and `DELETE /Users/{id}` remove all of the user's
memberships in the organization and revoke pending invitations addressed to
that user. A later reactivation restores the roles mapped from their current
groups, or Viewer when no mapping applies. Manually granted roles that were
removed during deprovisioning are not restored.

If the user has no membership in any other organization, their sessions are
revoked immediately. If they still belong to another organization, the session
remains usable there but no longer authorizes access to the organization that
deprovisioned them.

Platform Orchestrator retains a governance marker after deletion. It uses that
marker to reject a later SSO login for the deprovisioned organization. Sending
the user again with the same stable `externalId` or email reuses the global
account and creates a fresh SCIM resource.

{{< alert context="warning" >}}
SCIM is authoritative for users it has provisioned, but enabling a provisioning
connection does not currently put an organization into a SCIM-only mode. A user
who was never sent through SCIM can still receive just-in-time access through
the configured SSO flow. Scope SSO and SCIM to the same population when strict
directory-controlled onboarding is required.
{{< /alert >}}

## Multiple organizations

Use a separate SCIM URL and token for each organization. When the same email is
provisioned into several organizations, Platform Orchestrator reuses one global
user and keeps separate organization memberships.

Because the display name and email belong to the global profile, an IdP updates
those fields only while its organization is the sole active SCIM governor of
that user. Once several organizations provision the account, no individual
organization is allowed to overwrite the shared profile.

## Verify the connection

Discovery is public and is a useful network and routing check:

```bash
export SCIM_BASE_URL="https://<api-host>/scim/v2/orgs/<organization-id>"

curl --fail-with-body "${SCIM_BASE_URL}/ServiceProviderConfig"
```

Then verify an authenticated user query:

```bash
export SCIM_TOKEN="<SU-token>"

curl --fail-with-body --get "${SCIM_BASE_URL}/Users" \
  -H "Authorization: Bearer ${SCIM_TOKEN}" \
  --data-urlencode 'filter=userName eq "nobody@example.com"'
```

The second request should return `200 OK` with an empty SCIM `ListResponse`.

## Troubleshooting

| Symptom                                                  | Likely cause and fix                                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `401 Unauthorized`                                       | The token is missing, wrong, expired, or not sent as a bearer token. Rotate the service user credential and update the IdP.                      |
| `403 Forbidden`                                          | The service user's role is missing `provisioning_read` or `provisioning_write`, or its assignment is not at organization scope.                  |
| `409 Conflict` with `uniqueness`                         | Another live SCIM user has the same `userName`. Verify the IdP's matching attributes and remove the duplicate from provisioning scope.           |
| `400 Bad Request` with `invalidValue` for a group member | The referenced user has not been SCIM-provisioned into this organization. Provision the user before the group membership.                        |
| A user still has access after group removal              | Check for manually granted roles. Group reconciliation deliberately does not revoke them. Deactivate the user to remove all organization access. |
| SSO creates a user that was not expected from SCIM       | The user was never SCIM-governed and entered through just-in-time SSO. Align the SSO and provisioning scopes.                                    |
