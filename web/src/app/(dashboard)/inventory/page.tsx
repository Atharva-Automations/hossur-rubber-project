'use client';

import { Header, PageContainer, Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useEffect, useState } from 'react';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function InventoryDashboard() {
  const summary = [
    { title: 'Total Inward', value: '12,430 KG', color: 'text-blue-600' },
    { title: 'Total Outward', value: '9,875 KG', color: 'text-orange-600' },
    { title: 'Active Production Scans', value: '42', color: 'text-green-600' },
    { title: 'Ingredients in Stock', value: '18', color: 'text-purple-600' },
  ];

  const flowData = [
    { name: 'Jan', Inward: 2000, Outward: 1800, Consumed: 1500 },
    { name: 'Feb', Inward: 2400, Outward: 2000, Consumed: 1700 },
    { name: 'Mar', Inward: 3000, Outward: 2600, Consumed: 2000 },
  ];

  const stockComposition = [
    { name: 'Fillers', value: 400 },
    { name: 'Accelerators', value: 300 },
    { name: 'Polymers', value: 300 },
    { name: 'Additives', value: 200 },
  ];
  const COLORS = ['#3b82f6', '#f97316', '#22c55e', '#a855f7'];

  const [bins, setBins] = useState<
    { binNumber: string; currentQty: number; maxQty: number }[]
  >([]);

  useEffect(() => {
    // Generate random bins only on client after hydration
    const generated = Array.from({ length: 8 }).map((_, i) => ({
      binNumber: `B-${(i + 1).toString().padStart(2, '0')}`,
      currentQty: Math.floor(Math.random() * 90) + 5,
      maxQty: 100,
    }));
    setBins(generated);
  }, []);

  const lowStock = [
    { ingredient: 'Zinc Oxide', currentQty: 45, minQty: 50, unit: 'KG' },
    { ingredient: 'Stearic Acid', currentQty: 20, minQty: 30, unit: 'KG' },
  ];

  const layout = [
    { i: 'summary', x: 0, y: 0, w: 12, h: 2 },
    { i: 'flow', x: 0, y: 2, w: 6, h: 4 },
    { i: 'composition', x: 6, y: 2, w: 6, h: 4 },
    { i: 'bins', x: 0, y: 6, w: 12, h: 4 },
    { i: 'alerts', x: 0, y: 10, w: 12, h: 3 },
  ];

  return (
    <PageContainer>
      <Header
        title="Inventory Dashboard"
        description="Monitor material flow, stock levels, and bin utilization"
        icon="📦"
      />

      <div className="mt-8">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={80}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
        >
          {/* Summary Cards */}
          <div key="summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summary.map((item, i) => (
                <Card key={i}>
                  <h4 className="text-sm text-gray-600 font-medium">
                    {item.title}
                  </h4>
                  <p className={`text-2xl font-bold mt-2 ${item.color}`}>
                    {item.value}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Material Flow */}
          <div key="flow">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Material Flow (Inward vs Outward vs Consumed)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={flowData}>
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="Inward" fill="#3b82f6" />
                  <Bar dataKey="Outward" fill="#f97316" />
                  <Bar dataKey="Consumed" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Composition */}
          <div key="composition">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Stock Composition by Ingredient Type
              </h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stockComposition}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      {stockComposition.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Bin Utilization */}
          <div key="bins">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                Bin Utilization Overview
              </h3>
              <div className="space-y-3">
                {bins.map((bin) => {
                  const fillPercent = Math.min(
                    100,
                    Math.round((bin.currentQty / bin.maxQty) * 100)
                  );
                  const color =
                    fillPercent < 30
                      ? 'bg-red-500'
                      : fillPercent < 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500';
                  return (
                    <div key={bin.binNumber}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">
                          {bin.binNumber}
                        </span>
                        <span className="text-gray-600">{fillPercent}%</span>
                      </div>
                      <Progress
                        value={fillPercent}
                        className={`h-2 ${color}`}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Low Stock Alerts */}
          <div key="alerts">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Low Stock Alerts
                </h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-sm text-gray-600">
                  All ingredients are sufficiently stocked.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-700 border-b border-gray-200">
                      <th className="pb-2">Ingredient</th>
                      <th className="pb-2">Current Qty</th>
                      <th className="pb-2">Min Qty</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 last:border-none hover:bg-gray-50"
                      >
                        <td className="py-2 text-gray-900">
                          {item.ingredient}
                        </td>
                        <td className="text-gray-700">
                          {item.currentQty} {item.unit}
                        </td>
                        <td className="text-gray-700">
                          {item.minQty} {item.unit}
                        </td>
                        <td>
                          <span className="text-red-600 font-medium">
                            Below Min
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>
    </PageContainer>
  );
}
