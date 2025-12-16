'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export type FilterValues = {
  search?: string;
  status?: string;
  sort?: string;
};

interface FilterBarProps {
  filters?: FilterValues;
  setFilters?: (updater: (prev: FilterValues) => FilterValues) => void;
  onChange?: (filters: FilterValues) => void;
  placeholder?: string;
  showStatus?: boolean;
  statusOptions?: string[];
  className?: string;
}

export default function FilterBar({
  filters: controlledFilters,
  setFilters,
  onChange,
  placeholder = 'Search',
  showStatus = true,
  statusOptions = ['All', 'Active', 'Expired'],
  className = '',
}: FilterBarProps) {
  //   const isControlled = typeof setFilters === 'function' || !!controlledFilters;

  const [local, setLocal] = useState<FilterValues>({
    search: '',
    status: 'All',
    sort: 'desc',
  });

  useEffect(() => {
    if (controlledFilters) {
      setLocal((l) => ({ ...l, ...controlledFilters }));
    }
  }, [controlledFilters]);

  const getValue = (key: keyof FilterValues) =>
    (controlledFilters ? controlledFilters[key] : local[key]) ?? '';

  const update = (changes: Partial<FilterValues>) => {
    if (setFilters) {
      setFilters((prev) => ({ ...prev, ...changes }));
    } else {
      setLocal((prev) => {
        const next = { ...prev, ...changes };
        onChange?.(next);
        return next;
      });
    }
  };

  const handleSearch = () => {
    // Trigger onChange for uncontrolled mode, controlled mode already updated
    onChange?.(controlledFilters ? controlledFilters : local);
  };

  const handleReset = () => {
    const reset = { search: '', status: 'All', sort: 'desc' };
    if (setFilters) {
      setFilters(() => reset);
    } else {
      setLocal(reset);
      onChange?.(reset);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 shadow-sm p-4 rounded-lg flex gap-4 items-end flex-wrap ${className}`}
    >
      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          {placeholder}
        </label>
        <Input
          value={getValue('search')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            update({ search: e.target.value })
          }
          placeholder={placeholder}
          className="border-gray-300"
        />
      </div>

      {showStatus && (
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={getValue('status') || 'All'}
            onValueChange={(v) => update({ status: v })}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-[200px]">
        <label className="text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <Select
          value={getValue('sort') || 'desc'}
          onValueChange={(v) => update({ sort: v })}
        >
          <SelectTrigger className="border-gray-300">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-10"
          onClick={handleSearch}
        >
          Search
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
