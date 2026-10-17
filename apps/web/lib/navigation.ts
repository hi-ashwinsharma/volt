import { AppRoutes, type NavSection } from "@volt/types";

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    title: "Personal",
    items: [
      { label: "Home", href: AppRoutes.home, icon: "home", scope: null },
      { label: "My work", href: AppRoutes.myWork, icon: "work", scope: "commit:create" },
      {
        label: "Co-author requests",
        href: AppRoutes.handshakes,
        icon: "handshake",
        scope: "commit:verify_coauthor",
        badge: "handshakes",
      },
    ],
  },
  {
    title: "Team",
    items: [{ label: "Ledger", href: AppRoutes.ledger, icon: "ledger", scope: "feed:read" }],
  },
  {
    title: "Governance",
    items: [
      {
        label: "Review queue",
        href: AppRoutes.reviews,
        icon: "review",
        scope: "commit:review_peer",
        badge: "reviews",
      },
    ],
  },
  {
    title: "Compensation",
    items: [{ label: "Cycles", href: AppRoutes.cycles, icon: "cycles", scope: "cycle:read" }],
  },
  {
    title: "Admin",
    items: [
      { label: "Members", href: AppRoutes.adminMembers, icon: "members", scope: "user:manage" },
      { label: "Policies", href: AppRoutes.adminPolicies, icon: "policies", scope: "policy:admin" },
      {
        label: "Integrations",
        href: AppRoutes.adminIntegrations,
        icon: "integrations",
        scope: "github:connect",
      },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  return href === AppRoutes.home ? pathname === href : pathname.startsWith(href);
}
