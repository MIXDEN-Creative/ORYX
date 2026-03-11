import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { readScannerSession } from "@/lib/scannerSession";

export const runtime = "nodejs";

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("evntszn_scanner_session")?.value || null;
    const session = readScannerSession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseService();

    const { data: accessRows, error: accessErr } = await supabase
      .from("scanner_event_access")
      .select("event_id")
      .eq("organization_id", session.orgId);

    if (accessErr) {
      return NextResponse.json({ ok: false, error: "Failed to load event access" }, { status: 500 });
    }

    const eventIds = (accessRows || []).map((x) => x.event_id);

    if (eventIds.length === 0) {
      return NextResponse.json({ ok: true, events: [] });
    }

    const { data: tickets, error: ticketErr } = await supabase
      .from("tickets")
      .select("event_id,status,checked_in_at")
      .in("event_id", eventIds);

    if (ticketErr) {
      return NextResponse.json({ ok: false, error: "Failed to load ticket stats" }, { status: 500 });
    }

    const { data: audits, error: auditErr } = await supabase
      .from("scanner_checkin_audit")
      .select("event_id,status,method")
      .eq("organization_id", session.orgId)
      .in("event_id", eventIds);

    if (auditErr) {
      return NextResponse.json({ ok: false, error: "Failed to load audit stats" }, { status: 500 });
    }

    const ticketRows = tickets || [];
    const auditRows = audits || [];

    const byEvent: Record<
      string,
      {
        eventId: string;
        totalPaid: number;
        checkedIn: number;
        remaining: number;
        manualCount: number;
        cameraCount: number;
      }
    > = {};

    for (const eventId of eventIds) {
      byEvent[eventId] = {
        eventId,
        totalPaid: 0,
        checkedIn: 0,
        remaining: 0,
        manualCount: 0,
        cameraCount: 0,
      };
    }

    for (const row of ticketRows) {
      const bucket = byEvent[row.event_id];
      if (!bucket) continue;

      if (row.status === "paid") {
        bucket.totalPaid += 1;
      }

      if (row.checked_in_at) {
        bucket.checkedIn += 1;
      }
    }

    for (const row of auditRows) {
      const bucket = byEvent[row.event_id];
      if (!bucket) continue;

      if (row.status === "VALID") {
        if (row.method === "manual") bucket.manualCount += 1;
        if (row.method === "camera") bucket.cameraCount += 1;
      }
    }

    for (const eventId of eventIds) {
      byEvent[eventId].remaining = Math.max(
        byEvent[eventId].totalPaid - byEvent[eventId].checkedIn,
        0
      );
    }

    return NextResponse.json({
      ok: true,
      events: eventIds.map((id) => byEvent[id]),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
