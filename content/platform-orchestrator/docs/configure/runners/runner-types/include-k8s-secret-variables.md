---
title: "Kubernetes secret variables"
draft: true # This page is made for being included in other pages, not standalone
---

The `runner_configuration.job.pod_template` field contains a Kubernetes pod template you can set to extend the runtime configuration of the runner. The pod template expects a structure of pod spec with a container named `main`. You can set secret environment variables by referencing existing secrets within the same target namespace of the runner pod. For example, if you want to mount the value of the `key` field within a secret named `my-secret` to the environment variable `TF_EXAMPLE`, you can set the pod template as the following:

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
  runner_configuration = {
    job = {
      pod_template = jsonencode({
        spec = {
          containers = [
            {
              name = "main"
              env = [
                {
                  name = "TF_EXAMPLE"
                  valueFrom = {
                    secretKeyRef = {
                      name = "my-secret"
                      key  = "key"
                    }
                  }
                }
              ]
            }
          ]
        }
      })
    }
  }
```

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
runner_configuration:
  job:
    pod_template:
      spec:
        containers:
          - name: main
            env:
              name: TF_EXAMPLE
              valueFrom:
                secretKeyRef:
                  name: my-secret
                  key: key
```

{{% /tab %}}
{{< /tabs >}}

You can also use this mechanism to inject environment variables into TF `variables` by using the `TF_VAR_` prefix. This naming is the standard mechanism to inject environment variables into TF variables in [Terraform](https://developer.hashicorp.com/terraform/language/values/variables#environment-variables) and [OpenTofu](https://opentofu.org/docs/language/values/variables/#environment-variables).

The service account used by the runner must have permissions to `get` the secret.

Environment variables that are not secret or sensitive can be set directly in the `env` structure.
