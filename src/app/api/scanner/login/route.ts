import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { verifyScannerPin } from "@/lib/scannerPin";
import { createScannerSession } from "@/lib/scannerSession";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = String(body?.slug || "").trim().toLowerCase();
    const scannerCode = String(body?.scannerCode || "").trim();

    const ip = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    if (!slug || !scannerCode) {
      return NextResponse.json({ ok: false, error: "Missing organizer or scanner code" }, { status: 400 });
    }

    const supabase = supabaseService();

    const { data: org, error: orgErr } = await supabase
      .from("scanner_organizations")
      .select("id,name,slug,is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (orgErr || !org) {
      await supabase.from("scanner_login_audit").insert({
        entered_slug: slug,
        success: false,
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, error: "Invalid organizer or scanner code" }, { status: 401 });
    }

    const { data: staffRows, error: staffErr } = await supabase
      .from("scanner_staff")
      .select("id,full_name,scanner_code_hash,is_active")
      .eq("organization_id", org.id)
      .eq("is_active", true);

    if (staffErr || !staffRows || staffRows.length === 0) {
      await supabase.from("scanner_login_audit").insert({
        organization_id: org.id,
        entered_slug: slug,
        success: false,
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, error: "Invalid organizer or scanner code" }, { status: 401 });
    }

    const matched = staffRows.find((row) =>
      verifyScannerPin(scannerCode, row.scanner_code_hash)
    );

    await supabase.from("scanner_login_audit").insert({
      organization_id: org.id,
      scanner_staff_id: matched?.id || null,
      entered_slug: slug,
      success: !!matched,
      ip,
      user_agent: userAgent,
    });

    if (!matched) {
      return NextResponse.json({ ok: false, error: "Invalid organizer or scanner code" }, { status: 401 });
    }

    const token = createScannerSession({
      orgId: org.id,
      orgSlug: org.slug,
      staffId: matched.id,
      staffName: matched.full_name || "",
      iat: Date.now(),
    });

    const res = NextResponse.json({
      ok: true,
      organization: {
        id: org.id,
        slug: org.slug,
        name: org.name,
      },
      staff: {
        id: matched.id,
        name: matched.full_name || "",
      },
    });

    res.cookies.set("evntszn_scanner_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
