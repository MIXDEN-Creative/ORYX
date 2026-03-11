"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";

type ScanStatus =
  | "IDLE"
  | "STARTING"
  | "SCANNING"
  | "VALID"
  | "ALREADY_CHECKED_IN"
  | "INVALID";

type SearchItem = {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  checkedInAt: string | null;
  createdAt: string | null;
};

function formatTime(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

  const [status, setStatus] = useState<ScanStatus>("IDLE");
  const [message, setMessage] = useState("Tap Start Scanner");
  const [scanTime, setScanTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualQuery, setManualQuery] = useState("");
  const [manualSearching, setManualSearching] = useState(false);
  const [manualResults, setManualResults] = useState<SearchItem[]>([]);

  const [flash, setFlash] = useState<"none" | "green" | "yellow" | "red">("none");
  const [menuOpen, setMenuOpen] = useState(false);

  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScannedRef = useRef<string>("");
  const lastScannedAtRef = useRef<number>(0);

  const playBeep = (kind: "green" | "yellow" | "red") => {
    try {
      const AudioCtx =
        window.AudioContext ||
        // @ts-ignore
        window.webkitAudioContext;

      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value =
        kind === "green" ? 950 : kind === "yellow" ? 620 : 220;

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);

      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch {}
  };

  const triggerFeedback = (kind: "green" | "yellow" | "red") => {
    setFlash(kind);

    try {
      if (kind === "green") navigator.vibrate?.(60);
      if (kind === "yellow") navigator.vibrate?.([25, 20, 25]);
      if (kind === "red") navigator.vibrate?.([80, 25, 80]);
    } catch {}

    playBeep(kind);

    window.setTimeout(() => {
      setFlash("none");
    }, 160);
  };

  const resetForNextScan = () => {
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }

    cooldownRef.current = window.setTimeout(() => {
      if (running) {
        setStatus("SCANNING");
        setMessage("Ready for next scan");
      } else {
        setStatus("IDLE");
        setMessage("Tap Start Scanner");
      }
      setBusy(false);
    }, 380);
  };

  const applyResult = (data: any, ok: boolean) => {
    const now = new Date();
    setScanTime(formatTime(data?.checkedInAt || now));

    if (!ok) {
      setStatus("INVALID");
      setMessage(data?.reason || data?.error || "Invalid ticket");
      triggerFeedback("red");
      resetForNextScan();
      return;
    }

    if (data?.status === "VALID") {
      setStatus("VALID");
      setMessage("Ticket accepted");
      triggerFeedback("green");
      resetForNextScan();
      return;
    }

    if (data?.status === "ALREADY_CHECKED_IN") {
      setStatus("ALREADY_CHECKED_IN");
      setMessage("Already checked in");
      triggerFeedback("yellow");
      resetForNextScan();
      return;
    }

    setStatus("INVALID");
    setMessage("Invalid ticket");
    triggerFeedback("red");
    resetForNextScan();
  };

  const callCheckin = async (scanned: string) => {
    if (!scanned) return;
    setBusy(true);

    try {
      const res = await fetch("/api/scanner/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanned }),
      });

      const data = await res.json().catch(() => ({}));
      applyResult(data, res.ok);
    } catch {
      applyResult({ error: "Network error" }, false);
    }
  };

  const callCheckinByTicketId = async (publicId: string) => {
    if (!publicId) return;
    setBusy(true);

    try {
      const res = await fetch("/api/scanner/checkin-by-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      const data = await res.json().catch(() => ({}));
      applyResult(data, res.ok);
    } catch {
      applyResult({ error: "Network error" }, false);
    }
  };

  const stop = () => {
    const video = videoRef.current as any;
    try {
      if (video?.__evntsznStop) video.__evntsznStop();
    } catch {}

    setRunning(false);
    setBusy(false);
    setStatus("IDLE");
    setMessage("Scanner stopped");
  };

  const start = async () => {
    setMessage("");
    setStatus("STARTING");
    setMenuOpen(false);

    const video = videoRef.current;
    if (!video) {
      setStatus("INVALID");
      setMessage("Video element missing");
      return;
    }

    video.setAttribute("playsinline", "true");
    video.muted = true;
    video.autoplay = true;

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } as MediaTrackConstraints,
      };

      const controls = await codeReader.decodeFromConstraints(
        constraints,
        video,
        async (result) => {
          if (!result) return;
          if (busy) return;

          const text = result.getText?.() ? result.getText() : "";
          if (!text) return;

          const now = Date.now();

          if (text === lastScannedRef.current && now - lastScannedAtRef.current < 1800) {
            return;
          }

          lastScannedRef.current = text;
          lastScannedAtRef.current = now;

          await callCheckin(text);
        }
      );

      (video as any).__evntsznStop = () => controls.stop();

      setRunning(true);
      setStatus("SCANNING");
      setMessage("Point at QR");
    } catch (e: any) {
      setRunning(false);
      setStatus("INVALID");
      const msg =
        e?.name === "NotAllowedError"
          ? "Camera permission denied"
          : e?.name === "NotFoundError"
          ? "No camera found"
          : "Camera not available. Use Safari on HTTPS.";
      setMessage(msg);
      triggerFeedback("red");
    }
  };

  const logout = async () => {
    await fetch("/api/scanner/logout", { method: "POST" }).catch(() => {});
    router.replace("/scanner/login");
  };

  const runManualSearch = async () => {
    const q = manualQuery.trim();
    if (!q) {
      setManualResults([]);
      return;
    }

    setManualSearching(true);
    try {
      const res = await fetch(`/api/scanner/search?q=${encodeURIComponent(q)}`, {
        method: "GET",
      });
      const data = await res.json().catch(() => ({}));
      setManualResults(data?.items || []);
    } catch {
      setManualResults([]);
    } finally {
      setManualSearching(false);
    }
  };

  const submitExactTicketId = async () => {
    const id = manualQuery.trim();
    if (!id) return;
    setManualOpen(false);
    setManualResults([]);
    setManualQuery("");
    await callCheckinByTicketId(id);
  };

  useEffect(() => {
    setStatus("IDLE");
    setMessage("Tap Start Scanner");

    return () => {
      stop();
      try {
        codeReader.reset();
      } catch {}
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusColor =
    status === "VALID"
      ? "#2ecc71"
      : status === "ALREADY_CHECKED_IN"
      ? "#f1c40f"
      : status === "INVALID"
      ? "#ff4d4d"
      : "#A259FF";

  return (
    <div
      style={{
        minHeight: "100svh",
        height: "100svh",
        background: "#000",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {flash !== "none" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              flash === "green"
                ? "rgba(46, 204, 113, 0.46)"
                : flash === "yellow"
                ? "rgba(241, 196, 15, 0.44)"
                : "rgba(255, 77, 77, 0.46)",
            pointerEvents: "none",
          }}
        />
      )}

      <video
        ref={videoRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          background: "#000",
          display: "block",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.52), rgba(0,0,0,0.10), rgba(0,0,0,0.52))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: "86vw",
            maxWidth: 560,
            aspectRatio: "1.2 / 1",
            borderRadius: 20,
            border: "4px solid rgba(255,255,255,0.82)",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.22)",
          }}
        />
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "max(14px, env(safe-area-inset-top)) 14px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontWeight: 1000, fontSize: "clamp(24px, 7vw, 36px)", letterSpacing: 1 }}>
            EVNTSZN
          </div>
          <div style={{ fontWeight: 1000, fontSize: "clamp(24px, 7vw, 36px)", letterSpacing: 1, marginTop: -4 }}>
            SCANNER
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(0,0,0,0.42)",
              color: "#fff",
              fontWeight: 1000,
              fontSize: 28,
              lineHeight: 1,
            }}
          >
            ⋯
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: 62,
                right: 0,
                width: 240,
                borderRadius: 18,
                background: "rgba(8,8,12,0.96)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.42)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={running ? stop : start}
                style={{
                  width: "100%",
                  padding: "16px 16px",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                {running ? "Stop Scanner" : "Start Scanner"}
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setManualOpen(true);
                }}
                style={{
                  width: "100%",
                  padding: "16px 16px",
                  textAlign: "left",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Manual Entry
              </button>

              <button
                onClick={logout}
                style={{
                  width: "100%",
                  padding: "16px 16px",
                  textAlign: "left",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          left: 14,
          right: 14,
          bottom: "max(16px, env(safe-area-inset-bottom))",
          zIndex: 20,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            minWidth: 240,
            maxWidth: 520,
            padding: "12px 16px",
            borderRadius: 18,
            background: "rgba(8,8,12,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
            backdropFilter: "blur(14px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontWeight: 1000,
              fontSize: 15,
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                background: statusColor,
                display: "inline-block",
              }}
            />
            {status === "VALID"
              ? "VALID"
              : status === "ALREADY_CHECKED_IN"
              ? "ALREADY USED"
              : status === "INVALID"
              ? "INVALID"
              : status === "STARTING"
              ? "STARTING"
              : status === "SCANNING"
              ? "SCANNING"
              : "READY"}
          </div>

          <div style={{ marginTop: 10, fontWeight: 1000, fontSize: "clamp(18px, 5vw, 24px)" }}>
            {message}
          </div>

          {scanTime && (
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.82 }}>
              Scanned at {scanTime}
            </div>
          )}
        </div>
      </div>

      {manualOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.76)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "min(640px, 100%)",
              maxHeight: "84vh",
              overflow: "auto",
              borderRadius: 22,
              background: "rgba(10,10,14,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 1000, fontSize: 24 }}>Manual Entry</div>
            <div style={{ marginTop: 6, opacity: 0.75 }}>
              Search by ticket ID, name, email, or phone.
            </div>

            <input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Ticket ID, name, email, or phone"
              autoFocus
              style={{
                width: "100%",
                marginTop: 14,
                padding: "14px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 16,
                outline: "none",
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
              <button
                onClick={() => {
                  setManualOpen(false);
                  setManualQuery("");
                  setManualResults([]);
                }}
                style={{
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  fontWeight: 1000,
                }}
              >
                Cancel
              </button>

              <button
                onClick={runManualSearch}
                style={{
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: "none",
                  background: "#fff",
                  color: "#000",
                  fontWeight: 1000,
                }}
              >
                {manualSearching ? "Searching…" : "Search"}
              </button>

              <button
                onClick={submitExactTicketId}
                style={{
                  padding: "14px 12px",
                  borderRadius: 14,
                  border: "none",
                  background: "#A259FF",
                  color: "#000",
                  fontWeight: 1000,
                }}
              >
                Check Ticket ID
              </button>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              {manualResults.length === 0 ? (
                <div style={{ opacity: 0.72 }}>No results yet.</div>
              ) : (
                manualResults.map((item) => (
                  <div
                    key={item.publicId}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 1000, fontSize: 16 }}>
                      {item.name || "No name"}
                    </div>

                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.78 }}>
                      Ticket ID: {item.publicId}
                    </div>

                    {item.email ? (
                      <div style={{ marginTop: 4, fontSize: 13, opacity: 0.78 }}>
                        Email: {item.email}
                      </div>
                    ) : null}

                    {item.phone ? (
                      <div style={{ marginTop: 4, fontSize: 13, opacity: 0.78 }}>
                        Phone: {item.phone}
                      </div>
                    ) : null}

                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 800 }}>
                      {item.checkedInAt
                        ? `Already checked in at ${formatTime(item.checkedInAt)}`
                        : "Not checked in yet"}
                    </div>

                    <button
                      onClick={async () => {
                        setManualOpen(false);
                        setManualQuery("");
                        setManualResults([]);
                        await callCheckinByTicketId(item.publicId);
                      }}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: "none",
                        background: item.checkedInAt ? "rgba(255,255,255,0.10)" : "#A259FF",
                        color: item.checkedInAt ? "#fff" : "#000",
                        fontWeight: 1000,
                      }}
                    >
                      {item.checkedInAt ? "Show Status" : "Check In"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
