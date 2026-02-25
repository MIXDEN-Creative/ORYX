"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type OrgContextType = {
  orgId: string | null;
  permissions: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const OrgContext = createContext<OrgContextType>({
  orgId: null,
  permissions: new Set(),
  loading: true,
  refresh: async () => {},
});

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  async function loadPermissions(activeOrgId: string) {
    const { data, error } = await supabaseBrowser
      .from("v_actor_permissions")
      .select("perm_key")
      .eq("org_id", activeOrgId);

    if (error) {
      console.error("org_role_permissions error", error);
      setPermissions(new Set());
      return;
    }

    setPermissions(
      new Set((data ?? []).map((p: any) => p.perm_key).filter(Boolean))
    );
  }

  async function refresh() {
    const activeOrg = localStorage.getItem("active_org_id");

    if (!activeOrg) {
      setOrgId(null);
      setPermissions(new Set());
      setLoading(false);
      return;
    }

    setOrgId(activeOrg);
    await loadPermissions(activeOrg);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <OrgContext.Provider value={{ orgId, permissions, loading, refresh }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}
