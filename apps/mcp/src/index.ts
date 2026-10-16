#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { CommitType, WorkDomain } from "@volt/types";
import {
  handleVoltCommitWorkTool,
  handleVoltGetStatusTool,
  handleVoltStageLogTool,
  handleVoltVerifyCoAuthorTool,
} from "./tools/mcp-tools";

export const VOLT_MCP_TOOLS = [
  {
    name: "volt_stage_log",
    description:
      "Stage a completed micro-task or research observation into the Volt staging buffer.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Description of the micro-task" },
        github_pr_url: {
          type: "string",
          description: "Optional GitHub PR or commit URL",
        },
      },
      required: ["text"],
    },
  },
  {
    name: "volt_commit_work",
    description:
      "Bundle staged micro-logs into a scored output or insight commit evaluated by the Volt Math Engine.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["output", "insight"] },
        domain: {
          type: "string",
          enum: ["engineering", "research", "ops", "finance", "pitch"],
        },
        summary: { type: "string" },
        github_pr_url: { type: "string" },
        co_authors: { type: "array", items: { type: "string" } },
      },
      required: ["type", "summary"],
    },
  },
  {
    name: "volt_get_status",
    description:
      "Retrieve current staged logs, pending co-author handshakes, and active cycle pool share.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "volt_verify_coauthor",
    description:
      "Verify or reject a co-author tag on a teammate's commit with a 1-line contribution note.",
    inputSchema: {
      type: "object",
      properties: {
        short_hash: { type: "string" },
        action: { type: "string", enum: ["verify", "reject"] },
        contribution_note: { type: "string" },
      },
      required: ["short_hash", "action"],
    },
  },
] as const;

export function createVoltMcpServer(): Server {
  const server = new Server(
    { name: "volt-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...VOLT_MCP_TOOLS],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, string | string[] | undefined>;

    if (name === "volt_stage_log") {
      const textOut = await handleVoltStageLogTool({
        text: String(args["text"] ?? ""),
        github_pr_url:
          typeof args["github_pr_url"] === "string"
            ? args["github_pr_url"]
            : undefined,
      });
      return { content: [{ type: "text", text: textOut }] };
    }

    if (name === "volt_commit_work") {
      const textOut = await handleVoltCommitWorkTool({
        type: (args["type"] as CommitType | undefined) ?? "output",
        domain: args["domain"] as WorkDomain | undefined,
        summary: String(args["summary"] ?? ""),
        github_pr_url:
          typeof args["github_pr_url"] === "string"
            ? args["github_pr_url"]
            : undefined,
        co_authors: Array.isArray(args["co_authors"]) ? args["co_authors"] : undefined,
      });
      return { content: [{ type: "text", text: textOut }] };
    }

    if (name === "volt_get_status") {
      const textOut = await handleVoltGetStatusTool();
      return { content: [{ type: "text", text: textOut }] };
    }

    if (name === "volt_verify_coauthor") {
      const textOut = await handleVoltVerifyCoAuthorTool({
        short_hash: String(args["short_hash"] ?? ""),
        action: args["action"] === "reject" ? "reject" : "verify",
        contribution_note:
          typeof args["contribution_note"] === "string"
            ? args["contribution_note"]
            : undefined,
      });
      return { content: [{ type: "text", text: textOut }] };
    }

    return {
      content: [{ type: "text", text: `Unsupported tool: ${name}` }],
      isError: true,
    };
  });

  return server;
}

if (import.meta.main) {
  const srv = createVoltMcpServer();
  const transport = new StdioServerTransport();
  srv.connect(transport).catch((err: Error) => {
    console.error("[FATAL] volt-mcp failed:", err.message);
    process.exit(1);
  });
}
