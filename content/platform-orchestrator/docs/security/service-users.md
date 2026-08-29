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

Creating service users is currently supported in the `Service Users` section of your Platform Orchestrator console.

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

Create the service user with the role assignments it needs. The response
contains the bearer token once, so send JSON output directly to a protected
file or secret-handling process:

```bash
umask 077
octl --out json create service-user \
  --set-json '{
    "display_name": "CI deployment",
    "expiry_in_days": 90,
    "roles": [{"id": "11111111-1111-1111-1111-111111111111"}]
  }' > service-user.json

jq -r .token service-user.json
```

Use `octl get service-users` to list service users and
`octl get service-user <service-user-id>` to inspect one. List output never
contains bearer tokens.

{{% /tab %}}
{{% tab name="TF" %}}

Service users are intentionally not managed by the
[Platform Orchestrator Terraform/OpenTofu provider]({{< relref
"/platform-orchestrator/docs/integrations/terraform-opentofu-providers" >}}).
Creation and rotation return one-time credentials, which Terraform would store
in state. Use the CLI or API and put the resulting token directly into your
secret manager.

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

Delete a service user by UUID:

```bash
octl delete service-user 11111111-1111-1111-1111-111111111111
```

To change its complete role assignment without replacing the credential:

```bash
octl update service-user 11111111-1111-1111-1111-111111111111 \
  --set-json '{"roles":[{"id":"22222222-2222-2222-2222-222222222222"}]}'
```

To rotate the credential, capture the new one-time token securely:

```bash
umask 077
octl --out json regenerate service-user \
  11111111-1111-1111-1111-111111111111 \
  --expiry-in-days 90 > regenerated-service-user.json
```

Role updates are authoritative replacements. Include every assignment the
service user should retain.

{{% /tab %}}
{{% tab name="TF" %}}

Not supported intentionally because service-user credentials must not be
persisted in Terraform state. Use the CLI or API.

{{% /tab %}}
{{< /tabs >}}
