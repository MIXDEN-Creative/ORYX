"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; title: string; subtitle?: string; raw?: string }
  | { kind: "bad"; title: string; subtitle?: string; raw?: string };

export default function ScannerClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stopRef = useRef<null | (() => void)>(null);

  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const card = useMemo(() => {
    if (status.kind === "idle") {
      return {
        headline: "Ready",
        sub: "Tap Start Scan, point camera at a ticket QR.",
        accent: "rgba(255,255,255,0.12)",
      };
    }
    if (status.kind === "ok") {
      return {
        headline: status.title,
        sub: status.subtitle || "",
        accent: "rgba(34,197,94,0.25)",
      };
    }
    return {
      headline: status.title,
      sub: status.subtitle || "",
      accent: "rgba(239,68,68,0.25)",
    };
  }, [status]);

  const callCheckin = async (decodedText: string) => {
    setStatus({ kind: "idle" });

    const res = await fetch("/api/scanner/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decodedText }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({
        kind: "bad",
        title: "INVALID ✕",
        subtitle: data?.error || "Bad request",
        raw: decodedText,
      });
      return;
    }

    if (data?.status === "VALID") {
      setStatus({
        kind: "ok",
        title: "VALID ✓",
        subtitle: "Ticket accepted.",
        raw: decodedText,
      });
      return;
    }

    if (data?.status === "ALREADY_CHECKED_IN") {
      setStatus({
        kind: "bad",
        title: "ALREADY USED ✕",
        subtitle: "Ticket already checked in.",
        raw: decodedText,
      });
      return;
    }

    setStatus({
      kind: "bad",
      title: "INVALID ✕",
      subtitle: data?.error || "Bad request",
      raw: decodedText,
    });
  };

  const start = async () => {
    setStatus({ kind: "idle" });

    try {
      const video = videoRef.current;
      if (!video) {
        setStatus({ kind: "bad", title: "Error", subtitle: "No video element" });
        return;
      }

      const codeReader = new BrowserQRCodeReader();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      setRunning(true);

      let active = true;

      stopRef.current = () => {
        active = false;
        try {
          codeReader.reset();
        } catch {}
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
        setRunning(false);
      };

      // ✅ Correct ZXing API (fixes your crash)
      codeReader.decodeFromVideoDevice(undefined, video, async (result, err) => {
        if (!active) return;

        if (result) {
          const decodedText = result.getText();
          if (!decodedText) return;

          // Prevent double fires
          if (busy) return;

          setBusy(true);
          try {
            await callCheckin(decodedText);
          } finally {
            setTimeout(() => setBusy(false), 700);
          }
        }

        // ignore "not found" scan ticks
        if (err && (err as any).name !== "NotFoundException") {
          // keep quiet unless it's a real error
        }
      });
    } catch (e: any) {
      setRunning(false);
      const msg =
        e?.name === "NotAllowedError"
          ? "Camera permission denied"
          : e?.message || "Camera error";
      setStatus({ kind: "bad", title: "Error", subtitle: msg });
    }
  };

  const stop = () => {
    try {
      stopRef.current?.();
    } catch {}
    stopRef.current = null;
    setRunning(false);
  };

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await fetch("/api/scanner/logout", { method: "POST" });
    window.location.href = "/scanner/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 18,
        color: "#fff",
        background:
          "radial-gradient(900px 520px at 50% 30%, rgba(162,89,255,0.32), rgba(0,0,0,1) 70%)",
      }}
    >
      <div style={{ width: "min(680px, 94vw)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 1 }}>
            EVNTSZN SCANNER
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button
              onClick={logout}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, opacity: 0.8, lineHeight: 1.4 }}>
          Staff check-in. Camera scans the rotating QR.
        </div>

        <div
          style={{
            marginTop: 16,
            borderRadius: 22,
            overflow: "hidden",
            border: "1px solid rgba(162,89,255,0.22)",
            background: "rgba(0,0,0,0.45)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ position: "relative" }}>
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "42vh",
                objectFit: "cover",
                background: "#000",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: "78%",
                  maxWidth: 420,
                  aspectRatio: "16/10",
                  borderRadius: 18,
                  border: "3px solid rgba(255,255,255,0.85)",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
                }}
              />
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div
              style={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.35)",
                padding: 16,
                boxShadow: `0 0 0 1px ${card.accent} inset`,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 22 }}>{card.headline}</div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>{card.sub}</div>

              {status.kind !== "idle" && status.raw ? (
                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
                  Last scan:{" "}
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {status.raw}
                  </span>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                {!running ? (
                  <button
                    onClick={start}
                    style={{
                      flex: 1,
                      padding: "14px 14px",
                      borderRadius: 14,
                      border: "none",
                      fontWeight: 900,
                      fontSize: 16,
                      background: "#A259FF",
                      color: "#000",
                      cursor: "pointer",
                    }}
                  >
                    Start Scan
                  </button>
                ) : (
                  <button
                    onClick={stop}
                    style={{
                      flex: 1,
                      padding: "14px 14px",
                      borderRadius: 14,
                      border: "none",
                      fontWeight: 900,
                      fontSize: 16,
                      background: "rgba(255,255,255,0.10)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Stop
                  </button>
                )}

                <button
                  onClick={() => setStatus({ kind: "idle" })}
                  style={{
                    padding: "14px 14px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.35)",
                    color: "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
              Tip: Use Safari/Chrome. In-app browsers can block camera APIs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
