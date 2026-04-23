---
title: "Common state storage configuration"
description: "Common section to configure a state storage to use across runner pages"
draft: true # This page is made for being included in other pages, not standalone
---

Decide which state storage types the runner is supposed to use. Check the [compatibility matrix]({{< relref "/platform-orchestrator/docs/configure/runners/overview#compatibilty-matrix" >}}) and perform the setup according to the chosen state storage type documentation.

{{< tabs >}}
{{% tab name="TF" %}}

Prepare a TF code snippet containing the properties for the state storage configuration underneath a property `state_storage_configuration`:

```terraform
  state_storage_configuration = {
    ...
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

Prepare a local file `state-storage-config.yaml` containing the properties for the state storage configuration underneath the top level property `state_storage_configuration`.

```yaml
state_storage_configuration:
  ...
```

{{% /tab %}}
{{< /tabs >}}

