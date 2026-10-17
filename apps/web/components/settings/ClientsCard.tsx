import { Card, Typography } from "@heroui/react";

const STEPS = [
  { title: "CLI", command: "volt auth login", note: "Stage with `volt add`, bundle with `volt commit`." },
  { title: "MCP server", command: "volt-mcp --key $VOLT_API_KEY", note: "Log work from Claude, Cursor or Antigravity." },
  { title: "Mac overlay", command: "Cmd + Shift + L", note: "Quick capture from anywhere on macOS." },
] as const;

export function ClientsCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Capture clients</Card.Title>
        <Card.Description>Every client writes to the same staging buffer you see on Home.</Card.Description>
      </Card.Header>
      <Card.Content className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="flex flex-col gap-2">
            <span className="text-sm font-medium">{step.title}</span>
            <Typography.Code>{step.command}</Typography.Code>
            <span className="text-xs text-muted">{step.note}</span>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
