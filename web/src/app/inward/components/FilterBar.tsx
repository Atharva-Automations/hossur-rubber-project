"use client";

// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Search } from "lucide-react";

// Mock materials — will come from backend later
const materialsList = ["Zinc Oxide", "Carbon Black", "Stearic Acid", "Sulphur", "Silica"];

export default function InwardFilterBar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [filters, setFilters] = useState({
    material: "",
    sort: "date",
    status: "all",
  });

  const handleChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const reset = { material: "", sort: "date", status: "all" };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <Card className="p-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Material Search Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Search Material</label>
          <Select
            value={filters.material}
            onValueChange={(v) => handleChange("material", v)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60 overflow-y-auto">
              {materialsList.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Sort By</label>
          <Select
            value={filters.sort}
            onValueChange={(v) => handleChange("sort", v)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="qty-high">Quantity (High → Low)</SelectItem>
              <SelectItem value="qty-low">Quantity (Low → High)</SelectItem>
              <SelectItem value="name">Material Name (A → Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
          <Select
            value={filters.status}
            onValueChange={(v) => handleChange("status", v)}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onFilterChange(filters)}
            className="w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full md:w-auto flex-1">
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
