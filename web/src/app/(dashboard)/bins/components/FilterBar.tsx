'use client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function FilterBar() {
  return (
    <div className="flex flex-wrap items-center justify-between bg-gray-50 border rounded-lg p-3 mb-4 gap-2">
      <div className="flex gap-3 flex-1">
        <Input placeholder="Search Bin or Material" className="max-w-xs" />
        <Select defaultValue="Newest">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Newest">Newest First</SelectItem>
            <SelectItem value="Oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button className="text-white bg-blue-600 hover:bg-blue-700">
          Search
        </Button>
        <Button variant="outline">Reset</Button>
      </div>
    </div>
  );
}
