import { Skeleton } from "@heroui/react";
import type { ListSkeletonProps } from "@volt/types";

export function ListSkeleton({ rows = 5 }: ListSkeletonProps) {
  return (
    <div aria-busy aria-label="Loading" className="flex flex-col gap-3 p-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded" />
            <Skeleton className="h-3 w-2/5 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}
