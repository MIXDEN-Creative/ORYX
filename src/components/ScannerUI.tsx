"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScanResult =
  | { status: "idle" }
  | { status: "approved"; guest: string; time: string }
  | { status: "used"; guest: string; time: string }
  | { status: "invalid"; message: string };

export default function ScannerUI({ eventId }: { eventId: string }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const [result, setResult] = useState<ScanResult>({ status: "idle" });
  const [checkedIn, setCheckedIn] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);
  const [eventTitle, setEventTitle] = useState<string>("");

  const resetDelayMs = useMemo(() => 1400, []);
  const scannerRef = useRef<any>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [manualToken, setManualToken] = useState("");

  async function handleToken(token: string) {
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, token, staffPin: pin }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      data = { status: "invalid", message: "SERVER ERROR" };
    }

    if (data.status === "approved") {
      setResult({ status: "approved", guest: data.guest, time: data.time });
      setCheckedIn((v) => v + 1);
    } else if (data.status === "used") {
      setResult({ status: "used", guest: data.guest, time: data.time });
    } else {
      setResult({ status: "invalid", message: data.message || "INVALID TICKET" });
    }

    setTimeout(() => setResult({ status: "idle" }), resetDelayMs);
  }

  async function unlock() {
    setPinError("");

    // Light validation only (server is the real enforcement)
    if (pin.trim().length < 3) {
      setPinError("PIN too short");
      return;
    }

    setUnlocked(true);

    // Now that we’re unlocked, load stats
    const r = await fetch(`/api/event/${eventId}/stats`).catch(() => null);
    if (r) {
      const d = await r.json();
      setEventTitle(d.title);
      setCheckedIn(d.checkedIn);
      setCapacity(d.capacity);
    }
  }

  // Start/stop camera scanner when unlocked + cameraOn
  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!unlocked || !cameraOn) return;

      // Dynamic import so it never runs server-side
      const mod = await import("html5-qrcode");
      if (cancelled) return;

      const { Html5Qrcode } = mod;
      const html5 = new Html5Qrcode("evntszn-scanner");
      scannerRef.current = html5;

      await html5.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        },
        async (decodedText: string) => {
          // Avoid double fires
          if (!decodedText) return;
          await html5.pause(true);
          await handleToken(decodedText.trim());
          setTimeout(() => {
            html5.resume();
          }, 850);
        },
        () => {
          // ignore scan errors spam
        }
      );
    }

    async function stop() {
      const s = scannerRef.current;
      if (s) {
        try {
          await s.stop();
        } catch {}
        try {
          await s.clear();
        } catch {}
        scannerRef.current = null;
      }
    }

    start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [unlocked, cameraOn, eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  // PIN Gate Screen (no stats shown)
  if (!unlocked) {
    return (
      <div
        style={{
          height: "100vh",
          background: "radial-gradient(circle at center, #22003f 0%, #000000 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
          color: "white",
        }}
      >
        <div style={{ width: "min(420px, 92vw)", textAlign: "center" }}>
          <img src="/evntszn-logo.png" alt="EVNTSZN" style={{ width: 140, height: "auto", margin: "0 auto 18px" }} />

          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 18 }}>Staff access required</div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(162,89,255,0.55)",
              borderRadius: 999,
              padding: "12px 14px",
              boxShadow: "0 0 0 4px rgba(162,89,255,0.10)",
            }}
          >
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter Staff PIN"
              inputMode="numeric"
              type="password"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 16,
              }}
            />
            <span style={{ opacity: 0.8, fontSize: 14 }}>🔒</span>
          </div>

          {pinError && <div style={{ marginTop: 10, color: "#ff6b6b", fontSize: 13 }}>{pinError}</div>}

          <button
            onClick={unlock}
            style={{
              marginTop: 14,
              width: "100%",
              borderRadius: 999,
              padding: "12px 14px",
              border: "none",
              background: "linear-gradient(90deg, rgba(162,89,255,1), rgba(120,60,220,1))",
              color: "black",
              fontWeight: 900,
              letterSpacing: 0.5,
              cursor: "pointer",
            }}
          >
            Unlock Scanner
          </button>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.6 }}>
            Tip: On iPhone Safari, allow camera permissions when prompted.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#000", color: "white" }}>
      {/* TOP BAR */}
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(90deg, rgba(34,0,63,0.9), rgba(0,0,0,0.9))",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, letterSpacing: 0.6 }}>{eventTitle || "Event Scanner"}</div>
          <div style={{ opacity: 0.8, fontSize: 12 }}>Scanner Active ●</div>
        </div>

        <div style={{ fontWeight: 900 }}>
          Checked In: {checkedIn} / {capacity || "—"}
        </div>
      </div>

      {/* CAMERA AREA */}
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: cameraOn ? "block" : "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cameraOn ? (
            <div
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <div
                id="evntszn-scanner"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 280,
                  height: 280,
                  borderRadius: 22,
                  border: "2px solid rgba(162,89,255,0.85)",
                  boxShadow: "0 0 0 6px rgba(162,89,255,0.10)",
                  pointerEvents: "none",
                }}
              />
            </div>
          ) : (
            <div style={{ opacity: 0.8 }}>Camera paused</div>
          )}
        </div>

        {/* RESULT OVERLAY */}
        {result.status !== "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              textAlign: "center",
              background:
                result.status === "approved"
                  ? "rgba(0, 180, 0, 0.92)"
                  : result.status === "used"
                    ? "rgba(255, 165, 0, 0.92)"
                    : "rgba(200, 0, 0, 0.92)",
              color: "white",
            }}
          >
            <div>
              {result.status === "approved" && (
                <>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>ENTRY APPROVED</div>
                  <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>{result.guest}</div>
                  <div style={{ marginTop: 6, fontSize: 14, opacity: 0.95 }}>
                    Checked in • {new Date(result.time).toLocaleTimeString()}
                  </div>
                </>
              )}

              {result.status === "used" && (
                <>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>TICKET ALREADY USED</div>
                  <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700 }}>{result.guest}</div>
                  <div style={{ marginTop: 6, fontSize: 14, opacity: 0.95 }}>
                    Previously checked in • {new Date(result.time).toLocaleTimeString()}
                  </div>
                </>
              )}

              {result.status === "invalid" && (
                <>
                  <div style={{ fontSize: 28, fontWeight: 900 }}>{result.message || "INVALID TICKET"}</div>
                  <div style={{ marginTop: 12, fontSize: 13, opacity: 0.95 }}>Direct guest to event staff for assistance.</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          padding: 12,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          gap: 10,
          background: "linear-gradient(90deg, rgba(0,0,0,0.9), rgba(34,0,63,0.9))",
        }}
      >
        <button
          onClick={() => {
            const v = prompt("Paste ticket token (publicId.signature):");
            if (v) handleToken(v.trim());
          }}
          style={{
            flex: 1,
            padding: 14,
            fontWeight: 900,
            borderRadius: 14,
            border: "1px solid rgba(162,89,255,0.55)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Manual Entry
        </button>

        <button
          onClick={() => setCameraOn((v) => !v)}
          style={{
            flex: 1,
            padding: 14,
            fontWeight: 900,
            borderRadius: 14,
            border: "1px solid rgba(162,89,255,0.55)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
          }}
        >
          {cameraOn ? "Pause Camera" : "Resume Camera"}
        </button>

        <button
          onClick={() => {
            // Quick reset: force remount by toggling camera
            setCameraOn(false);
            setTimeout(() => setCameraOn(true), 200);
          }}
          style={{
            flex: 1,
            padding: 14,
            fontWeight: 900,
            borderRadius: 14,
            border: "1px solid rgba(162,89,255,0.55)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Switch Camera
        </button>
      </div>
    </div>
  );
}
