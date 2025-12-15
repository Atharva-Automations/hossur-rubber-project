// src/lib/constants.ts

export const GRADIENTS = {
  purple: 'from-purple-500 to-purple-700',
  blue: 'from-blue-500 to-blue-700',
  pink: 'from-pink-500 to-pink-700',
  cyan: 'from-cyan-500 to-cyan-700',
  orange: 'from-orange-500 to-orange-700',
  green: 'from-green-500 to-green-700',
  red: 'from-red-500 to-red-700',
} as const;

export const STATUS_COLORS = {
  Active: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
  Expired: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  Pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100',
  },
  Completed: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
} as const;

export const ICONS = {
  info: '📋',
  success: '✓',
  warning: '⚠️',
  error: '✕',
  stock: '📦',
  supplier: '🏭',
  recipe: '📝',
  production: '⚙️',
  quality: '✓',
  dashboard: '📊',
} as const;
