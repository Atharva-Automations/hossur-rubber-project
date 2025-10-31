'use client';

import { Card } from '@/components/ui/card';

export default function OutwardDashboard() {
  // These values will come from backend later
  const totalIssues = 42;
  const pending = 5;
  const completed = 37;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-sm text-gray-500">Total Issues</div>
        <div className="text-2xl font-semibold">{totalIssues}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-gray-500">Pending</div>
        <div className="text-2xl font-semibold text-yellow-600">{pending}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-gray-500">Completed</div>
        <div className="text-2xl font-semibold text-green-600">{completed}</div>
      </Card>
    </div>
  );
}
