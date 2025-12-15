import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'Active' | 'Expired';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-medium',
        status === 'Active'
          ? 'bg-green-900/30 text-green-400'
          : 'bg-red-900/30 text-red-400'
      )}
    >
      {status}
    </span>
  );
}
