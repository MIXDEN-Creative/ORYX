"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ScannerLoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [scannerCode, setScannerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/scanner/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          scannerCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      router.replace("/scanner/app");
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(70% 50% at 50% 40%, rgba(162,89,255,0.35), rgba(0,0,0,1))",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          borderRadius: 24,
          padding: 20,
          background: "rgba(10,10,14,0.94)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ fontWeight: 1000, fontSize: 32, letterSpacing: 1 }}>
          EVNTSZN SCANNER
        </div>
        <div style={{ marginTop: 6, opacity: 0.75 }}>
          Scanner staff login
        </div>

        <form onSubmit={submit} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
            Organizer slug
          </div>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="demo-org"
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 16,
              outline: "none",
            }}
          />

          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 14, marginBottom: 8 }}>
            Scanner ID
          </div>
          <input
            value={scannerCode}
            onChange={(e) => setScannerCode(e.target.value)}
            placeholder="4-digit scanner ID"
            inputMode="numeric"
            autoComplete="one-time-code"
            style={{
              width: "100%",
              padding: "14px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              fontSize: 16,
              outline: "none",
            }}
          />

          {err ? (
            <div style={{ marginTop: 12, color: "#ff6b6b", fontWeight: 800 }}>
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "14px 14px",
              borderRadius: 14,
              border: "none",
              background: "#A259FF",
              color: "#000",
              fontWeight: 1000,
              fontSize: 18,
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
