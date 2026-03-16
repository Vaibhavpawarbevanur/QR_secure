import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (error) => {
        // Silently ignore scan errors as they happen constantly during scanning
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear html5QrcodeScanner', error);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
      <div id="qr-reader" className="w-full" />
    </div>
  );
};
