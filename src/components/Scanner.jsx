import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

export default function Scanner({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
        onClose();
      },
      () => {
        // Ignored as it scans continuously
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 sm:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/2">
          <h3 className="text-lg font-bold tracking-tight">Scansiona Barcode</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <X size={20} className="text-white/40" />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            id="reader" 
            className="rounded-2xl overflow-hidden border border-white/10 bg-black/20"
          />
          <p className="mt-6 text-center text-sm text-white/40 font-medium tracking-wide">
            Inquadra il codice a barre del prodotto per aggiungerlo al carrello
          </p>
        </div>
      </div>
    </div>
  );
}
