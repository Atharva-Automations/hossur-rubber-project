'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Box,
  Warehouse,
  FlaskConical,
  ClipboardList,
  Workflow,
  CheckCircle2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Computer,
  Scroll,
  ScanQrCode,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Inward', path: '/inward', icon: Package },
  { name: 'Outward', path: '/outward', icon: Box },
  { name: 'Ingredients', path: '/ingredients', icon: FlaskConical },
  { name: 'Bins', path: '/bins', icon: ClipboardList },
  { name: 'Recipes', path: '/recipes', icon: Workflow },
  { name: 'Process Tracking', path: '/process', icon: CheckCircle2 },
  { name: 'QC', path: '/qc', icon: CheckCircle2 },
  { name: 'Reports', path: '/reports', icon: Scroll },
  { name: 'PLC monitor', path: '/plc-monitor', icon: Computer },
  { name: 'QR preview', path: '/qr', icon: ScanQrCode },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.25 }}
      className="h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-semibold"
            >
              Rubber MES
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2 text-sm font-medium hover:bg-gray-800 transition-colors',
                isActive ? 'bg-gray-800 text-white' : 'text-gray-300'
              )}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
