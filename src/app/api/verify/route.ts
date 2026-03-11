import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";
import { verifyTicket } from "@/lib/crypto";

export const runtime = "nodejs";

/**
 * Public endpoint.
 * Phone camera scans QR -> opens:
 *   https://YOUR_DOMAIN/api/verify?token=PUBLIC_ID.SIGNATURE
 *
 * Returns JSON:
 *   { ok: true, status: "VALID" | "INVALID" | "USED", ... }
 *
 * This does NOT check anyone in. It only verifies.
 * Check-in stays behind your logged-in admin route (/api/scan).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { ok: false, status: "INVALID", reason: "Missing token" },
        { status: 400 }
      );
    }

    const [publicId, sig] = token.split(".");
    if (!publicId || !sig) {
      return NextResponse.json(
        { ok: false, status: "INVALID", reason: "Bad token format" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("public_id,event_id,status,checked_in_at")
      .eq("public_id", publicId)
      .single();

    if (error || !ticket) {
      return NextResponse.json(
        { ok: false, status: "INVALID", reason: "Ticket not found" },
        { status: 404 }
      );
    }

    // Recreate the exact payload used when signing
    const payload = `${ticket.event_id}:${ticket.public_id}`;

    const secret = process.env.EVNTSZN_QR_SIGNING_SECRET;
    if (!secret) {
      return NextResponse.json(
        { ok: false, status: "INVALID", reason: "Server not configured" },
        { status: 500 }
      );
    }

    const validSig = verifyTicket(payload, sig, secret);
    if (!validSig) {
      return NextResponse.json(
        { ok: false, status: "INVALID", reason: "Signature mismatch" },
        { status: 401 }
      );
    }

    // If your ticket lifecycle uses "paid" as active:
    if (ticket.status !== "paid") {
      return NextResponse.json({
        ok: true,
        status: "INVALID",
        publicId: ticket.public_id,
        eventId: ticket.event_id,
        checkedInAt: ticket.checked_in_at,
        reason: "Ticket not active",
      });
    }

    // Used?
    if (ticket.checked_in_at) {
      return NextResponse.json({
        ok: true,
        status: "USED",
        publicId: ticket.public_id,
        eventId: ticket.event_id,
        checkedInAt: ticket.checked_in_at,
      });
    }

    // Valid and unused
    return NextResponse.json({
      ok: true,
      status: "VALID",
      publicId: ticket.public_id,
      eventId: ticket.event_id,
      checkedInAt: null,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, status: "INVALID", reason: "Bad request" },
      { status: 400 }
    );
  }
}
