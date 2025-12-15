'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';

/* ----------------------------------------
 * Types
 * ------------------------------------- */

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableShellProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
}

/* ----------------------------------------
 * Component
 * ------------------------------------- */

export function DataTableShell<T>({
  data,
  columns,
  loading = false,
  className,
  onRowClick,
}: DataTableShellProps<T>) {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white', className)}
    >
      <Table>
        {/* HEADER */}
        <TableHeader>
          <TableRow className="border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className="text-gray-700 font-semibold"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody>
          {/* LOADING STATE */}
          {loading && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-gray-500"
              >
                Loading data...
              </TableCell>
            </TableRow>
          )}

          {/* EMPTY STATE */}
          {!loading && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-gray-500"
              >
                No records found
              </TableCell>
            </TableRow>
          )}

          {/* DATA ROWS */}
          {!loading &&
            data.map((row, index) => (
              <TableRow
                key={index}
                className="border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={String(col.key)} className="text-gray-900">
                    {col.render
                      ? col.render(row)
                      : // fallback for simple fields
                        (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
