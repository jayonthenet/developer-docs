---
title: "Resource types"
description: '_Resource types_ define the formal structure for a kind of real-world resource such as an Amazon S3 bucket or PostgreSQL database.'
lead: ""
draft: false
type: docs
weight: 140
toc: true
aliases:
- /new-orchestrator/docs/configure/resource-types
---

{{% description %}}

To leave out the "how" and get to the "what" for a deployment manifest, we need to have a mapping between the name of a certain resource and the actual implementation. This mapping also describes the interface, so both sides know what they can expect or need to implement.

Developers order resources of a certain type and can expect the defined outputs to be delivered back to them - e.g. a resource of type Postgres will probably deliver all details back to create a connection string. Platform engineers provide one or many implementations behind the type and know exactly what their implementations need to pass back to the Orchestrator.

Resource types allow for a clear separation of concerns and responsibilities that is facilitated by the Orchestrator.

You can create and manage resource types using the [octl CLI]({{< relref "/platform-orchestrator/docs/integrations/cli" >}}), [Terraform provider](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/resource_type), [OpenTofu provider](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/resource_type), or [API]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}).

## Basic Example

A common example of a resource that developers may frequently use is a PostgreSQL database. That's how a resource type for it may be created:

{{< tabs >}}
{{% tab name="TF" %}}

```terraform
resource "platform-orchestrator_resource_type" "postgres" {
  id          = "postgres"
  description = "PostgreSQL database"
  output_schema = jsonencode({
    type = "object"
    properties = {
      host = {
        description = "The IP address or hostname the instance is available on"
        type        = "string"
      }
      port = {
        description = "The port on the host that the instance is available on"
        type        = "integer"
        maximum     = 65535
      }
      name = {
        descritpion = "The name of the database"
        type        = "string"
      }
      username = {
        descritpion = "The user or role for connecting to the database"
        type        = "string"
      }
      password = {
        description = "The password for the user or role"
        type        = "string"
      }
    }
  })
  is_developer_accessible = true
}
```

{{% /tab %}}
{{% tab name="CLI" %}}

```sh
octl create resource-type postgres --set-yaml=@resource-type-postgres.yaml
```

where `resource-type-postgres.yaml`:

```yaml
id: postgres
description: Postgres database
is_developer_accessible: true
output_schema:
  type: object
  properties:
    host:
      description: The IP address or hostname the instance is available on
      type: string
    port:
      description: The port on the host that the instance is available on
      maximum: 65535
      type: integer
    name:
      descritpion: The name of the database
      type: string
    username:
      descritpion: The user or role for connecting to the database
      type: string
    password:
      description: The password for the user or role
      type: string
```

{{% /tab %}}
{{< /tabs >}}

## Configuration

A resource type has these fields:

{{< tabs >}}
{{% tab name="TF" %}}

Refer to the resource schema in the [Terraform](https://registry.terraform.io/providers/humanitec/platform-orchestrator/latest/docs/resources/resource_type#schema) or [OpenTofu](https://search.opentofu.org/provider/humanitec/platform-orchestrator/latest/docs/resources/resource_type#schema) provider documentation.

{{% /tab %}}
{{% tab name="CLI" %}}

```yaml
# User-supplied unique resource type id
id: my-resource-type

# Optional resource type description
description: My resource type description

# Indicates if this resource type is for developers to use in the manifest. Resource types with this flag set to false, will not be available as types of resources in a manifest. Optional, default is true.
is_developer_accessible: true

# The JSON schema for resource outputs. A Module of this resource type must have outputs corresponding to this schema.
output_schema:
  type: object
  properties:
    my-output-property:
      description: My output property description
      type: string
```

{{% /tab %}}
{{< /tabs >}}

## Deleting and managing resource types

An resource type cannot be deleted as long as it is used by a [module]({{< relref "/platform-orchestrator/docs/configure/modules/overview" >}}).

To delete a resource type, you need to delete all modules with this type. Note: the resource type of a module cannot be changed.
