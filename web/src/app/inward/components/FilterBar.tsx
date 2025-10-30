'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface InwardFilterBarProps {
  onFilterChange: (filters: any) => void;
  materials?: string[]; // optional dynamic list from backend
}

export default function InwardFilterBar({
  onFilterChange,
  materials = [],
}: InwardFilterBarProps) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    sort: 'desc', // backend expects asc/desc
  });

  // Debounce search input for smoother UX (500ms)
  useEffect(() => {
    const delay = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const reset = { search: '', status: 'All', sort: 'desc' };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <Card className="p-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* 🔍 Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Search Material
          </label>
          <Input
            placeholder="Enter material name..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="bg-white"
          />
        </div>

        {/* 🔽 Sort Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Sort By
          </label>
          <Select
            value={filters.sort}
            onValueChange={(v) => handleChange('sort', v)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🧩 Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={(v) => handleChange('status', v)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🧭 Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onFilterChange(filters)}
            className="w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full md:w-auto flex-1"
          >
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
