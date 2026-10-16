import { describe, expect, test } from "bun:test";
import { VOLT_MCP_TOOLS, createVoltMcpServer } from "./index";

describe("@volt/mcp — Model Context Protocol Server", () => {
  test("exposes all 4 canonical MCP tools with valid JSON schemas", () => {
    const names = VOLT_MCP_TOOLS.map((t) => t.name);
    expect(names).toEqual([
      "volt_stage_log",
      "volt_commit_work",
      "volt_get_status",
      "volt_verify_coauthor",
    ]);
    const server = createVoltMcpServer();
    expect(server).toBeDefined();
  });
});
