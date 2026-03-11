import { useCallback, useEffect, useRef } from 'react';
import ScanbotSDK from 'scanbot-web-sdk/ui';

type DetectedBarcode = { text: string };
type BarcodeDetectionResult = { barcodes?: DetectedBarcode[] };
type ScannerItem = { barcode?: { text?: string } };
type ScannerResult = { items?: ScannerItem[] };
type BarcodeScannerScreenConfiguration = InstanceType<
  typeof ScanbotSDK.UI.Config.BarcodeScannerScreenConfiguration
>;
type BarcodeScannerConfig = {
  containerId?: string;
  onBarcodesDetected?: (result: BarcodeDetectionResult) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};

type BarcodeNumberScannerProps = {
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeNumberScanner({ onDetected, onClose }: BarcodeNumberScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerIdRef = useRef(`barcode-scanner-container-${Math.random().toString(36).slice(2)}`);
  const initTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const isClosingRef = useRef(false);
  const hasDetectedRef = useRef(false);

  const clearInitTimeout = useCallback(() => {
    if (initTimeoutRef.current !== null) {
      window.clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearInitTimeout();
  }, [clearInitTimeout]);

  const safeClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    cleanup();
    if (isMountedRef.current) {
      onClose();
    }
  }, [cleanup, onClose]);

  const handleDetected = useCallback(
    (rawBarcode: string) => {
      if (hasDetectedRef.current) return;

      const barcode = rawBarcode.trim();
      if (!barcode) return;

      hasDetectedRef.current = true;
      onDetected(barcode);
      safeClose();
    },
    [onDetected, safeClose]
  );

  const requestCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera API is not available in this browser');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });

    stream.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    isClosingRef.current = false;
    hasDetectedRef.current = false;

    const initializeScanner = async () => {
      try {
        if (!containerRef.current) {
          throw new Error('Scanner container is not ready');
        }

        // Prevent an endless loading state when camera permission is denied or init stalls.
        initTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) {
            safeClose();
          }
        }, 15000);

        // Fail fast when camera permission is denied, so user is never trapped.
        await requestCameraPermission();
        if (!isMountedRef.current) return;

        // Initialize SDK
        await ScanbotSDK.initialize({
          licenseKey: '',
          enginePath: '/wasm/',
        });

        if (!isMountedRef.current) return;

        // Create barcode scanner with callback
        const config = new ScanbotSDK.UI.Config.BarcodeScannerScreenConfiguration();
        const configWithCallbacks = config as BarcodeScannerScreenConfiguration &
          BarcodeScannerConfig;

        configWithCallbacks.containerId = containerIdRef.current;
        configWithCallbacks.onError = (error: unknown) => {
          console.error('Scanner error:', error);
          // If camera is stopped/closed while scanner is open, immediately close the overlay.
          safeClose();
        };

        configWithCallbacks.onClose = () => {
          safeClose();
        };

        const result = (await ScanbotSDK.UI.createBarcodeScanner(
          configWithCallbacks
        )) as ScannerResult | null;
        if (!isMountedRef.current) return;

        clearInitTimeout();
        const firstItem = result?.items?.[0]?.barcode?.text;
        if (firstItem) {
          handleDetected(firstItem);
          return;
        }

        // User closed Scanbot without scanning -> close wrapper too.
        safeClose();
      } catch (error) {
        console.error('Scanner initialization error:', error);
        safeClose();
      }
    };

    initializeScanner();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup, clearInitTimeout, handleDetected, requestCameraPermission, safeClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md h-3/4 bg-black rounded-lg shadow-lg overflow-hidden">
        <button
          type="button"
          className="absolute right-3 top-3 z-10 rounded bg-white/90 px-3 py-1 text-sm font-medium text-black hover:bg-white"
          onClick={safeClose}
          aria-label="Close scanner"
        >
          Close
        </button>
        <div id={containerIdRef.current} ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
