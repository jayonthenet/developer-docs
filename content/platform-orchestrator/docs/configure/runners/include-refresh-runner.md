---
title: "Refresh the runner for an environment"
description: "Show how to refresh the runner based on current runner rules"
draft: true # This page is made for being included in other pages, not standalone
---

An [environment]({{< relref "/platform-orchestrator/docs/configure/environments" >}}) remains linked to a [runner]({{< relref "/platform-orchestrator/docs/configure/runners/overview" >}}) even when the [runner rules]({{< relref "/platform-orchestrator/docs/configure/runners/runner-rules" >}}) change. Execute the [refresh_runner]({{< relref "/platform-orchestrator/docs/reference/api-spec#Environment" >}}) command on the environment to re-assign a runner based on the current runner rules.

Use the `dry_run` flag to test the result of the command without applying any change.

```bash
curl https://api.humanitec.dev/orgs/my-org/projects/my-project/envs/my-environment/actions/refresh_runner \
  -X POST \
  -H "Authorization: Bearer ${HUMANITEC_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '
{
  "dry_run": false
}'
```

If a runner could be identified for the environment, the command will return that runner's id.

If no runner could be identified, the command will return an error and the environment will remain associated with the previous runner.