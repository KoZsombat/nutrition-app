import { useEffect, useRef } from 'react';
import ScanbotSDK from 'scanbot-web-sdk/ui';

type DetectedBarcode = { text: string };
type BarcodeDetectionResult = { barcodes?: DetectedBarcode[] };
type ScannerItem = { barcode?: { text?: string } };
type ScannerInstance = { dispose?: () => void; items?: ScannerItem[] };
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
  const scannerInstanceRef = useRef<ScannerInstance | null>(null);

  const cleanup = () => {
    try {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.dispose?.();
        scannerInstanceRef.current = null;
      }
    } catch (e) {
      console.error('Error cleaning up scanner:', e);
    }
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Initialize SDK
        await ScanbotSDK.initialize({
          licenseKey: '',
          enginePath: '/wasm/',
        });

        // Create barcode scanner with callback
        const config = new ScanbotSDK.UI.Config.BarcodeScannerScreenConfiguration();
        const configWithCallbacks = config as BarcodeScannerScreenConfiguration &
          BarcodeScannerConfig;

        configWithCallbacks.containerId = 'barcode-scanner-container';
        configWithCallbacks.onBarcodesDetected = (result: BarcodeDetectionResult) => {
          const first = result.barcodes?.[0];
          if (first?.text) {
            const barcode = first.text;
            onDetected(barcode);
            handleClose();
          }
        };
        configWithCallbacks.onError = (error: unknown) => {
          console.error('Scanner error:', error);
        };

        configWithCallbacks.onClose = () => {
          handleClose();
        };

        const scannerInstance = await ScanbotSDK.UI.createBarcodeScanner(configWithCallbacks);
        scannerInstanceRef.current = scannerInstance;
        const firstItem = scannerInstance?.items?.[0]?.barcode?.text;
        if (firstItem) {
          onDetected(firstItem);
          handleClose();
        }
      } catch (error) {
        console.error('Scanner initialization error:', error);
        handleClose();
      }
    };

    initializeScanner();

    return () => {
      handleClose();
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md h-3/4 bg-black rounded-lg shadow-lg overflow-hidden">
        <div id="barcode-scanner-container" ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
