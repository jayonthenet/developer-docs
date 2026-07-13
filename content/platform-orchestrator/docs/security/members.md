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

Users with an Admin role in an organization can manage organization membership and permissions through [RBAC]({{< relref "/platform-orchestrator/docs/security/rbac" >}}). Installation administrators manage user identities in Keycloak.

## Managing users

### Creating users

Create local users in the Keycloak administration console for the `platform-orchestrator` realm, or configure an external identity provider for [SSO]({{< relref "/platform-orchestrator/docs/security/authentication#single-sign-on-sso" >}}). The user signs in through the Platform Orchestrator console and selects their organization.

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
