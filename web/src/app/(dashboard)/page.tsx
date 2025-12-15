'use client';

import { Header, PageContainer, StatsGrid, Card } from '@/components/global';

export default function Index() {
  const stats = [
    { label: 'Production Today', value: '128 Batches', icon: '🏭' },
    { label: 'Inventory Level', value: '87%', icon: '📦' },
    { label: 'QC Pass Rate', value: '96%', icon: '✓' },
    { label: 'Active Recipes', value: '12', icon: '📝' },
  ];

  return (
    <PageContainer>
      <Header
        title="Dashboard"
        description="Welcome to the Rubber MES Production System"
        icon="📊"
      />

      <div className="mt-8">
        <StatsGrid>
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <h3 className="text-gray-600 text-sm font-medium">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          ))}
        </StatsGrid>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">• 12 batches completed today</p>
            <p className="text-gray-600">
              • Inventory restocked from Supplier A
            </p>
            <p className="text-gray-600">• 3 QC items pending review</p>
            <p className="text-gray-600">• New recipe added: Premium Mix v2</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-2 text-left text-blue-600 hover:bg-blue-50 rounded transition">
              → Start New Production Batch
            </button>
            <button className="w-full p-2 text-left text-blue-600 hover:bg-blue-50 rounded transition">
              → Check Material Status
            </button>
            <button className="w-full p-2 text-left text-blue-600 hover:bg-blue-50 rounded transition">
              → Review QC Reports
            </button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
