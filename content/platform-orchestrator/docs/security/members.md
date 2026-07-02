---
title: "Members"
description: "A _member_ is someone with a membership in one or more Orchestrator organizations."
lead: ""
draft: false
type: docs
weight: 20
toc: true
aliases:
- /new-orchestrator/security/members
---

{{% description %}}

## Overview

To interact with the Platform Orchestrator you need to be registered as an Orchestrator user and be a member in one or more [organizations]({{< relref "/platform-orchestrator/docs/configure/organizations" >}}).

Users with an Admin role in an organization can manage the members of that organization. They can invite or remove users from an organization and manage their permissions through [RBAC]({{< relref "/platform-orchestrator/docs/security/rbac" >}}).

## Managing users

### Creating users

An Orchestrator user can be created by these means:

- Registering for a new [organization]({{< relref "/platform-orchestrator/docs/configure/organizations" >}})
- Signing in via [SSO]({{< relref "/platform-orchestrator/docs/security/authentication#single-sign-on-sso" >}})
- Receiving an [invite](#inviting-users-to-an-organization) to an existing organization

### Inviting users to an organization

{{< include "/platform-orchestrator/docs/architecture/include-not-available-when-self-hosting.md" >}}

An organization Admin can invite users to join an existing organization as a member. An invitation involves sending an email that contains a one-time link that the invited user can follow to associate their user with the Platform Orchestrator organization. The link will expire after 7 days. If the link has expired before a user has accepted the invite, a new invite can be sent.

A user becomes a member of the inviting organization upon accepting the invite.

Inviting users is currently supported via the Orchestrator console, in the `Members` section of your organization at [https://console.stellwerk.dev](https://console.stellwerk.dev).

{{< tabs >}}
{{% tab name="Console" %}}

1. Select **Members** from the navigation menu
2. Click **Invite users**
3. In the **Email** text box on the left-hand side, add the user's email address you want to invite
4. Select an [RBAC role]({{< relref "/platform-orchestrator/docs/security/rbac" >}}) for the user to invite from the **Role** dropdown on the right-hand side
5. Select **Send invite** to invite the user (or add another user in the invitation)

{{% /tab %}}
{{% tab name="CLI" %}}

Not yet supported by the [Platform Orchestrator CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{% /tab %}}
{{% tab name="TF" %}}

Not yet supported by the [Platform Orchestrator Terraform/OpenTofu providers]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).

{{% /tab %}}
{{< /tabs >}}

### Manage user roles in an organization

Organization Admins can modify roles of existing users in an organization.

However, users cannot modify their own roles.

{{< tabs >}}
{{% tab name="Console" %}}

1. Select **Members** from the navigation menu
2. Find the user you want to modify
3. Select the three dots icon
4. Select **Manage roles**
5. Select a new [RBAC role]({{< relref "/platform-orchestrator/docs/security/rbac" >}}) for the user
6. Select **Update** to confirm the role change

{{% /tab %}}
{{% tab name="CLI" %}}
Not yet supported by the [Platform Orchestrator CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{% /tab %}}
{{% tab name="TF" %}}

Not yet supported by the [Platform Orchestrator Terraform/OpenTofu providers]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).

{{% /tab %}}
{{< /tabs >}}

### Removing users from an organization

Users can be removed from an organization by organization Admins. At least one Admin must remain in the organization.

However, users cannot remove themselves.

{{< tabs >}}
{{% tab name="Console" %}}

1. Select **Members** from the navigation menu
2. Find the user you want to remove
3. Select the three dots icon
4. Select **Remove user**
5. Confirm the removal in the dialog

{{% /tab %}}
{{% tab name="CLI" %}}
Not yet supported by the [Platform Orchestrator CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{% /tab %}}
{{% tab name="TF" %}}

Not yet supported by the [Platform Orchestrator Terraform/OpenTofu providers]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).

{{% /tab %}}
{{< /tabs >}}
