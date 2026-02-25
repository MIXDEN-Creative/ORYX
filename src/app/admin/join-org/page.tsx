"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function makeDeviceId() {
  // simple, good-enough device id for local usage
  // if crypto.randomUUID exists, use it
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }

  // fallback
  const rand = () => Math.random().toString(16).slice(2);
  return `dev_${rand()}_${rand()}_${Date.now()}`;
}

export default function JoinOrgPage() {
  const router = useRouter();

  const existingRemember = useMemo(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("oryx.remember_device") === "true";
  }, []);

  const [orgCode, setOrgCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(existingRemember);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = orgCode.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your organization code.");
      return;
    }

    setLoading(true);

    try {
      // Ensure device id exists if remember is enabled
      if (rememberDevice) {
        const existingDeviceId = localStorage.getItem("oryx.device_id");
        if (!existingDeviceId) {
          localStorage.setItem("oryx.device_id", makeDeviceId());
        }
        localStorage.setItem("oryx.remember_device", "true");
      } else {
        localStorage.setItem("oryx.remember_device", "false");
      }

      // Call your backend join endpoint
      // If your route is different, adjust it here.
      const res = await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_code: trimmed,
          remember_device: rememberDevice,
          device_id: rememberDevice ? localStorage.getItem("oryx.device_id") : null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Could not join organization.");
      }

      const data = await res.json();

      // Expected data shape:
      // {
      //   org_id, org_name, role, perm_keys
      // }
      localStorage.setItem("oryx.active_org_id", data.org_id ?? "");
      localStorage.setItem("oryx.active_org_name", data.org_name ?? "");
      localStorage.setItem("oryx.active_role", data.role ?? "");
      localStorage.setItem("oryx.active_perms", JSON.stringify(data.perm_keys ?? []));

      // Send user to dashboard
      router.replace("/admin/dashboard");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: "20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Enter Organization Code</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        Enter the code provided by your organization to access your ORYX dashboard.
      </p>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Organization Code
        </label>
        <input
          value={orgCode}
          onChange={(e) => setOrgCode(e.target.value)}
          placeholder="ORX-XXXXXX"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "#0b0b0b",
            color: "white",
            fontSize: 16,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <input
            id="rememberDevice"
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
          />
          <label htmlFor="rememberDevice" style={{ cursor: "pointer" }}>
            Remember this device
          </label>
        </div>

        {error ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background: "rgba(255, 0, 0, 0.12)",
              border: "1px solid rgba(255, 0, 0, 0.35)",
            }}
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: loading ? "#333" : "#A259FF",
            color: "black",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Joining..." : "Join Organization"}
        </button>
      </form>

      <div style={{ marginTop: 18, opacity: 0.75, fontSize: 13, lineHeight: 1.4 }}>
        If you are on a shared computer, leave “Remember this device” unchecked.
      </div>
    </div>
  );
}
