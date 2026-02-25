"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Org = {
  id: string;
  name: string;
  is_internal?: boolean;
};

type OryxContextValue = {
  session: Session | null;
  loading: boolean;

  orgs: Org[];
  orgLoading: boolean;
  currentOrgId: string | null;
  setCurrentOrgId: (id: string) => void;

  permissions: string[];
  modules: string[];

  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const OryxContext = createContext<OryxContextValue | null>(null);

const STORAGE_KEY = "oryx.currentOrgId";

export function OryxProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);

  const [currentOrgId, _setCurrentOrgId] = useState<string | null>(null);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  const setCurrentOrgId = (id: string) => {
    _setCurrentOrgId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    setLoading(false);
  };

  const refreshOrgs = async () => {
    setOrgLoading(true);

    // RLS should only return orgs the user can see
    const { data, error } = await supabase
      .from("organizations")
      .select("id,name,is_internal")
      .order("name", { ascending: true });

    if (error) {
      setOrgs([]);
      setOrgLoading(false);
      return;
    }

    const list = (data ?? []) as Org[];
    setOrgs(list);

    // Pick current org:
    // 1) localStorage (if still visible)
    // 2) first org returned
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}

    const stillValid = saved && list.some((o) => o.id === saved);
    const chosen = stillValid ? saved : (list[0]?.id ?? null);
    _setCurrentOrgId(chosen);

    if (!stillValid && chosen) {
      try {
        localStorage.setItem(STORAGE_KEY, chosen);
      } catch {}
    }

    setOrgLoading(false);
  };

  const refreshAccess = async (orgId: string | null) => {
    if (!orgId || !session) {
      setPermissions([]);
      setModules([]);
      return;
    }

    // Best-effort:
    // - modules from org_entitlements.module_key where enabled=true
    // - permissions from org_role_permissions via org_role_assignments
    // If your schema differs, the UI still works, just without filtering.

    // modules
    try {
      const ent = await supabase
        .from("org_entitlements")
        .select("module_key,enabled")
        .eq("org_id", orgId);

      if (!ent.error && ent.data) {
        const enabled = ent.data
          .filter((x: any) => x.enabled)
          .map((x: any) => String(x.module_key));
        setModules(enabled);
      } else {
        setModules([]);
      }
    } catch {
      setModules([]);
    }

    // permissions
    try {
      // Get role ids assigned to the user for this org
      const roles = await supabase
        .from("org_role_assignments")
        .select("role_id")
        .eq("org_id", orgId)
        .eq("user_id", session.user.id);

      if (roles.error || !roles.data?.length) {
        setPermissions([]);
        return;
      }

      const roleIds = roles.data.map((r: any) => r.role_id);

      const perms = await supabase
        .from("org_role_permissions")
        .select("permission_key")
        .in("role_id", roleIds);

      if (!perms.error && perms.data) {
        const keys = Array.from(new Set(perms.data.map((p: any) => String(p.permission_key))));
        setPermissions(keys);
      } else {
        setPermissions([]);
      }
    } catch {
      setPermissions([]);
    }
  };

  const refresh = async () => {
    await refreshSession();
    if (session) {
      await refreshOrgs();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setOrgs([]);
    _setCurrentOrgId(null);
    setPermissions([]);
    setModules([]);
  };

  useEffect(() => {
    refreshSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // when session becomes available, load orgs
    if (!loading && session) {
      refreshOrgs();
    }
    if (!loading && !session) {
      setOrgs([]);
      _setCurrentOrgId(null);
      setOrgLoading(false);
      setPermissions([]);
      setModules([]);
    }
  }, [loading, session]);

  useEffect(() => {
    // load access details whenever org changes
    refreshAccess(currentOrgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrgId, session?.user?.id]);

  const value = useMemo<OryxContextValue>(
    () => ({
      session,
      loading,
      orgs,
      orgLoading,
      currentOrgId,
      setCurrentOrgId,
      permissions,
      modules,
      refresh,
      signOut,
    }),
    [session, loading, orgs, orgLoading, currentOrgId, permissions, modules]
  );

  return <OryxContext.Provider value={value}>{children}</OryxContext.Provider>;
}

export function useOryx() {
  const ctx = useContext(OryxContext);
  if (!ctx) throw new Error("useOryx must be used inside OryxProvider");
  return ctx;
}
