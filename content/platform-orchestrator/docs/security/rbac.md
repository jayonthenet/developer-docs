---
title: "RBAC"
description: "Build and assign roles from granular Platform Orchestrator permissions."
lead: "Control which Platform Orchestrator entities a member or service user can view or change."
draft: false
type: docs
weight: 12
toc: true
aliases:
- /new-orchestrator/security/rbac
---

## How RBAC works

Role-based access control (RBAC) determines what members and service users can
do in the Platform Orchestrator. It has four parts:

- A **permission** allows one kind of operation on a Platform Orchestrator
  entity, such as `module_write` or `deployment_read`.
- A **role** bundles one or more permissions.
- A **role assignment** binds a role to a member or service user at an
  organization, project, or environment scope.
- Assignments are additive. A subject receives the union of all permissions
  from all applicable role assignments.

This model lets you create roles for specific Orchestrator responsibilities.
For example, a module maintainer can receive `module_read` and `module_write`
without receiving `project_write`, while a deployment operator can receive
`deployment_read` and `deployment_write` without being able to change modules.

Follow the principle of least privilege: grant only the permissions and scopes
required for the task.

## Built-in roles

The built-in roles remain available and cannot be edited or deleted. Their
behavior is unchanged by granular permissions.

| Role | Effective access |
| --- | --- |
| Admin | Every granular permission |
| Deployer | Every normal read permission and `deployment_write` |
| Viewer | Every normal read permission |

`deployment_debug_read` exposes generated infrastructure code and remains
Admin-only. The built-in roles are hierarchical: Admin includes Deployer,
which includes Viewer.

## Scopes

A role and its assignment scope are independent:

- The role defines **what** the subject can do.
- The assignment defines **where** the subject can do it.

| Assignment scope | Applies to |
| --- | --- |
| Organization | Applicable entities throughout the organization |
| Project | The project and applicable entities in its environments |
| Environment | Applicable entities in that environment |

Each permission also declares the scopes where it is meaningful. For example,
`module_write` is organization-only, `project_write` is effective at
organization and project scope, and `deployment_write` is effective at all
three scopes. Assigning an organization-only permission at project or
environment scope does not grant organization-wide access.

The same role can contain permissions with different applicable scopes. Only
the permissions applicable to an assignment's scope take effect.

## Granular permission catalog

Permission identifiers are fixed Platform Orchestrator capabilities, not
arbitrary values for external applications. Use the exact identifier shown in
the console or returned by
[`listPermissions`]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}#/Role/listPermissions).
The API catalog is authoritative and includes each permission's display name,
description, category, and applicable scopes.

Read and write permissions are independent. A `*_write` permission does not
automatically include the matching `*_read` permission. Select both when the
role must view and change that entity.

| Permission | Allows | Applicable scopes |
| --- | --- | --- |
| `organization_read` | View organization details | Organization |
| `invitation_read` | List pending invitations | Organization |
| `invitation_write` | Create, inspect, and revoke invitations | Organization |
| `membership_read` | View members and effective access assignments | Organization, project, environment |
| `membership_write` | Assign, replace, and remove member roles | Organization |
| `role_read` | View built-in and configurable roles | Organization |
| `role_write` | Create, update, and delete configurable roles | Organization |
| `service_user_read` | View service users and their role assignments | Organization |
| `service_user_write` | Create, update, delete, and rotate credentials for service users | Organization |
| `project_read` | View projects and their configuration | Organization, project |
| `project_write` | Create, update, and delete projects | Organization, project |
| `environment_read` | View environments and their configuration | Organization, project, environment |
| `environment_write` | Create, update, and delete environments | Organization, project, environment |
| `environment_type_read` | View organization environment types | Organization |
| `environment_type_write` | Create, update, and delete environment types | Organization |
| `module_read` | View modules and module versions | Organization |
| `module_write` | Create, update, and delete modules | Organization |
| `module_provider_read` | View module providers | Organization |
| `module_provider_write` | Create, update, and delete module providers | Organization |
| `module_rule_read` | View module selection rules | Organization |
| `module_rule_write` | Create and delete module selection rules | Organization |
| `resource_type_read` | View available and configured resource types | Organization |
| `resource_type_write` | Create, update, and delete resource types | Organization |
| `runner_read` | View runners and their configuration | Organization |
| `runner_write` | Create, update, delete, and assign runners | Organization |
| `runner_rule_read` | View runner selection rules | Organization |
| `runner_rule_write` | Create and delete runner selection rules | Organization |
| `active_resource_read` | View active resources | Organization, project, environment |
| `deployment_read` | View deployments, logs, outputs, and calculated differences | Organization, project, environment |
| `deployment_write` | Create deployments and wait for completion | Organization, project, environment |
| `deployment_debug_read` | View generated deployment infrastructure code | Organization |
| `metadata_key_read` | View deployment metadata key definitions | Organization |
| `metadata_key_write` | Create, update, and delete metadata key definitions | Organization |
| `resource_graph_read` | View resources produced by deployments | Organization, project, environment |

## Create a configurable role in the console

Users need `role_read` to view roles and the permission catalog, and
`role_write` to create, edit, or delete configurable roles. The complete
console workflow therefore requires both permissions. In **Settings → Roles**,
the permission selector is grouped by Orchestrator entity and shows the
description, identifier, and applicable scopes for every option. It accepts
catalog options only.

Configurable roles can be deleted only when they have no active assignments.
Changing a role changes the effective permissions of all its assignments.

## Create a configurable role with the API

The examples use `PO_API_URL`, `PLATFORM_ORCHESTRATOR_TOKEN`, and `ORG_ID`
environment variables. See [API authentication]({{< relref
"/platform-orchestrator/docs/reference/api-spec#overview" >}}) for setup.

### 1. Discover valid permissions

Do not guess permission identifiers. Read the current catalog:

```bash
curl "${PO_API_URL}/orgs/${ORG_ID}/permissions" \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

An abbreviated response looks like this:

```json
{
  "items": [
    {
      "id": "module_read",
      "display_name": "View modules",
      "description": "View modules and module versions.",
      "category": "Modules",
      "level": "read",
      "scopes": ["organization"]
    },
    {
      "id": "module_write",
      "display_name": "Manage modules",
      "description": "Create, update, and delete modules.",
      "category": "Modules",
      "level": "manage",
      "scopes": ["organization"]
    }
  ]
}
```

The `level` field preserves built-in-role compatibility. Use the permission
`id` and `scopes` fields when building and assigning a configurable role.

### 2. Create the role

This payload creates a role that can view and change modules, but cannot write
projects or other entity types:

```bash
curl -X POST "${PO_API_URL}/orgs/${ORG_ID}/roles" \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "display_name": "Module Maintainer",
    "permissions": ["module_read", "module_write"]
  }'
```

Unknown permission identifiers, duplicates, and malformed payloads return
`400 Bad Request`.

### 3. Update the role

`PUT /orgs/{orgId}/roles/{roleId}` replaces the display name and the **entire**
permission list. Include every permission the role should retain:

```bash
curl -X PUT "${PO_API_URL}/orgs/${ORG_ID}/roles/${ROLE_ID}" \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "display_name": "Module and Provider Maintainer",
    "permissions": [
      "module_read",
      "module_write",
      "module_provider_read",
      "module_provider_write"
    ]
  }'
```

Omitting a previously assigned permission removes it from the role.

## Assign the role with the API

Role assignments use the role UUID returned by the create or list-roles API,
not a permission identifier.

### Members

Replace a member's assignments with
`PUT /orgs/{orgId}/users/{userId}/memberships`. A role membership uses
`"subject_type": "role"`, places the role UUID in `subject`, and optionally
sets `scope`:

```json
{
  "memberships": [
    {
      "subject_type": "role",
      "subject": "11111111-1111-1111-1111-111111111111"
    },
    {
      "subject_type": "role",
      "subject": "22222222-2222-2222-2222-222222222222",
      "scope": "project:33333333-3333-3333-3333-333333333333"
    },
    {
      "subject_type": "role",
      "subject": "22222222-2222-2222-2222-222222222222",
      "scope": "env:44444444-4444-4444-4444-444444444444"
    }
  ]
}
```

Omit `scope` for an organization assignment. Use `project:<project-uuid>` for
a project assignment and `env:<environment-uuid>` for an environment
assignment.

### Service users

Replace a service user's assignments with
`PUT /orgs/{orgId}/service-users/{serviceUserId}`:

```json
{
  "roles": [
    {
      "id": "11111111-1111-1111-1111-111111111111"
    },
    {
      "id": "22222222-2222-2222-2222-222222222222",
      "scope": "project:33333333-3333-3333-3333-333333333333"
    }
  ]
}
```

Both assignment endpoints use replace-all semantics. First read the current
assignments, then send the complete desired list; omitted assignments are
removed.

## Compatibility with existing configurable roles

Existing roles that contain legacy aggregate values such as `read_all`,
`write_all`, or `manage_all` continue to authorize exactly as before and can
still be edited. These compatibility values are intentionally absent from the
permission catalog and are not offered when creating new roles. Replace them
with granular permissions when you next refine the role.
