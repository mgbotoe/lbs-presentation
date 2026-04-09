import { QRCodeSVG } from 'qrcode.react';

interface QRJoinProps {
  audienceUrl: string;
}

export function QRJoin({ audienceUrl }: QRJoinProps) {
  return (
    <div className="qr-join">
      <div className="qr-code-wrapper">
        <QRCodeSVG
          value={audienceUrl}
          size={200}
          bgColor="#ffffff"
          fgColor="#1a1a1a"
          level="M"
        />
      </div>
      <p className="qr-label">Scan to vote on your phone</p>
      <p className="qr-url">{audienceUrl}</p>
    </div>
  );
}
