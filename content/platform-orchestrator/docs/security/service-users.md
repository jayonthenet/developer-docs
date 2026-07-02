---
title: "Service users"
description: ""
lead: ""
draft: false
type: docs
weight: 30
toc: true
aliases:
- /new-orchestrator/security/service-users
---

## Overview

A service user is a non-human system user. API tokens can be generated from service users and are used to interact with Platform Orchestrator's API on the service user's behalf. Service users permissions are managed via [RBAC]({{< relref "/platform-orchestrator/docs/security/rbac" >}}) just like regular users.

## Managing service users

### Creating a new service user

An organization Admin can create a new service user in the Platform Orchestrator. This involves specifying the service user's name, description, and any necessary permissions.

Creating service users is currently supported via the Orchestrator console, in the `Service Users` section of your organization at [https://console.stellwerk.dev](https://console.stellwerk.dev).

{{< tabs >}}
{{% tab name="Console" %}}

1. Select **Service Users** from the navigation menu
2. Click **Create new service user**
3. In the **Name** text box on the left-hand side, add the service user's name
4. In the **Expiry in days** text box, specify the duration for which the service user will be valid
5. Select **Create** to create the service user
6. The service user's details, including the generated API token, will be displayed. Make sure to copy the API token as it will not be shown again

{{% /tab %}}
{{% tab name="CLI" %}}

Not yet supported by the [Platform Orchestrator CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{% /tab %}}
{{% tab name="TF" %}}

Not yet supported by the [Platform Orchestrator Terraform/OpenTofu providers]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).

{{% /tab %}}
{{< /tabs >}}

### Removing service users from an organization

Service users can be removed from an organization by organization Admins.

{{< tabs >}}
{{% tab name="Console" %}}

1. Select **Service Users** from the navigation menu
2. Find the service user you want to remove
3. Select the three dots icon
4. Select **Delete**
5. Confirm the removal in the dialog

{{% /tab %}}
{{% tab name="CLI" %}}

Not yet supported by the [Platform Orchestrator CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}).

{{% /tab %}}
{{% tab name="TF" %}}

Not yet supported by the [Platform Orchestrator Terraform/OpenTofu providers]({{< relref "/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).

{{% /tab %}}
{{< /tabs >}}
