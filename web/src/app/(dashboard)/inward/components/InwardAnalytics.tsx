'use client';

import { useMemo } from 'react';
import { useMaterialStock } from '@/hooks/useMaterialStock';
import { useInwardAnalytics } from '@/hooks/useInwardAnalytics';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { Card } from '@/components/ui/card';
import type { Inward } from '@/types/inward';

export default function InwardAnalytics({ rows }: { rows: Inward[] }) {
  const { data: analytics, isLoading: loadingAnalytics } = useInwardAnalytics();

  const COLORS = [
    '#60a5fa',
    '#34d399',
    '#f59e0b',
    '#f472b6',
    '#a78bfa',
    '#22d3ee',
    '#fb7185',
  ];

  // --- Material Stock Pie Chart Data ---
  const { data: materialStockData } = useMaterialStock();
  const materialStock = useMemo(() => {
    return materialStockData?.map((stock) => ({
      name: stock.materialName,
      qty: stock.totalQuantity,
    }));
  }, [materialStockData]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Left side — KPIs + Suppliers */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Materials</div>
            <div className="text-2xl font-semibold">
              {loadingAnalytics ? '...' : analytics?.totalMaterials ?? 0}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-semibold text-green-600">
              {loadingAnalytics ? '...' : analytics?.active ?? 0}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-gray-500">Expired</div>
            <div className="text-2xl font-semibold text-red-600">
              {loadingAnalytics ? '...' : analytics?.expired ?? 0}
            </div>
          </Card>
        </div>

        {/* Top Suppliers by Quantity */}
        <Card className="p-4 flex-1">
          <div className="font-medium mb-3">Top Suppliers by Quantity</div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topSuppliers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="qty" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Right side — Materials Pie Chart */}
      <Card className="p-4">
        <div className="font-medium mb-3">Quantity by Material</div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip />
              <Pie
                data={materialStock}
                dataKey="qty"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
              >
                {materialStock?.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
