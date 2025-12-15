'use client';

import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function OutwardDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['outwardAnalytics'],
    queryFn: async () => (await api.get('/outward/analytics')).data,
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="text-sm text-gray-500">Total Issues</div>
        <div className="text-2xl font-semibold">{analytics.total}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-gray-500">Pending</div>
        <div className="text-2xl font-semibold text-yellow-600">
          {analytics.pending}
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-gray-500">Completed</div>
        <div className="text-2xl font-semibold text-green-600">
          {analytics.completed}
        </div>
      </Card>
    </div>
  );
}
