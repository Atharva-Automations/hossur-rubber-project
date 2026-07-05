'use client';

import { Header, PageContainer } from '@/components/global';
import { WeighingTabs } from './components/WeighingTabs';

export default function WeighingPage() {
  return (
    <PageContainer>
      <Header
        title="Weighing"
        description="Manage and monitor weighing operations"
        icon="🔄"
      />

      <div className="mt-8">
        <WeighingTabs />
      </div>
    </PageContainer>
  );
}
