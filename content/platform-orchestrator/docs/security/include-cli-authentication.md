---
title: "CLI authentication"
description: "How to authenticate using the CLI"
draft: true # This page is made for being included in other pages, not standalone
---

Once your installation administrator has created your user and organization, use the `octl login` command to authenticate the CLI against the configured API endpoint.

```bash
octl login
```

This obtains a short-lived authentication token which is written to the [local config file]({{< relref "/platform-orchestrator/docs/integrations/cli#configuration" >}}).
