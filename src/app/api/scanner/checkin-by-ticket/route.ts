import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { readScannerSession } from "@/lib/scannerSession";

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
    const publicId = String(body?.publicId || "").trim();
    const selectedEventId = String(body?.eventId || "").trim();

    if (!publicId) {
      return NextResponse.json({ ok: false, error: "Missing ticket ID" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "";
    const userAgent = req.headers.get("user-agent") || "";

    const supabase = supabaseService();

    let query = supabase
      .from("tickets")
      .select("id, public_id, event_id, status, checked_in_at")
      .eq("public_id", publicId);

    if (selectedEventId) {
      query = query.eq("event_id", selectedEventId);
    }

    const { data: ticket, error: findErr } = await query.maybeSingle();

    if (findErr) {
      return NextResponse.json({ ok: false, error: "Lookup failed" }, { status: 500 });
    }

    if (!ticket) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        ticket_public_id: publicId,
        status: "NOT_FOUND",
        method: "manual",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });
    }

    const { data: accessRow } = await supabase
      .from("scanner_event_access")
      .select("event_id")
      .eq("organization_id", session.orgId)
      .eq("event_id", ticket.event_id)
      .maybeSingle();

    if (!accessRow) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: ticket.event_id,
        ticket_public_id: publicId,
        status: "UNAUTHORIZED_EVENT",
        method: "manual",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, error: "This organizer does not have access to that event" }, { status: 403 });
    }

    if (ticket.status !== "paid") {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: ticket.event_id,
        ticket_public_id: publicId,
        status: "NOT_PAID",
        method: "manual",
        ip,
        user_agent: userAgent,
      });

      return NextResponse.json({ ok: false, error: "Ticket not paid" }, { status: 403 });
    }

    if (ticket.checked_in_at) {
      await supabase.from("scanner_checkin_audit").insert({
        organization_id: session.orgId,
        scanner_staff_id: session.staffId,
        event_id: ticket.event_id,
        ticket_public_id: publicId,
        status: "ALREADY_CHECKED_IN",
        method: "manual",
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
      return NextResponse.json({ ok: false, error: "Check-in failed" }, { status: 500 });
    }

    await supabase.from("scanner_checkin_audit").insert({
      organization_id: session.orgId,
      scanner_staff_id: session.staffId,
      event_id: ticket.event_id,
      ticket_public_id: publicId,
      status: "VALID",
      method: "manual",
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
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
