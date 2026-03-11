import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { readScannerSession } from "@/lib/scannerSession";

export const runtime = "nodejs";

function parseScan(input: string) {
  const raw = String(input || "").trim();
  if (!raw) return { ok: false as const, error: "Empty scan" };

  let token = "";
  let pid = "";
  let eid = "";

  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, "https://example.com");
    const parts = url.pathname.split("/").filter(Boolean);
    const scanIdx = parts.indexOf("scan");
    if (scanIdx !== -1 && parts[scanIdx + 1]) {
      token = parts[scanIdx + 1];
    } else if (parts.length) {
      token = parts[parts.length - 1];
    }

    if (url.searchParams.get("pid")) {
      pid = url.searchParams.get("pid") || "";
      eid = url.searchParams.get("eid") || "";
    } else if (token.includes(".")) {
      const chunks = token.split(".");
      if (chunks.length >= 2) {
        pid = chunks[0] || "";
        eid = chunks[1] || "";
      }
    }
  } catch {
    token = raw;
    if (token.includes(".")) {
      const chunks = token.split(".");
      if (chunks.length >= 2) {
        pid = chunks[0] || "";
        eid = chunks[1] || "";
      }
    }
  }

  if (!token) return { ok: false as const, error: "Malformed token" };
  if (!pid) return { ok: false as const, error: "Missing ticket id" };
  if (!eid) return { ok: false as const, error: "Missing event id" };

  return { ok: true as const, token, pid, eid };
}

export async function POST(req: Request) {
  try {
    const jar = await cookies();
    const token = jar.get("evntszn_scanner_session")?.value || null;
    const session = readScannerSession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const scanned = String(body?.scanned || "");

    const parsed = parseScan(scanned);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, reason: parsed.error }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    const supabase = supabaseService();

    const { data: accessRow } = await supabase
      .from("scanner_event_access")
      .select("event_id")
      .eq("organization_id", session.orgId)
      .eq("event_id", parsed.eid)
      .maybeSingle();

    if (!accessRow) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: parsed.eid,
        ticket_public_id: parsed.pid,
        status: "UNAUTHORIZED_EVENT",
        method: "camera",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, reason: "This organizer does not have access to that event" }, { status: 403 });
    }

    const { data: ticket, error: findErr } = await supabase
      .from("tickets")
      .select("id, public_id, event_id, status, checked_in_at")
      .eq("public_id", parsed.pid)
      .eq("event_id", parsed.eid)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ ok: false, reason: "Lookup failed" }, { status: 500 });
    }

    if (!ticket) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: parsed.eid,
        ticket_public_id: parsed.pid,
        status: "NOT_FOUND",
        method: "camera",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, reason: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status !== "paid") {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: ticket.event_id,
        ticket_public_id: ticket.public_id,
        status: "NOT_PAID",
        method: "camera",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, reason: "Ticket not paid" }, { status: 403 });
    }

    if (ticket.checked_in_at) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: ticket.event_id,
        ticket_public_id: ticket.public_id,
        status: "ALREADY_CHECKED_IN",
        method: "camera",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({
        ok: true,
        status: "ALREADY_CHECKED_IN",
        publicId: ticket.public_id,
        checkedInAt: ticket.checked_in_at,
      });
    }

    const now = new Date().toISOString();

    const { error: updErr } = await supabase
      .from("tickets")
      .update({ checked_in_at: now })
      .eq("id", ticket.id);

    if (updErr) {
      return NextResponse.json({ ok: false, reason: "Check-in failed" }, { status: 500 });
    }

    await supabase.from("scanner_checkin_audit").insert({
      organization_id: session.orgId,
      scanner_staff_id: session.staffId,
      event_id: ticket.event_id,
      ticket_public_id: ticket.public_id,
      status: "VALID",
      method: "camera",
      ip,
      user_agent: userAgent,
    });

    return NextResponse.json({
      ok: true,
      status: "VALID",
      publicId: ticket.public_id,
      checkedInAt: now,
    });
  } catch {
    return NextResponse.json({ ok: false, reason: "Server error" }, { status: 500 });
  }
}
