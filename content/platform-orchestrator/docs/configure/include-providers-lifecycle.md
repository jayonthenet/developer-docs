---
title: "Providers lifecycle"
description: "Hints on the provider lifecycle and its implications for modules"
draft: true # This page is made for being included in other pages, not standalone
---

When you create or update a module, all providers used in the `provider_mapping` must already exist. For security reasons, you may delete a provider even if specified in a module, however, that module will fail until a provider with the same `provider_type` and `id` is created.

Modules that use a provider in the `provider_mapping` field will not capture a copy of the provider in the version history and will always use the current configuration. For this reason, it's best to create new copies of the provider if you need existing usage to continue without impact.