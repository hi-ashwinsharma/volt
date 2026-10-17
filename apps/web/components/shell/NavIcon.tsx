import {
  Briefcase,
  ChartColumn,
  Gear,
  House,
  Layers,
  ListUl,
  Persons,
  PersonPlus,
  PlugConnection,
  ShieldCheck,
} from "@gravity-ui/icons";
import type { NavIconProps } from "@volt/types";

const ICONS = {
  home: House,
  work: Briefcase,
  handshake: PersonPlus,
  ledger: ListUl,
  review: ShieldCheck,
  cycles: ChartColumn,
  members: Persons,
  policies: Layers,
  integrations: PlugConnection,
  settings: Gear,
} as const;

export function NavIcon({ icon }: NavIconProps) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden className="size-4 shrink-0" />;
}
