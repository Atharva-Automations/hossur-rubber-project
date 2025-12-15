// src/utils/notifications.ts
import { toast } from '@/components/ui/use-toast';

// ----- Generic helpers -----
export const notifySuccess = (title: string, description?: string) =>
  toast({
    title,
    description,
  });

export const notifyError = (title: string, description?: string) =>
  toast({
    title,
    description,
    variant: 'destructive',
  });

export const notifyInfo = (title: string, description?: string) =>
  toast({
    title,
    description,
  });

export const notifyValidationError = (
  description = 'Please fix highlighted fields.'
) => notifyError('Validation Error', description);

// ----- Domain-specific helpers (Inward) -----
export const notifyInwardCreated = () =>
  notifySuccess('Inward Saved', 'Material entry created successfully.');

export const notifyInwardUpdated = () =>
  notifySuccess('Inward Updated', 'Material entry updated successfully.');

export const notifyInwardDeleted = () =>
  notifySuccess('Inward Deleted', 'Material entry deleted and stock updated.');

export const notifyInwardActionFailed = () =>
  notifyError(
    'Inward Action Failed',
    'Something went wrong. Please try again.'
  );
