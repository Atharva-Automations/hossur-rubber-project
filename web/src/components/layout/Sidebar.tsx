'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ArrowRightLeft,
  Layers,
  Boxes,
  BookOpen,
  LineChart,
  CheckSquare,
  FileText,
  Cpu,
  QrCode,
  Settings,
  PlayCircle,
} from 'lucide-react';

const menu = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Inward', href: '/inward', icon: ArrowRightLeft },
  { label: 'Outward', href: '/outward', icon: ArrowRightLeft },
  { label: 'Ingredients', href: '/ingredients', icon: Layers },
  { label: 'Bins', href: '/bins', icon: Boxes },
  { label: 'Recipes', href: '/recipes', icon: BookOpen },
  { label: 'Process Tracking', href: '/process', icon: LineChart },
  { label: 'QC', href: '/qc', icon: CheckSquare },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'PLC monitor', href: '/plc', icon: Cpu },
  { label: 'QR preview', href: '/qr-preview', icon: QrCode },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Simulation', href: '/simulation', icon: PlayCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--nav-bg)] text-[var(--nav-text)] flex flex-col border-r border-gray-200 shadow-sm">
      <div className="h-16 flex items-center px-6 text-lg font-semibold border-b border-gray-200">
        MES System
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition gap-3 ${
                  isActive
                    ? 'bg-[var(--nav-active)] text-white font-medium'
                    : 'text-[var(--nav-text)] hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
