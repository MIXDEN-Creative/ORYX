export const runtime = "edge";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await supabaseServer();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("oryx.active_org_id")?.value;

  if (!activeOrgId) {
    return NextResponse.json({ error: "no_active_org" }, { status: 400 });
  }

  const { data: mods, error } = await supabase
    .from("org_modules")
    .select("module, enabled")
    .eq("org_id", activeOrgId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enabled = (mods ?? []).filter((m) => m.enabled).map((m) => m.module);
  return NextResponse.json({ org_id: activeOrgId, enabled });
}