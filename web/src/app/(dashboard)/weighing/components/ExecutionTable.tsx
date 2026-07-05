'use client';

import { Card } from '@/components/global';
import { Button } from '@/components/ui/button';
import { ExecutionItem, ExecutionStatus } from '../types/execution';
import { QrCode, Pencil, Trash2 } from 'lucide-react';

interface ExecutionTableProps {
  executions: ExecutionItem[];
  onPrintAll: (execution: ExecutionItem) => void;
  onPrintBatch: (execution: ExecutionItem) => void;
  onEdit: (execution: ExecutionItem) => void;
  onDelete: (execution: ExecutionItem) => void;
}

const statusStyles: Record<ExecutionStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function ExecutionTable({
  executions,
  onPrintAll,
  onPrintBatch,
  onEdit,
  onDelete,
}: ExecutionTableProps) {
  return (
    <Card noPadding>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Execution Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Recipe Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Number Of Batches
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {executions.map((execution) => {
              const isReadOnly = execution.status !== 'PENDING';

              return (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {execution.executionNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {execution.recipeName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {execution.batchCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusStyles[execution.status]
                      }`}
                    >
                      {execution.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => onPrintAll(execution)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="border-amber-200 text-amber-600 hover:bg-amber-50"
                          disabled={isReadOnly}
                          onClick={() => onEdit(execution)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={isReadOnly}
                          onClick={() => onDelete(execution)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
