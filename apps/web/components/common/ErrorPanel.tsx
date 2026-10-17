import { Alert, Button } from "@heroui/react";
import type { ErrorPanelProps } from "@volt/types";

export function ErrorPanel({ title = "Could not load this data", message, onRetry }: ErrorPanelProps) {
  return (
    <Alert status="danger">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
      {onRetry ? (
        <Button size="sm" variant="danger-soft" onPress={onRetry}>
          Retry
        </Button>
      ) : null}
    </Alert>
  );
}
