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
      HUMANITEC_ORG: ${{ vars.HUMANITEC_ORG }}
      HUMANITEC_AUTH_TOKEN: ${{ secrets.HUMANITEC_AUTH_TOKEN }}
    steps:
    - name: Setup octl
      uses: humanitec/setup-octl@v1
      with:
        version: "1"
        token: ${{ secrets.GITHUB_TOKEN }}
    - name: Deploy a manifest
      run: octl deploy my-project my-environment ./manifest.yaml
```
