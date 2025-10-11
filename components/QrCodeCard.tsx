'use client';

import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeCardProps {
  url: string;
}

export default function QrCodeCard({ url }: QrCodeCardProps) {
  if (!url) {
    return null;
  }

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/30 p-8 text-center animate-fadeIn" style={{animationDelay: '0.4s'}}>
      <h3 className="font-bold text-white mb-6 text-2xl flex items-center justify-center">
        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-sm">📱</span>
        </span>
        Scan QR
      </h3>
      <div className="p-4 bg-white/80 rounded-xl inline-block shadow-inner">
        <QRCodeCanvas
          value={url}
          size={192} // Smaller size for the sidebar
          bgColor={"#ffffff"} 
          fgColor={"#111827"}
          level={"L"}
          includeMargin={true}
        />
      </div>
    </div>
  );
}
