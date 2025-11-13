'use client';

export default function Topbar() {
  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3">
      <h1 className="font-semibold text-lg">Dashboard</h1>
      <div className="flex items-center space-x-3">
        <span className="text-gray-600">Admin</span>
      </div>
    </header>
  );
}
