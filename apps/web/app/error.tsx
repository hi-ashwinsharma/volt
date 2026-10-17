"use client";

import { Button, Typography } from "@heroui/react";
import type { RouteErrorProps } from "@volt/types";

export default function RouteError({ error, reset }: RouteErrorProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <Typography.Heading level={4}>Something went wrong</Typography.Heading>
      <Typography.Paragraph color="muted" size="sm">
        {error.message}
      </Typography.Paragraph>
      <Button variant="secondary" onPress={reset}>
        Try again
      </Button>
    </div>
  );
}
