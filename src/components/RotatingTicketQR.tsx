"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

type Props = {
  publicId: string;
  eventId: string;
};

export default function RotatingTicketQR({ publicId, eventId }: Props) {
  const [value, setValue] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const refreshMs = 10_000; // rotates every 10 seconds

  const baseOrigin = useMemo(() => {
    const url =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "";
    return (url || "").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchQR = async () => {
      try {
        setErr("");

        const res = await fetch(
          `/api/qr?publicId=${encodeURIComponent(publicId)}&eventId=${encodeURIComponent(eventId)}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!alive) return;

        if (!res.ok || !data?.url) {
          setValue("");
          setErr(data?.error || "QR unavailable");
          return;
        }

        // If env is missing, fail loudly instead of silently producing bad URLs
        if (!baseOrigin) {
          setValue("");
          setErr("Missing NEXT_PUBLIC_APP_URL");
          return;
        }

        // Force the URL to always use your public origin (never localhost)
        const u = new URL(data.url, baseOrigin);
        u.protocol = "https:";
        u.host = new URL(baseOrigin).host;

        setValue(u.toString());
      } catch {
        if (!alive) return;
        setValue("");
        setErr("QR error");
      }
    };

    fetchQR();
    const id = setInterval(fetchQR, refreshMs);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [publicId, eventId, baseOrigin]);

  if (err) {
    return (
      <div style={{ display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ opacity: 0.9, fontWeight: 800 }}>{err}</div>
        <div style={{ opacity: 0.6, fontSize: 12, marginTop: 6 }}>
          Your QR will not generate until this is set.
        </div>
      </div>
    );
  }

  if (!value) {
    return (
      <div style={{ display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ opacity: 0.8 }}>Loading QR…</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ background: "white", padding: 12, borderRadius: 14 }}>
        <QRCode value={value} size={220} />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Rotates every 10 seconds
      </div>
    </div>
  );
}
