// src/components/ui/kpi-card.tsx
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: 'purple' | 'blue' | 'pink' | 'cyan' | 'green' | 'red';
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

const gradientClasses = {
  purple: 'from-purple-500 to-purple-700',
  blue: 'from-blue-500 to-blue-700',
  pink: 'from-pink-500 to-pink-700',
  cyan: 'from-cyan-500 to-cyan-700',
  green: 'from-green-500 to-green-700',
  red: 'from-red-500 to-red-700',
};

export function KpiCard({
  title,
  value,
  icon,
  gradient = 'blue',
  trend,
  className = '',
}: KpiCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClasses[gradient]} p-6 text-white shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-105 ${className}`}
    >
      {/* Background Accent */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="mt-3 flex items-center gap-1">
                <span
                  className={`text-sm font-semibold ${
                    trend.positive ? 'text-green-200' : 'text-red-200'
                  }`}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-white/60">vs last period</span>
              </div>
            )}
          </div>
          {icon && <div className="text-3xl opacity-80">{icon}</div>}
        </div>
      </div>
    </div>
  );
}
