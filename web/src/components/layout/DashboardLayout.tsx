'use client';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-gray-50">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
