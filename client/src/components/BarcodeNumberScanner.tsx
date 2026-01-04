import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

type BarcodeNumberScannerProps = {
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeNumberScanner({ onDetected, onClose }: BarcodeNumberScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const startingRef = useRef(false);

  const stopCamera = () => {
    readerRef.current?.reset();
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setReady(false);
    startingRef.current = false;
  };

  useEffect(() => {
    if (!videoRef.current || startingRef.current) return;

    // Prevent double-starts (e.g. React Strict Mode)
    startingRef.current = true;
    stopCamera();
    setError(null);
    setResult(null);

    const hints = new Map<DecodeHintType, BarcodeFormat[]>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.CODE_128,
    ]);

    // Use small delay to avoid rapid re-scans
    const reader = new BrowserMultiFormatReader(hints, 300);
    readerRef.current = reader;

    reader
      .decodeFromConstraints(
        {
          video: { facingMode: 'environment' },
          audio: false,
        },
        videoRef.current,
        (res) => {
          if (res) {
            const code = res.getText();
            setResult(code);
            onDetected(code);
            stopCamera();
            onClose();
          }
        }
      )
      .then(() => setReady(true))
      .catch((err) => {
        setError('Nem sikerült elindítani a kamerát vagy a szkennert.');
        console.error(err);
        stopCamera();
      });

    return () => {
      stopCamera();
      readerRef.current = null;
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[320px]">
        <h2 className="text-lg font-semibold mb-4">Számfelismerés kamerával</h2>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg mb-4 max-w-xs w-full"
          style={{ display: ready ? 'block' : 'none' }}
        />

        {!ready && !error && <p className="text-sm text-gray-600 mb-3">Kamera indítása...</p>}
        {error && <p className="text-sm text-red-600 mb-3 text-center">{error}</p>}

        <div className="w-full bg-gray-100 rounded p-2 text-sm text-gray-800 mb-3 max-w-xs text-center">
          <b>Eredmény:</b> <span className="font-semibold">{result ?? 'Keresés...'}</span>
        </div>

        <button
          className="mt-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
          onClick={() => {
            stopCamera();
            onClose();
          }}
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}
