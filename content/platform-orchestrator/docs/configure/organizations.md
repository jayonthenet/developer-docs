---
title: "Organizations"
description: '_Organizations_ are the top level grouping of all your Orchestrator objects, similar to "tenants" in other tools. Your real-world organization or company will usually have one Orchestrator organization.'
lead: ""
draft: false
type: docs
weight: 100
toc: true
aliases:
- /new-orchestrator/docs/configure/organizations
---

{{% description %}}

Organizations are identified by an **ID**.

## Register an Organization

Follow [this link](https://console.stellwerk.dev/auth/register) to register a free trial organization.

## Your Organization ID

You can find your Organization ID in multiple ways.

{{< tabs >}}
{{% tab name="CLI" %}}

List your Organizations:

```bash
octl get current-user
```

The IDs of Organizations of which you are a member are in the **OrganizationMemberships** column.

{{% /tab %}}
{{% tab name="Console" %}}

From any page in the console, your Organization ID(s) are available in the upper right corner.

{{% /tab %}}
{{< /tabs >}}
