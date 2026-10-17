import { Thunderbolt } from "@gravity-ui/icons";
import { AppRoutes } from "@volt/types";
import NextLink from "next/link";

export function Brand() {
  return (
    <NextLink className="flex items-center gap-2.5" href={AppRoutes.home}>
      <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Thunderbolt aria-hidden className="size-4" />
      </span>
      <span className="text-base font-semibold tracking-tight">volt</span>
    </NextLink>
  );
}
