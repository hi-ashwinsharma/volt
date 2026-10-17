import { Alert } from "@heroui/react";
import type { SignInAlertProps } from "@volt/types";

export function SignInAlert({ status, title, message }: SignInAlertProps) {
  return (
    <Alert status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
