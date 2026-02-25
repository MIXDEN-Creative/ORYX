"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Membership = {
  org_id: string;
  org_name: string;
  user_id: string;
  email: string;
  title: string | null;
  role: string | null;
  membership_created_at: string;
};

export default function BootPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Booting ORYX…");

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabaseBrowser.auth.getSession();
      const token = sess.session?.access_token;

      if (!token) {
        router.replace("/");
        return;
      }

      setMsg("Loading your org access…");

      const res = await fetch("/api/me/memberships", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg("Could not load memberships.");
        return;
      }

      const memberships: Membership[] = json.memberships ?? [];

      if (memberships.length === 0) {
        setMsg("No org memberships found for this user.");
        return;
      }

      if (memberships.length === 1) {
        localStorage.setItem("oryx.active_org_id", memberships[0].org_id);
        router.replace("/admin/dashboard");
        return;
      }

      router.replace("/dashboard");
    })();
  }, [router]);

  return (
    <main className="boot">
      <div className="glass boot-card">
        <div className="oryx-logo">ORYX</div>
        <div className="small">{msg}</div>
      </div>
    </main>
  );
}
