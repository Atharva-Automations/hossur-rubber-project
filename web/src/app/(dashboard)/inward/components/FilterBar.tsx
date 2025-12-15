import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface FilterState {
  search: string;
  status: string;
  sort: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: (updater: (prev: FilterState) => FilterState) => void;
}

export default function FilterBar({ filters, setFilters }: FilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-lg flex gap-4 items-end flex-wrap">
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Search Material
        </label>
        <Input
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          placeholder="Enter material name..."
          className="border-gray-300"
        />
      </div>

      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger className="border-gray-300">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <Select
          value={filters.sort}
          onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
        >
          <SelectTrigger className="border-gray-300">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white h-10"
        onClick={() => setFilters((f) => ({ ...f }))}
      >
        Search
      </Button>
    </div>
  );
}
