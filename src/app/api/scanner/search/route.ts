import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseService } from "@/lib/supabaseServiceServer";
import { readScannerSession } from "@/lib/scannerSession";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const jar = await cookies();
    const token = jar.get("evntszn_scanner_session")?.value || null;
    const session = readScannerSession(token);

    if (!session) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "").trim();
    const selectedEventId = String(searchParams.get("eventId") || "").trim();

    if (!q) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const supabase = supabaseService();

    const { data: accessRows, error: accessErr } = await supabase
      .from("scanner_event_access")
      .select("event_id")
      .eq("organization_id", session.orgId);

    if (accessErr) {
      return NextResponse.json({ ok: false, error: "Access lookup failed" }, { status: 500 });
    }

    let eventIds = (accessRows || []).map((x) => x.event_id);
    if (selectedEventId) {
      eventIds = eventIds.filter((id) => id === selectedEventId);
    }

    if (eventIds.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const { data, error } = await supabase
      .from("tickets")
      .select("public_id,buyer_name,buyer_email,purchaser_email,buyer_phone,purchaser_phone,checked_in_at,created_at,event_id")
      .in("event_id", eventIds)
      .or(
        [
          `public_id.ilike.%${q}%`,
          `buyer_name.ilike.%${q}%`,
          `buyer_email.ilike.%${q}%`,
          `purchaser_email.ilike.%${q}%`,
          `buyer_phone.ilike.%${q}%`,
          `purchaser_phone.ilike.%${q}%`,
        ].join(",")
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ ok: false, error: "Search failed" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      items: (data || []).map((x) => ({
        publicId: x.public_id || "",
        name: x.buyer_name || "",
        email: x.buyer_email || x.purchaser_email || "",
        phone: x.buyer_phone || x.purchaser_phone || "",
        checkedInAt: x.checked_in_at || null,
        createdAt: x.created_at || null,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
