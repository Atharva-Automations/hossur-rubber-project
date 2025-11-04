import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export function useProductionScan() {
  return useMutation({
    mutationFn: async (qrId: string) => {
      const res = await api.post('/production/scan-qr', { qrId });
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Scan Successful ✅',
        description: data.message,
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to scan QR for production.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
}
