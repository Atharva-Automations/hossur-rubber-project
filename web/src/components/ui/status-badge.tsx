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
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      )}
    >
      {status}
    </span>
  );
}
