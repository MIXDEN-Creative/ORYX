import type { SupabaseClient } from "@supabase/supabase-js";

export type ActorPermissionRow = {
  org_id: string;
  org_name: string;
  user_id: string;
  email: string;
  title: string | null;
  role: string | null;
  perm_key: string | null;
  perm_name: string | null;
};

export type OrgSummary = {
  org_id: string;
  org_name: string;
  role: string | null;
  title: string | null;
  perm_keys: string[];
};

export async function fetchMyOrgsAndPerms(supabase: SupabaseClient) {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!authData.user) throw new Error("Not authenticated");

  const userId = authData.user.id;

  const { data, error } = await supabase
    .from("v_actor_permissions")
    .select("org_id, org_name, user_id, email, title, role, perm_key")
    .eq("user_id", userId);

  if (error) throw error;

  const rows = (data ?? []) as ActorPermissionRow[];

  const map = new Map<string, OrgSummary>();
  for (const r of rows) {
    const key = r.org_id;
    if (!map.has(key)) {
      map.set(key, {
        org_id: r.org_id,
        org_name: r.org_name,
        role: r.role ?? null,
        title: r.title ?? null,
        perm_keys: [],
      });
    }
    const cur = map.get(key)!;
    if (r.perm_key) cur.perm_keys.push(r.perm_key);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.org_name.localeCompare(b.org_name)
  );
}
