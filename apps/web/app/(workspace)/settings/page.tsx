"use client";

import { Tabs } from "@heroui/react";

import { PageHeader } from "@/components/common/PageHeader";
import { ApiKeysCard } from "@/components/settings/ApiKeysCard";
import { ClientsCard } from "@/components/settings/ClientsCard";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { useSession } from "@/hooks/useSession";

export default function SettingsPage() {
  const { me, refresh } = useSession();

  return (
    <>
      <PageHeader description="Your profile, credentials and connected capture clients." title="Settings" />
      <Tabs className="w-full" variant="secondary">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Settings sections">
            <Tabs.Tab id="profile">
              Profile
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="keys">
              API keys
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="clients">
              Clients
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel className="pt-6" id="profile">
          <ProfileCard />
        </Tabs.Panel>
        <Tabs.Panel className="pt-6" id="keys">
          <ApiKeysCard apiKeys={me?.apiKeys ?? []} onChange={refresh} />
        </Tabs.Panel>
        <Tabs.Panel className="pt-6" id="clients">
          <ClientsCard />
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
