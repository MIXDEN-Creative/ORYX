"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState("Preparing login...");

  useEffect(() => {
    const nextPath = searchParams.get("next") || "/dashboard";
    setMsg("Redirecting...");

    // Use hard redirect so we don't fight typed route typing
    window.location.href = nextPath;
  }, [searchParams]);

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 36, margin: 0 }}>Login</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>{msg}</p>
      <p style={{ opacity: 0.7, marginTop: 10 }}>
        If nothing happens, go to <a href="/dashboard">Dashboard</a>.
      </p>
    </main>
  );
}
