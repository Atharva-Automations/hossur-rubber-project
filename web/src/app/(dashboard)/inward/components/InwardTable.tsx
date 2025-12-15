import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Inward } from '@/types/inward';

import InwardActions from './InwardActions';

export default function InwardTable({ rows }: { rows: Inward[] }) {
  return (
    <div className="bg-[#F3F4F6] border border-gray-300 shadow-sm rounded-md">
      <Table>
        <TableHeader className="bg-gray-200">
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Bags</TableHead>
            <TableHead>Entry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-300 cursor-pointer transition"
            >
              <TableCell>{row.materialName}</TableCell>
              <TableCell>{row.supplierName}</TableCell>
              <TableCell>
                {row.quantity} {row.unit}
              </TableCell>
              <TableCell>{row.qrCodes?.length || 0}</TableCell>
              <TableCell>
                {new Date(row.createdAt).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    row.status === 'Active'
                      ? 'bg-green-200 text-green-700'
                      : 'bg-red-200 text-red-700'
                  }`}
                >
                  {row.status}
                </span>
              </TableCell>

              <TableCell>
                <InwardActions item={row} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
