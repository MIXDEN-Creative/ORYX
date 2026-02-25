"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = useMemo(() => params.get("next") || "/admin/dashboard", [params]);

  const [email, setEmail] = useState("tk@oryx.local");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card} className="oryx-panel">
        <div style={styles.brandRow}>
          <div style={styles.dot} />
          <div>
            <div style={styles.brand}>ORYX</div>
            <div className="small">Sign in to your admin console</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="small">Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@oryx.local"
            autoComplete="email"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="small">Password</label>
          <input
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        {err ? (
          <div style={styles.err}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Sign-in failed</div>
            <div className="small" style={{ opacity: 0.9 }}>{err}</div>
          </div>
        ) : null}

        <button className="oryx-btn" style={{ width: "100%", marginTop: 16 }} onClick={signIn} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="small" style={{ marginTop: 12, opacity: 0.75 }}>
          Tip: For local dev, use the seeded user in Supabase Auth.
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    width: 420,
    maxWidth: "100%",
    padding: 18,
    borderRadius: 20,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: "var(--purple)",
    boxShadow: "0 0 18px rgba(162,89,255,0.45)",
  },
  brand: {
    fontWeight: 980,
    letterSpacing: 1.2,
    fontSize: 20,
  },
  input: {
    width: "100%",
    marginTop: 6,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.28)",
    color: "var(--text)",
    outline: "none",
  },
  err: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,90,90,0.55)",
    background: "rgba(255,90,90,0.08)",
  },
};
