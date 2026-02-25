import { supabaseServer } from "@/lib/supabase-server";

export type OrgContext = {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  modules: Set<string>;
  permissions: Set<string>;
  orgs: Array<{ id: string; name: string }>;
};

const ORG_COOKIE = "oryx_org_id";

export async function loadOrgContext(): Promise<OrgContext> {
  const supabase = supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    throw new Error("Not authenticated");
  }

  const userId = auth.user.id;
  const email = auth.user.email ?? null;

  // 1) All orgs user belongs to (membership)
  const { data: memberships, error: memErr } = await supabase
    .from("org_memberships")
    .select("org_id, organizations:organizations(id, name)")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (memErr) throw new Error(memErr.message);

  const orgs =
    (memberships ?? [])
      .map((m: any) => ({
        id: m.organizations?.id as string,
        name: m.organizations?.name as string,
      }))
      .filter((o) => o.id && o.name) ?? [];

  if (orgs.length === 0) {
    throw new Error("User has no org memberships");
  }

  // 2) Determine active org
  // We store active org in a cookie so every request knows which org is selected.
  const cookieHeader = (await import("next/headers")).cookies();
  const cookieOrgId = cookieHeader.get(ORG_COOKIE)?.value;

  const activeOrg =
    orgs.find((o) => o.id === cookieOrgId) ?? orgs[0];

  const orgId = activeOrg.id;
  const orgName = activeOrg.name;

  // 3) Load enabled modules for that org
  const { data: entitlements, error: entErr } = await supabase
    .from("org_entitlements")
    .select("module_key, enabled")
    .eq("org_id", orgId);

  if (entErr) throw new Error(entErr.message);

  const modules = new Set<string>();
  (entitlements ?? []).forEach((e: any) => {
    if (e.enabled) modules.add(e.module_key);
  });

  // 4) Load permissions for user in that org
  // org_role_assignments -> org_roles -> org_role_permissions -> org_permissions
  const { data: roleAssignments, error: raErr } = await supabase
    .from("org_role_assignments")
    .select("role_id")
    .eq("org_id", orgId)
    .eq("user_id", userId);

  if (raErr) throw new Error(raErr.message);

  const roleIds = (roleAssignments ?? []).map((r: any) => r.role_id);
  const permissions = new Set<string>();

  if (roleIds.length > 0) {
    const { data: rolePerms, error: rpErr } = await supabase
      .from("org_role_permissions")
      .select("perm_id")
      .in("role_id", roleIds);

    if (rpErr) throw new Error(rpErr.message);

    const permIds = (rolePerms ?? []).map((rp: any) => rp.perm_id);

    if (permIds.length > 0) {
      const { data: perms, error: pErr } = await supabase
        .from("org_permissions")
        .select("perm_key")
        .eq("org_id", orgId)
        .in("id", permIds);

      if (pErr) throw new Error(pErr.message);

      (perms ?? []).forEach((p: any) => permissions.add(p.perm_key));
    }
  }

  return {
    userId,
    email,
    orgId,
    orgName,
    modules,
    permissions,
    orgs,
  };
}

export function canView(ctx: OrgContext, moduleKey: string, permKey: string) {
  return ctx.modules.has(moduleKey) && ctx.permissions.has(permKey);
}
