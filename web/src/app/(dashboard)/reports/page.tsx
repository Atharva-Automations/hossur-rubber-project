'use client';

import { useMemo, useState } from 'react';
import { Header, PageContainer } from '@/components/global';

type Batch = {
  id: string;
  recipe: string;
  started: string;
  completed: string | null;
  status: 'Completed' | 'In Progress' | 'Monitoring' | 'Failed';
  materialKg: number;
};

const sampleBatches: Batch[] = [
  {
    id: 'B-10234',
    recipe: 'Compound-A',
    started: '2026-03-22',
    completed: '2026-03-22',
    status: 'Completed',
    materialKg: 1250,
  },
  {
    id: 'B-10235',
    recipe: 'Compound-B',
    started: '2026-03-22',
    completed: '2026-03-22',
    status: 'Completed',
    materialKg: 1100,
  },
  {
    id: 'B-10236',
    recipe: 'Compound-A',
    started: '2026-03-22',
    completed: '2026-03-22',
    status: 'Monitoring',
    materialKg: 1300,
  },
  {
    id: 'B-10237',
    recipe: 'Compound-C',
    started: '2026-03-22',
    completed: null,
    status: 'In Progress',
    materialKg: 900,
  },
  {
    id: 'B-10238',
    recipe: 'Compound-B',
    started: '2026-03-21',
    completed: '2026-03-21',
    status: 'Completed',
    materialKg: 980,
  },
];

const recipes = ['All', 'Compound-A', 'Compound-B', 'Compound-C'];
const statuses = ['All', 'Completed', 'In Progress', 'Monitoring', 'Failed'];

export default function ReportsPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [fromDate, setFromDate] = useState<string>('2026-03-21');
  const [toDate, setToDate] = useState<string>('2026-03-22');
  const [generated, setGenerated] = useState(false);

  const filteredBatches = useMemo(() => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return sampleBatches.filter((batch) => {
      const started = new Date(batch.started);

      const recipeMatches =
        selectedRecipe === 'All' || batch.recipe === selectedRecipe;
      const statusMatches =
        selectedStatus === 'All' || batch.status === selectedStatus;
      const dateMatches = started >= from && started <= to;

      return recipeMatches && statusMatches && dateMatches;
    });
  }, [selectedRecipe, selectedStatus, fromDate, toDate]);

  const totalFiltered = filteredBatches.length;
  const successCount = filteredBatches.filter(
    (b) => b.status === 'Completed'
  ).length;
  const successRate = totalFiltered
    ? Math.round((successCount / totalFiltered) * 100)
    : 0;
  const avgCycleTime = '2h 12m';

  const reportBatches = generated ? filteredBatches : sampleBatches;

  return (
    <PageContainer>
      <Header
        title="Reports"
        description="Generate and analyze production reports"
        icon="📊"
      />

      <section className="mt-6 space-y-4">
        <div className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
          <h2 className="text-lg font-semibold">
            Recipe Batch Execution Overview
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use filters to select report data and click Generate Report. Shows a
            demo report based on local mock data.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500">
                Recipe
              </label>
              <select
                className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                value={selectedRecipe}
                onChange={(e) => setSelectedRecipe(e.target.value)}
              >
                {recipes.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">
                Status
              </label>
              <select
                className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">
                From Date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500">
                To Date
              </label>
              <input
                type="date"
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              onClick={() => setGenerated(true)}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Generate Report
            </button>
            <span className="ml-3 text-xs text-slate-500">
              {generated
                ? `${totalFiltered} rows shown`
                : 'Defaults shown until generation.'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Batches</p>
              <p className="text-2xl font-bold">
                {generated ? totalFiltered : sampleBatches.length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Success Rate</p>
              <p className="text-2xl font-bold">
                {generated ? successRate : 94}%
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Avg Cycle Time</p>
              <p className="text-2xl font-bold">{avgCycleTime}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs uppercase text-slate-500">Late Alerts</p>
              <p className="text-2xl font-bold text-amber-600">3</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Batch ID</th>
                  <th className="px-3 py-2">Recipe</th>
                  <th className="px-3 py-2">Started</th>
                  <th className="px-3 py-2">Completed</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Total Material Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportBatches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-4 text-center text-slate-500"
                    >
                      No data found for selected filters.
                    </td>
                  </tr>
                ) : (
                  reportBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">{batch.id}</td>
                      <td className="px-3 py-2">{batch.recipe}</td>
                      <td className="px-3 py-2">{batch.started}</td>
                      <td className="px-3 py-2">{batch.completed ?? '-'}</td>
                      <td
                        className={`px-3 py-2 ${
                          batch.status === 'Completed'
                            ? 'text-emerald-700'
                            : batch.status === 'In Progress'
                            ? 'text-sky-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {batch.status}
                      </td>
                      <td className="px-3 py-2">
                        {batch.materialKg.toLocaleString()} kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            * This sample data is illustrative. Integrate with backend APIs when
            report data becomes available.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
