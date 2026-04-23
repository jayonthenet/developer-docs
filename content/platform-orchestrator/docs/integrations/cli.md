---
title: "CLI"
description: ""
lead: ""
draft: false
type: docs
weight: 60
toc: true
---

`hctl` is the CLI for the Platform Orchestrator.

{{< alert context="info" >}}
Current CLI version: `{{< param hctlVersion >}}`
{{< /alert >}}

## Installation

### Install hctl on Linux

1. Download the latest release with the command

   {{< tabs >}}
   {{% tab name="x64-86" %}}

   ```shell
   curl -fLO https://github.com/humanitec/hctl/releases/download/v{{< param hctlVersion >}}/hctl_{{< param hctlVersion >}}_linux_amd64.tar.gz
   tar xvzf hctl_{{< param hctlVersion >}}_linux_amd64.tar.gz
   rm hctl_{{< param hctlVersion >}}_linux_amd64.tar.gz README.md
   ```

   {{< /tab >}}
   {{% tab name="ARM64" %}}

   ```shell
   curl -fLO https://github.com/humanitec/hctl/releases/download/v{{< param hctlVersion >}}/hctl_{{< param hctlVersion >}}_linux_arm64.tar.gz
   tar xvzf hctl_{{< param hctlVersion >}}_linux_arm64.tar.gz
   rm hctl_{{< param hctlVersion >}}_linux_arm64.tar.gz README.md
   ```

   {{< /tab >}}
   {{< /tabs >}}

2. Install hctl

   ```shell
   sudo install -o root -g root -m 0755 hctl /usr/local/bin/hctl
   ```

   {{< alert context="info" >}}
   **Note**

   If you do not have root access on the target system, you can still install hctl to the `~/.local/bin` directory:

   ```shell
   chmod +x hctl
   mkdir -p ~/.local/bin
   mv ./hctl ~/.local/bin/hctl
   # and then append (or prepend) ~/.local/bin to $PATH
   ```

   {{< /alert >}}

### Install hctl on macOS

#### Homebrew

If you are on macOS and using the [Homebrew](https://brew.sh/) package manager, you can install hctl with Homebrew.

1. Run the installation command:

   ```shell
   brew install humanitec/tap/hctl
   ```

#### Manually

1. Download the latest release with the command

   {{< tabs >}}
   {{% tab name="Intel" %}}

   ```shell
   curl -fLO https://github.com/humanitec/hctl/releases/download/v{{< param hctlVersion >}}/hctl_{{< param hctlVersion >}}_darwin_amd64.tar.gz
   tar xvzf hctl_{{< param hctlVersion >}}_darwin_amd64.tar.gz
   rm hctl_{{< param hctlVersion >}}_darwin_amd64.tar.gz README.md
   ```

   {{< /tab >}}
   {{% tab name="Apple Silicon" %}}

   ```shell
   curl -fLO https://github.com/humanitec/hctl/releases/download/v{{< param hctlVersion >}}/hctl_{{< param hctlVersion >}}_darwin_arm64.tar.gz
   tar xvzf hctl_{{< param hctlVersion >}}_darwin_arm64.tar.gz
   rm hctl_{{< param hctlVersion >}}_darwin_arm64.tar.gz README.md
   ```

   {{< /tab >}}
   {{< /tabs >}}

2. Install hctl

   ```shell
   chmod +x ./hctl
   sudo mv ./hctl /usr/local/bin/hctl
   sudo chown root: /usr/local/bin/hctl
   ```

### Install hctl on Windows

#### Scoop

If you are on Windows and using the [Scoop](https://scoop.sh/) package manager, you can install hctl with Scoop.

1. Run the installation command:

   ```pwsh
   scoop bucket add humanitec https://github.com/humanitec/scoop-bucket
   scoop install humanitec/hctl
   ```

#### Manually

1. Download the [latest release](https://github.com/humanitec/hctl/releases/download/v{{< param hctlVersion >}}/hctl_{{< param hctlVersion >}}_windows_amd64.zip).

2. Decompress the zip file, and move the binary to your PATH.

### Available as Docker Image

hctl is also published as [Docker Image](https://github.com/humanitec/hctl/pkgs/container/hctl), which can be used like `docker run --rm -it ghcr.io/humanitec/hctl:{{< param hctlVersion >}}`.

## Install hctl in GitHub Actions

A GitHub action is available in the [GitHub Marketplace](https://github.com/marketplace/actions/set-up-hctl-platform-orchestrator-cli) to install the hctl binary and add it to the `$PATH`.

{{< include "content/platform-orchestrator/docs/integrations/include-sample-gh-workflow.md" >}}

The `version` field can be an exact version such as "1.36.7" or a range such as "1", "1.36", "^1.36.0".

## Validate your installation

Run `hctl --version` to ensure `hctl` is in your path. Expected output, matching your installed version:
`hctl version github.com/humanitec/hctl <version XX.YY.ZZ> <commit-hash> <commit-date>`

## CLI cheat sheet

An overview of common and useful CLI commands is available in the [CLI cheat sheet]({{< relref "/platform-orchestrator/docs/reference/cli-cheat-sheet" >}}).

## Authentication

{{< include "/platform-orchestrator/docs/security/include-cli-authentication.md" >}}

## Configuration

`hctl` will maintain a local configuration in a config file located at `~/.config/hctl/config.yaml`. Use the command `hctl config` or the list below to see available configuration items.

Each configuration item can be overridden using an Environment Variable.

The command `hctl config show` displays the _effective_ configuration, taking any override into account.

| Config item      | Environment variable   | CLI command             | Description                                                                                                                                                                      | Default | Mandatory |
| ---------------- | ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------- |
| `default_org_id` | `HUMANITEC_ORG`        | `hctl config set-org`   | The id of the Organization in which to run commands                                                                                                                              | ""      | Yes       |
| `api_url`        | `HUMANITEC_API_URL`    | `hctl config set-url`   | The base URL of the Orchestrator API. Set to your internal endpoint when [self-hosting]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) the Orchestrator | ""      | Yes       |
| `token`          | `HUMANITEC_AUTH_TOKEN` | `hctl config set-token` | An authentication token. The session token obtained via `hctl login` will be written into this property                                                                          | ""      | Yes       |

## Commands

`hctl` follows a hierarchical command structure generally adhering to this pattern:

`hctl <verb> <object> [additional classification]`

E.g. to see the details of a particular Provider, use this command:

`hctl get provider <type> <id>`

{{< alert context="info" >}}
All available commands are listed and explained in the CLI online help. Use the `-h` or `--help` flag to see usage details on any command level, e.g.:

`hctl get provider -h`
{{< /alert >}}
