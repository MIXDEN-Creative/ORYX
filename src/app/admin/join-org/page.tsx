"use client";

import { useEffect, useMemo, useState } from "react";

export default function JoinOrgPage() {
  const [inviteCode, setInviteCode] = useState<string>("");

  // Safe random: only generated on the client AFTER mount
  useEffect(() => {
    const rand = () => Math.random().toString(16).slice(2);
    setInviteCode(`${rand()}${rand()}`);
  }, []);

  // Example: if you had any logic that depended on window, keep it inside useEffect
  // so SSR never sees it. (No typeof window checks needed in render.)

  const display = useMemo(() => {
    return inviteCode ? inviteCode : "Generating…";
  }, [inviteCode]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 900, fontSize: 28 }}>Join Org</h1>

      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Invite code (client-generated for dev/testing):
      </p>

      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.15)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        {display}
      </div>

      <p style={{ opacity: 0.7, marginTop: 14, fontSize: 13 }}>
        Note: If this page is used for real onboarding, you should generate secure invite codes
        on the server instead of Math.random().
      </p>
    </main>
  );
}
