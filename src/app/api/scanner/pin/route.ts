import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { readScannerSession } from "@/lib/scannerSession";
import { hashScannerPin, verifyScannerPin } from "@/lib/scannerPin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const token = jar.get("evntszn_scanner_session")?.value || null;
    const session = readScannerSession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const currentPin = String(body?.currentPin || "").trim();
    const newPin = String(body?.newPin || "").trim();
    const confirmPin = String(body?.confirmPin || "").trim();

    if (!currentPin || !newPin || !confirmPin) {
      return NextResponse.json({ ok: false, error: "All fields are required" }, { status: 400 });
    }

    if (newPin !== confirmPin) {
      return NextResponse.json({ ok: false, error: "New PINs do not match" }, { status: 400 });
    }

    if (!/^\d{4,10}$/.test(newPin)) {
      return NextResponse.json({ ok: false, error: "PIN must be 4 to 10 digits" }, { status: 400 });
    }

    const supabase = supabaseService();

    const { data: org, error: orgErr } = await supabase
      .from("scanner_organizations")
      .select("id, slug, scanner_pin_hash, is_active")
      .eq("id", session.orgId)
      .eq("is_active", true)
      .maybeSingle();

    if (orgErr || !org) {
      return NextResponse.json({ ok: false, error: "Organization not found" }, { status: 404 });
    }

    const valid = verifyScannerPin(currentPin, org.scanner_pin_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Current PIN is incorrect" }, { status: 401 });
    }

    const nextHash = hashScannerPin(newPin);

    const { error: updErr } = await supabase
      .from("scanner_organizations")
      .update({
        scanner_pin_hash: nextHash,
      })
      .eq("id", org.id);

    if (updErr) {
      return NextResponse.json({ ok: false, error: "Failed to update PIN" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "Scanner PIN updated",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
