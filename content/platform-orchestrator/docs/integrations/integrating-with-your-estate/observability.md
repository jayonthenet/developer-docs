---
title: "Observability"
description: "The Platform Orchestrator is a vital source of truth for your platform observability."
lead: ""
draft: false
type: docs
weight: 50
toc: true
aliases:
- /platform-orchestrator/docs/integrations/observability
---

> Relevant tools (dashboards): Grafana, Power BI, Better Stack, OpenSearch, and others
>
> Relevant tools (portals): Backstage, Cortex, Port, Cycloid, and others

{{% description %}}

## Integrations overview

{{< include "/platform-orchestrator/docs/integrations/integrating-with-your-estate/include-integrations-overview.md" >}}

{{< integration-diagram "observability" >}}

## Observability tooling

Dashboard-like observability tools may retrieve data from the Platform Orchestrator for display, aggregation, and analysis purposes.

Portal-like tools may additionally modify objects in the Orchestrator on behalf of users, such as the creation of new projects or environments.

The [Orchestrator API]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}) provides the endpoint for all integrations. A number of examples are shown below. The exact approach for creating an integration depends on your tooling of choice. We therefore use the universal `curl` command to illustrate the usage of API endpoints with the API token set as an environment variable `PLATFORM_ORCHESTRATOR_TOKEN`.

## Provide an API token

To integrate an observatility tool with the Orchestrator API, create a [service user]({{< relref "/platform-orchestrator/docs/security/service-users" >}}) API token with the appropriate privileges, and make it available to your observability tool.

## Query Orchestrator data

The following examples illustrate the querying of Orchestrator data. Consult the [Orchestrator API]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}) to see the full spectrum of endpoints and schema definitions.

Set `PO_API_URL` to the API endpoint of your installation before running the examples:

```bash
export PO_API_URL=https://api.orchestrator.example.com
```

{{% details "Example: Get all environments of a project" %}}

```bash
curl ${PO_API_URL}/orgs/{org_id}/projects/{project_id}/envs \
  -X GET \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

{{% /details %}}

{{% details "Example: Get all active resources of an environment" %}}

```bash
curl "${PO_API_URL}/orgs/{org_id}/active-resources?project_id={project_id}&env_id={env_id}" \
  -X GET \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

{{% /details %}}

{{% details "Example: Get all available resource types of an environment" %}}

```bash
curl "${PO_API_URL}/orgs/{orgId}/projects/{projectId}/envs/{envId}/available-resource-types" \
  -X GET \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

{{% /details %}}

{{% details "Example: Get the last deployments across all project environments" %}}

```bash
curl "${PO_API_URL}/orgs/{orgId}/last-deployments" \
  -X GET \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}"
```

{{% /details %}}

## Modify Orchestrator objects

The following examples illustrate the modification of Orchestrator objects via the API. Your portal solution may offer an Orchestrator integration to its users this way. Consult the [Orchestrator API]({{< relref "/platform-orchestrator/docs/reference/api-spec" >}}) to see the full spectrum of endpoints and schema definitions.

{{% details "Example: Create a new project" %}}

```bash
curl "${PO_API_URL}/orgs/{orgId}/projects" \
  -X POST \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '
{
  "id": "sample-project",
  "display_name": "Sample Project"
}'
```

{{% /details %}}

{{% details "Example: Trigger a deployment" %}}

Refer to the [Orchestrator API]({{< relref "/platform-orchestrator/docs/reference/api-spec#/Deployment" >}})  of this endpoint for additional properties for controlling the deployment flow.

```bash
curl "${PO_API_URL}/orgs/{orgId}/deployments" \
  -X POST \
  -H "Authorization: Bearer ${PLATFORM_ORCHESTRATOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '
{
  "mode": "deploy",
  "project_id": "my-project",
  "env_id": "development",
  "manifest": {
    "workloads": {
      "example-workload": {
        "resources": {
          "example-db": {
            "type": "postgres"
          }
        },
        "outputs": {
          "DB_HOST": "${resources.example-db.outputs.host}"
        }
      }
    }
  }
}'
```

{{% /details %}}
