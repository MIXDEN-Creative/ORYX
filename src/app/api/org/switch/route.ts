export const runtime = "edge";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const orgId = body?.orgId;

  if (!orgId || typeof orgId !== "string") {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("oryx_org_id", orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}
