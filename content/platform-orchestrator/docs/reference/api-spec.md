---
title: "API specification"
description: ""
lead: ""
draft: false
type: docs
weight: 10
toc: true
aliases:
- /new-orchestrator/docs/reference/api-specification
---

## Overview

The current [OpenAPI](https://www.openapis.org/) specification of the Platform Orchestrator configuration entities is shown below.

The API endpoint is `https://api.humanitec.dev`.

All requests to the API must be authenticated using an API token placed in the `Authorization` header as shown here using `curl`:

```bash
curl https://api.humanitec.dev/orgs/{org_id}/projects \
  -H "Authorization: Bearer ${HUMANITEC_TOKEN}"
```

An API token can be issued via [service user]({{< relref "/platform-orchestrator/docs/security/service-users" >}}) (recommended for all automation use cases) or via a [CLI authentication]({{< relref "/platform-orchestrator/docs/security/authentication#authentication-in-the-cli" >}}).

## API specification

<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
  // Render the OpenAPI docs based on a spec source file
  const uicp = SwaggerUIBundle({
    url: '/spec/platform-orchestrator-openapi-spec.json',
    dom_id: '#swagger-ui',
    supportedSubmitMethods: [],
    plugins: ['DisableAuthorizePlugin'],
    deepLinking: true,
    docExpansion: "none",
    tryItOutEnabled: false,
    syntaxHighlight: {
      theme: "idea",
    },
    onComplete: removeHeading,
  });
  // Remove the "OpenAPI" heading that is rendered above the spec sections
  // This function is used in the "onComplete" callback of the SwaggerUIBundle
  function removeHeading() {
    const element = document.querySelector("#swagger-ui > div > div:nth-child(2) > div.information-container.wrapper");
    if (element) {
        element.remove();
    }
  }
</script>