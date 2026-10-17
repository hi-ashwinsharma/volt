"use client";

import { Spinner } from "@heroui/react";
import { AppRoutes, type ChildrenProps } from "@volt/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/hooks/useSession";

export function AuthGate({ children }: ChildrenProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(AppRoutes.signIn);
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner aria-label="Loading workspace" />
      </div>
    );
  }
  return <>{children}</>;
}
