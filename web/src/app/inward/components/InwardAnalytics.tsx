'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
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

export type InwardRow = {
  id: number;
  name: string;
  supplier: string;
  qty: number;
  unit: string;
  bags: number;
  date: string;
  status: 'Active' | 'Expired';
};

export default function InwardAnalytics({ rows }: { rows: InwardRow[] }) {
//   const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  // --- KPI totals ---
  const totals = useMemo(() => {
    const totalMaterials = rows.length;
    const active = rows.filter((r) => r.status === 'Active').length;
    const expired = rows.filter((r) => r.status === 'Expired').length;
    return { totalMaterials, active, expired };
  }, [rows]);

  // --- Quantity by Material ---
  const dataByMaterial = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.name, (map.get(r.name) ?? 0) + r.qty);
    }
    return Array.from(map.entries()).map(([name, qty]) => ({ name, qty }));
  }, [rows]);

  // --- Top Suppliers by Total Quantity ---
  const dataBySupplier = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.supplier, (map.get(r.supplier) ?? 0) + r.qty);
    }
    return Array.from(map.entries())
      .map(([supplier, qty]) => ({ supplier, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [rows]);

  const COLORS = [
    '#60a5fa',
    '#34d399',
    '#f59e0b',
    '#f472b6',
    '#a78bfa',
    '#22d3ee',
    '#fb7185',
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Left side — KPIs + Suppliers */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Materials</div>
            <div className="text-2xl font-semibold">
              {totals.totalMaterials}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Active</div>
            <div className="text-2xl font-semibold text-green-600">
              {totals.active}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Expired</div>
            <div className="text-2xl font-semibold text-red-600">
              {totals.expired}
            </div>
          </Card>
        </div>

        {/* Suppliers Chart fills remaining height */}
        <Card className="p-4 flex-1">
          <div className="font-medium mb-3">Top Suppliers by Quantity</div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBySupplier}>
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

      {/* Right side — Pie/Bar chart */}
      <Card className="p-4 ">
        <div className="flex items-center justify-between mb-10">
          <div className="font-medium">Quantity by Material</div>    
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Tooltip />
                <Pie
                    data={dataByMaterial}
                    dataKey="qty"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                >
                    {dataByMaterial.map((_, idx) => (
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
