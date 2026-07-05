'use client';

import { useState } from 'react';
import { Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { BulkWeighing } from './BulkWeighing';
import { SequentialWeighing } from './SequentialWeighing';
import { WeighingHistory } from './WeighingHistory';

type WeighingTab = 'bulk' | 'sequential' | 'history';

export function WeighingTabs() {
  const [activeTab, setActiveTab] = useState<WeighingTab>('bulk');

  return (
    <div className="space-y-6">
      <Card className="inline-flex w-full flex-wrap items-center gap-2 border border-gray-200 bg-gray-50 p-2">
        <Button
          variant={activeTab === 'bulk' ? 'default' : 'outline'}
          className={
            activeTab === 'bulk' ? 'bg-blue-600 hover:bg-blue-700' : ''
          }
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Weighing
        </Button>
        <Button
          variant={activeTab === 'sequential' ? 'default' : 'outline'}
          className={
            activeTab === 'sequential' ? 'bg-blue-600 hover:bg-blue-700' : ''
          }
          onClick={() => setActiveTab('sequential')}
        >
          Sequential Weighing
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'outline'}
          className={
            activeTab === 'history' ? 'bg-blue-600 hover:bg-blue-700' : ''
          }
          onClick={() => setActiveTab('history')}
        >
          History
        </Button>
      </Card>

      {activeTab === 'bulk' ? (
        <BulkWeighing />
      ) : activeTab === 'sequential' ? (
        <SequentialWeighing />
      ) : (
        <WeighingHistory />
      )}
    </div>
  );
}
