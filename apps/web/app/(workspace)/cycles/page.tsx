"use client";

import { ArrowDownToLine } from "@gravity-ui/icons";
import { Button, toast } from "@heroui/react";
import {
  ApiRoutes,
  buildApiRoute,
  type BillingCycleRecord,
  type CyclePoolShareSummary,
} from "@volt/types";
import { useState } from "react";

import { EmptyPanel } from "@/components/common/EmptyPanel";
import { ErrorPanel } from "@/components/common/ErrorPanel";
import { ListSkeleton } from "@/components/common/ListSkeleton";
import { OptionSelect } from "@/components/common/OptionSelect";
import { PageHeader } from "@/components/common/PageHeader";
import { CreateCycleDialog } from "@/components/cycles/CreateCycleDialog";
import { CycleStats } from "@/components/cycles/CycleStats";
import { PoolShareTable } from "@/components/cycles/PoolShareTable";
import { useApiResource } from "@/hooks/useApiResource";
import { useSession } from "@/hooks/useSession";
import { apiDownload, errorMessage } from "@/lib/api-client";
import { CYCLE_STATUS_META } from "@/lib/labels";

export default function CyclesPage() {
  const { hasScope } = useSession();
  const canManage = hasScope("cycle:manage");
  const cycles = useApiResource<{ cycles: readonly BillingCycleRecord[] }>(ApiRoutes.cycles.list);
  const [selected, setSelected] = useState("active");
  const summary = useApiResource<{ summary: CyclePoolShareSummary | null }>(
    selected === "active"
      ? ApiRoutes.cycles.activePoolShare
      : buildApiRoute(ApiRoutes.cycles.detailPoolShare, { id: selected }),
  );
  const current = summary.data?.summary ?? null;

  const options = [
    { id: "active", label: "Active cycle" },
    ...(cycles.data?.cycles ?? []).map((cycle) => ({
      id: cycle.id,
      label: `${cycle.name} (${CYCLE_STATUS_META[cycle.status].label})`,
    })),
  ];

  const exportCsv = async () => {
    if (!current) {
      return;
    }
    try {
      await apiDownload(
        buildApiRoute(ApiRoutes.cycles.exportCsv, { id: current.cycleId }),
        `${current.cycleName}.csv`,
      );
    } catch (err) {
      toast.danger("Export failed", { description: errorMessage(err as Error) });
    }
  };

  return (
    <>
      <PageHeader
        actions={
          <>
            <div className="w-64">
              <OptionSelect label="Cycle" options={options} value={selected} onChange={setSelected} />
            </div>
            {canManage ? (
              <div className="flex items-end gap-2">
                <Button isDisabled={!current} size="sm" variant="secondary" onPress={() => void exportCsv()}>
                  <ArrowDownToLine className="size-4" />
                  Export CSV
                </Button>
                <CreateCycleDialog onCreated={cycles.reload} />
              </div>
            ) : null}
          </>
        }
        description="Each member's share of the bonus pool equals their approved points over the team total."
        title="Cycles"
      />
      <div className="flex flex-col gap-6">
        {summary.error ? <ErrorPanel message={summary.error} onRetry={summary.reload} /> : null}
        {summary.isLoading && !summary.data ? (
          <ListSkeleton rows={6} />
        ) : current ? (
          <>
            <CycleStats summary={current} />
            <PoolShareTable summary={current} />
          </>
        ) : (
          <EmptyPanel
            action={canManage ? <CreateCycleDialog onCreated={cycles.reload} /> : undefined}
            description="Create a cycle to start distributing the pool."
            title="No active cycle"
          />
        )}
      </div>
    </>
  );
}
