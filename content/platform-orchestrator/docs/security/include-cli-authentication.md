---
title: "CLI authentication"
description: "How to authenticate using the CLI"
draft: true # This page is made for being included in other pages, not standalone
---

Once you sign up and have access to the [Platform Orchestrator Console](https://console.stellwerk.dev) you can use the `octl login` command to authenticate the CLI.

```bash
octl login
```

This obtains a short-lived authentication token which is written to the [local config file]({{< relref "/platform-orchestrator/docs/integrations/cli#configuration" >}}).
