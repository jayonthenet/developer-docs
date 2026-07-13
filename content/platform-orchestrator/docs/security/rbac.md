---
title: "RBAC"
description: ""
lead: ""
draft: false
type: docs
weight: 12
toc: true
aliases:
- /new-orchestrator/security/rbac
---

## What is Role Based Access Control (RBAC)?

The Platform Orchestrator allows developers in your team or from across your organization to collaborate on tasks related to delivering software. Users are managed as [members]({{< relref "/platform-orchestrator/docs/security/members" >}}) of a Platform Orchestrator organization. Tooling integration and automation is supported via [service users]({{< relref "/platform-orchestrator/docs/security/service-users" >}}).

Both kinds of users require permissions to interact with the Orchestrator. Permissions are bound to **roles** and obtained by assigning a **role** to a **user** on a particular **scope**. You manage role assignments in your Platform Orchestrator console.

Role assignments are additive. A member or service user has all the permissions obtained via all their role assigments on the respective scopes.

When planning your RBAC strategy it is best practice to follow the “Principle Of Least Privilege” (POLP). The idea is that any user of a system should only have the minimum set of permissions necessary to get their job done.

## Examples

- **Organization Admin**: Full access to all resources and settings within the organization. Can manage users and role assignments
- **Organization Viewer**: Read-only access to all the resources within the organization. Cannot make any changes or perform actions
- **Project Admin**: Full access to all the resources within the project: can create, delete, and deploy to environments
- **Project Deployer**: Can deploy to all environments within the project, but cannot change project or environment settings
- **Environment Deployer**: Can deploy to the environment, but cannot change environment settings or manage resources
- **Environment Viewer**: Read-only access to the environment. Cannot make any changes or perform actions

## Built-in Roles

The Platform Orchestrator comes with a set of built-in roles that can be assigned to [users]({{< relref "/platform-orchestrator/docs/security/members" >}}) and [service users]({{< relref "/platform-orchestrator/docs/security/service-users" >}}). These roles are hierarchical, meaning that higher roles include the permissions of the lower roles.

| Role     | Permissions                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Admin    | Full access to all objects (create/read/update/delete)                                                  |
| Deployer | Create [deployments]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}), read all objects |
| Viewer   | Read all objects                                                                                        |

## Scopes

These assignable scopes exist. Assigning a role on a scope will give the user the respective permissions on all objects within that scope.

| Scope                                                                                | Objects                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Organization]({{< relref "/platform-orchestrator/docs/configure/organizations" >}}) | Every object within the organization (excluding the organization itself), role assignments                                                                                                                                                                           |
| [Project]({{< relref "/platform-orchestrator/docs/configure/projects" >}})           | The [project]({{< relref "/platform-orchestrator/docs/configure/projects" >}}), all its [environments]({{< relref "/platform-orchestrator/docs/configure/environments" >}}) and their [deployments]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}}) |
| [Environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}})   | The [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}) and its [deployments]({{< relref "/platform-orchestrator/docs/deploy/deployments" >}})                                                                                        |

## Custom Roles

If you need more granular control over permissions and you want to create custom roles, please contact [support](mailto:hello@stellwerk.dev).
