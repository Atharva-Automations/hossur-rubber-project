'use client';

export default function OutwardDashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white border p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Total Issues</h3>
        <p className="text-2xl font-semibold">42</p>
      </div>
      <div className="bg-white border p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Pending</h3>
        <p className="text-2xl font-semibold text-yellow-600">5</p>
      </div>
      <div className="bg-white border p-4 rounded-lg">
        <h3 className="text-sm text-gray-500">Completed</h3>
        <p className="text-2xl font-semibold text-green-600">37</p>
      </div>
    </div>
  );
}
