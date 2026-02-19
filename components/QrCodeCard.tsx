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
    <div className="qr-card">
      <h3 className="qr-title">
        <span className="viewer-icon">
          <span className="text-blue-900 text-sm">📱</span>
        </span>
        Scan QR
      </h3>
      <div className="qr-container">
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
