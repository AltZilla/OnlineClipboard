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
    <div className="paper-card p-8 text-center animate-fadeIn" style={{animationDelay: '0.4s'}}>
      <h3 className="handwriting-bold text-blue-900 mb-6 text-2xl flex items-center justify-center">
        <span className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <span className="text-blue-900 text-sm">📱</span>
        </span>
        Scan QR
      </h3>
      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg inline-block shadow-sm">
        <QRCodeCanvas
          value={url}
          size={192} // Smaller size for the sidebar
          bgColor={"#ffffff"} 
          fgColor={"#1e3a8a"}
          level={"L"}
          includeMargin={true}
        />
      </div>
    </div>
  );
}
