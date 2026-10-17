import type { ChildrenProps } from "@volt/types";

import { AppShell } from "@/components/shell/AppShell";
import { AuthGate } from "@/components/session/AuthGate";

export default function WorkspaceLayout({ children }: ChildrenProps) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
