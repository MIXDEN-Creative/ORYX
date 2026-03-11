"use client";

import QRCode from "react-qr-code";

export default function TicketQR({ value }: { value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(162,89,255,0.35)",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.25), 0 18px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: 14,
          display: "inline-block",
        }}
      >
        <QRCode value={value} size={260} />
      </div>
    </div>
  );
}
