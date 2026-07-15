'use client';

import { useState } from 'react';
import { Header, PageContainer } from '@/components/global';
import { Button } from '@/components/ui/button';
import QcSpecificationTab from './components/QcSpecificationTab';
import QcInspectionTab from './components/QcInspectionTab';

export default function QcPage() {
  const [activeTab, setActiveTab] = useState<'specification' | 'inspection'>(
    'specification'
  );

  return (
    <PageContainer>
      <Header
        title="Quality Control"
        description="Manage QC specifications and perform quality inspections"
        icon="🧪"
      />

      <div className="mt-8 flex gap-3 border-b pb-4">
        <Button
          variant={activeTab === 'specification' ? 'default' : 'outline'}
          onClick={() => setActiveTab('specification')}
        >
          QC Specifications
        </Button>

        <Button
          variant={activeTab === 'inspection' ? 'default' : 'outline'}
          onClick={() => setActiveTab('inspection')}
        >
          QC Inspection
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === 'specification' ? (
          <QcSpecificationTab />
        ) : (
          <QcInspectionTab />
        )}
      </div>
    </PageContainer>
  );
}
