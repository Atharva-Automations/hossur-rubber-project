import { useEffect } from 'react';

/**
 * Global scanner listener hook
 * Listens for barcode scanner input (keyboard wedge simulation)
 * Accumulates characters and triggers on Enter key
 *
 * Scanner sends: [characters...] + ENTER key
 * This hook captures the full QR code string
 */
export function useScannerListener(
  onScanDetected: (qrId: string) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    let scannedBuffer = '';
    const SCANNER_TIMEOUT = 100; // ms - scanner typically sends all chars within 50ms
    let timeoutId: NodeJS.Timeout | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only process if target is not a textarea/contenteditable (user typing)
      const target = event.target as HTMLElement;
      const isTextInput =
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        target.contentEditable === 'true';

      // If user is typing in an input, don't interfere (unless it's our specific input)
      // We'll use a flag to know if we're actively in the modal
      if (isTextInput && target.id !== 'qr-scanner-modal-input') {
        return;
      }

      // Handle Enter key
      if (event.key === 'Enter' && scannedBuffer.trim().length > 0) {
        console.log('\n========== 🔍 SCANNER DETECTED QR ==========');
        console.log('📱 Scanned QR ID:', scannedBuffer.trim());
        console.log('⏱️  Timestamp:', new Date().toISOString());
        console.log('🔤 Buffer length:', scannedBuffer.length);

        // Call the callback with the scanned QR
        onScanDetected(scannedBuffer.trim());

        // Reset buffer
        scannedBuffer = '';
        if (timeoutId) clearTimeout(timeoutId);
        event.preventDefault();
        return;
      }

      // Handle printable characters (accumulate in buffer)
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        scannedBuffer += event.key;
        console.log(`📝 Scanner buffer updated: ${scannedBuffer}`);

        // Reset timeout on each character (scanner sends all chars rapidly)
        if (timeoutId) clearTimeout(timeoutId);

        // If buffer accumulates without Enter for too long, it might be user typing
        // In that case, don't treat it as scanner input
        timeoutId = setTimeout(() => {
          if (scannedBuffer.length > 0) {
            console.log(
              '⚠️  Buffer timeout - likely user typing, not scanner. Buffer cleared.'
            );
            scannedBuffer = '';
          }
        }, SCANNER_TIMEOUT * 10); // 1 second timeout
      }
    };

    console.log('🎧 Scanner listener attached to page');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log('🎧 Scanner listener removed from page');
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [onScanDetected, enabled]);
}
