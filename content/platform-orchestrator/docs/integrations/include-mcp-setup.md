---
type: docs
description: "MCP Server setup section"
draft: true # This page is made for being included in other pages, not standalone
---

URL: `{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}`

Convenience shortcuts for connecting popular tools are available in the Search & AI widget. <a onclick="window.Kapa.open()" href="#">Open the widget</a> and select the "Use MCP" dropdown.

Or choose your tool here:

<!-- List adopted from https://docs.kapa.ai/dev/kapa-mcp -->

{{< tabs >}}
{{% tab name="Cursor" %}}

Add the following segment to your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "humanitec-orchestrator-v__INCLUDE_PARAM1__": {
      "type": "http",
      "url": "{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}"
    }
  }
}
```

{{% /tab %}}
{{% tab name="VS Code" %}}

Prerequisites: VS Code 1.102+ with GitHub Copilot enabled

Create or expand a `mcp.json` file in your workspace `.vscode` folder:

```json
{
  "servers": {
    "humanitec-orchestrator-v__INCLUDE_PARAM1__": {
      "type": "http",
      "url": "{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}"
    }
  }
}
```

{{% /tab %}}
{{% tab name="Claude Code" %}}

Run the following command in your terminal:

```bash
claude mcp add --transport http humanitec-orchestrator-v__INCLUDE_PARAM1__ {{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}
```

{{% /tab %}}
{{% tab name="ChatGTP Desktop" %}}

ChatGPT Desktop supports MCP servers in developer mode:

- Open ChatGPT Desktop
- Go to **Settings** > **Features**
- Enable Developer mode
- Navigate to **Settings** > **MCP Servers**
- Click **Add Server** and enter:
  - Name: `humanitec-orchestrator-v__INCLUDE_PARAM1__`
  - URL: `{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}`

For more information, see the [ChatGPT Desktop MCP documentation](https://platform.openai.com/docs/guides/developer-mode).

{{% /tab %}}
{{% tab name="Claude Desktop" %}}

Add this segment to your Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

- Linux: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "humanitec-orchestrator-v__INCLUDE_PARAM1__": {
      "type": "http",
      "url": "{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}"
    }
  }
}
```

Restart Claude Desktop for changes to take effect.

For more details, see the [Claude Desktop documentation](https://code.claude.com/docs/en/desktop).

{{% /tab %}}
{{% tab name="Cline" %}}

- Open Cline
- Select **MCP Servers**
- Select **Configure**
- Select **Configure MCP Servers**

Add this segment to the newly opened `cline_mcp_settings.json` file:

```json
{
  "mcpServers": {
    "humanitec-orchestrator-v__INCLUDE_PARAM1__": {
      "disabled": false,
      "timeout": 60,
      "type": "streamableHttp",
      "url": "{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}"
    }
  }
}
```

{{% /tab %}}
{{% tab name="Other" %}}

MCP is an open protocol supported by many clients.

Use the server URL `{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}` and refer to your client's documentation for setup instructions.

Most clients accept the standard MCP JSON configuration format:

```json
{
  "mcpServers": {
    "humanitec-orchestrator-v__INCLUDE_PARAM1__": {
      "url": "{{< param KapaMCPknowledgeV__INCLUDE_PARAM1__Url >}}"
    }
  }
}
```

{{% /tab %}}
{{< /tabs >}}
