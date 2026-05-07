---
title: "Common runner configuration"
description: "Common configuration across runners"
draft: true # This page is made for being included in other pages, not standalone
---

2. Append the state storage configuration you created earlier

Append the state storage config file prepared in the previous section to the existing runner configuration:

{{< tabs >}}
{{% tab name="TF" %}}

Add the `state_storage_configuration` block you prepared to the `__INCLUDE_PARAM1__` resource:

```terraform
resource "__INCLUDE_PARAM1__" "example" {

  # ...

  state_storage_configuration = {
    # Your prepared state storage configuration
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
cat state-storage-config.yaml >> runner-config.yaml
```

{{% /tab %}}
{{< /tabs >}}

3. Verify the runner configuration

{{< tabs >}}
{{% tab name="TF" %}}

Verify the structure of the runner configuration. It needs to have the top level properties as shown:

```terraform
resource "__INCLUDE_PARAM1__" "example" {

  runner_configuration = {
    # ...
  }
  state_storage_configuration = {
    # ...
  }
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

Verify the structure of the configuration file. It needs to have the top level properties as shown:

```bash
cat runner-config.yaml
```

```yaml
runner_configuration:
  ...
state_storage_configuration:
  ...
```

{{% /tab %}}
{{< /tabs >}}

4. Create the runner

Create the runner using the configuration prepared previously:

{{< tabs >}}
{{% tab name="TF" %}}

`apply` the TF configuration you created.

{{% /tab %}}
{{% tab name="CLI" %}}

```bash
octl create runner ${RUNNER_ID} \
  --set-yaml=@runner-config.yaml
```

{{% /tab %}}
{{< /tabs >}}

## Create runner rules

Add any [runner rules]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}) for the newly created runner.
