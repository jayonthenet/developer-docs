---
title: "CLI"
description: ""
lead: ""
draft: false
type: docs
weight: 60
toc: true
---

`octl` is the CLI for the Platform Orchestrator.

{{< alert context="info" >}}
Current CLI version: `{{< param octlVersion >}}`
{{< /alert >}}

## Installation

### Install octl on Linux

1. Download the latest release with the command

   {{< tabs >}}
   {{% tab name="x64-86" %}}

   ```shell
   curl -fLO https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_linux_amd64.tar.gz
   tar xvzf platform-orchestrator-cli_{{< param octlVersion >}}_linux_amd64.tar.gz
   rm platform-orchestrator-cli_{{< param octlVersion >}}_linux_amd64.tar.gz README.md
   ```

   {{< /tab >}}
   {{% tab name="ARM64" %}}

   ```shell
   curl -fLO https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_linux_arm64.tar.gz
   tar xvzf platform-orchestrator-cli_{{< param octlVersion >}}_linux_arm64.tar.gz
   rm platform-orchestrator-cli_{{< param octlVersion >}}_linux_arm64.tar.gz README.md
   ```

   {{< /tab >}}
   {{< /tabs >}}

2. Install octl

   ```shell
   sudo install -o root -g root -m 0755 octl /usr/local/bin/octl
   ```

   {{< alert context="info" >}}
   **Note**

   If you do not have root access on the target system, you can still install octl to the `~/.local/bin` directory:

   ```shell
   chmod +x octl
   mkdir -p ~/.local/bin
   mv ./octl ~/.local/bin/octl
   # and then append (or prepend) ~/.local/bin to $PATH
   ```

   {{< /alert >}}

### Install octl on macOS

1. Download the latest release with the command

   {{< tabs >}}
   {{% tab name="Intel" %}}

   ```shell
   curl -fLO https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_darwin_amd64.tar.gz
   tar xvzf platform-orchestrator-cli_{{< param octlVersion >}}_darwin_amd64.tar.gz
   rm platform-orchestrator-cli_{{< param octlVersion >}}_darwin_amd64.tar.gz README.md
   ```

   {{< /tab >}}
   {{% tab name="Apple Silicon" %}}

   ```shell
   curl -fLO https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_darwin_arm64.tar.gz
   tar xvzf platform-orchestrator-cli_{{< param octlVersion >}}_darwin_arm64.tar.gz
   rm platform-orchestrator-cli_{{< param octlVersion >}}_darwin_arm64.tar.gz README.md
   ```

   {{< /tab >}}
   {{< /tabs >}}

2. Install octl

   ```shell
   chmod +x ./octl
   sudo mv ./octl /usr/local/bin/octl
   sudo chown root: /usr/local/bin/octl
   ```

### Install octl on Windows

1. Download the [latest release](https://github.com/stellwerk-labs/platform-orchestrator-cli/releases/download/v{{< param octlVersion >}}/platform-orchestrator-cli_{{< param octlVersion >}}_windows_amd64.zip).

2. Decompress the zip file, and move the binary to your PATH.

### Available as Docker Image

octl is also published as a [Docker image](https://github.com/stellwerk-labs/platform-orchestrator-cli/pkgs/container/octl), which can be used like `docker run --rm -it ghcr.io/stellwerk-labs/octl:{{< param octlVersion >}}`.

## Validate your installation

Run `octl --version` to ensure `octl` is in your path. Expected output, matching your installed version:
`octl version github.com/stellwerk-labs/platform-orchestrator-cli <version XX.YY.ZZ> <commit-hash> <commit-date>`

## CLI cheat sheet

An overview of common and useful CLI commands is available in the [CLI cheat sheet]({{< relref "/platform-orchestrator/docs/reference/cli-cheat-sheet" >}}).

## Authentication

{{< include "/platform-orchestrator/docs/security/include-cli-authentication.md" >}}

## Configuration

`octl` will maintain a local configuration in a config file located at `~/.config/octl/config.yaml`. Use the command `octl config` or the list below to see available configuration items.

Each configuration item can be overridden using an Environment Variable.

The command `octl config show` displays the _effective_ configuration, taking any override into account.

| Config item      | Environment variable   | CLI command             | Description                                                                                                                                                                      | Default | Mandatory |
| ---------------- | ---------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------- |
| `default_org_id` | `PO_ORG_ID`        | `octl config set-org`   | The id of the Organization in which to run commands                                                                                                                              | ""      | Yes       |
| `api_url`        | `PO_API_URL`    | `octl config set-url`   | The base URL of the Orchestrator API. Set to your internal endpoint when [self-hosting]({{< relref "/platform-orchestrator/docs/architecture/self-hosting" >}}) the Orchestrator | ""      | Yes       |
| `token`          | `PO_AUTH_TOKEN` | `octl config set-token` | An authentication token. The session token obtained via `octl login` will be written into this property                                                                          | ""      | Yes       |

## Commands

`octl` follows a hierarchical command structure generally adhering to this pattern:

`octl <verb> <object> [additional classification]`

E.g. to see the details of a particular Provider, use this command:

`octl get provider <type> <id>`

{{< alert context="info" >}}
All available commands are listed and explained in the CLI online help. Use the `-h` or `--help` flag to see usage details on any command level, e.g.:

`octl get provider -h`
{{< /alert >}}
