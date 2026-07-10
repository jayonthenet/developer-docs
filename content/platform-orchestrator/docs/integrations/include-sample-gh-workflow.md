---
type: docs
description: "Sample GitHub workflow for deploying"
draft: true # This page is made for being included in other pages, not standalone
---

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    env:
      PO_ORG_ID: ${{ vars.PO_ORG_ID }}
      PO_AUTH_TOKEN: ${{ secrets.PO_AUTH_TOKEN }}
    steps:
    - name: Install octl
      run: |
        curl -fLO https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_linux_amd64.tar.gz
        tar xvzf platform-orchestrator-cli_{{< param octlVersion >}}_linux_amd64.tar.gz
        sudo install -o root -g root -m 0755 octl /usr/local/bin/octl
    - name: Deploy a manifest
      run: octl deploy my-project my-environment ./manifest.yaml
```
