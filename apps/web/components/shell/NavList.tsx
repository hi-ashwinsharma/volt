"use client";

import { Chip, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import type { NavListProps } from "@volt/types";
import NextLink from "next/link";

import { NavIcon } from "./NavIcon";

import { useSession } from "@/hooks/useSession";
import { isActivePath, NAV_SECTIONS } from "@/lib/navigation";

export function NavList({ pathname, counts, onNavigate }: NavListProps) {
  const { hasScope } = useSession();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-5">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((item) => item.scope === null || hasScope(item.scope));
        if (items.length === 0) {
          return null;
        }
        return (
          <div key={section.title} className="flex flex-col gap-0.5">
            <Typography.Paragraph className="px-3 pb-1 font-medium" color="muted" size="xs">
              {section.title}
            </Typography.Paragraph>
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const count = item.badge ? counts[item.badge] : 0;
              return (
                <NextLink
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  className={buttonVariants({
                    variant: active ? "secondary" : "ghost",
                    size: "sm",
                    fullWidth: true,
                    className: "justify-start gap-2.5",
                  })}
                  href={item.href}
                  onClick={onNavigate}
                >
                  <NavIcon icon={item.icon} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {count > 0 ? (
                    <Chip color="warning" size="sm" variant="soft">
                      {count}
                    </Chip>
                  ) : null}
                </NextLink>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
