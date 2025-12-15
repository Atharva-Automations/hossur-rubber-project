'use client';

import { Header, PageContainer } from '@/components/global';

export default function SettingsPage() {
  return (
    <PageContainer>
      <Header
        title="Settings"
        description="Configure system settings and preferences"
        icon="⚙️"
      />
    </PageContainer>
  );
}
