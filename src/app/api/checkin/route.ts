import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseService } from "@/lib/supabaseServer";
import { verifyEphemeralTicketToken } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1) Verify logged-in user (keeps your login screen relevant)
  const cookieStore = await cookies();

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // no-op in route handler
        },
      },
    }
  );

  const { data: authData } = await supabaseAuth.auth.getUser();
  if (!authData?.user) {
    return NextResponse.json({ ok: false, reason: "Not logged in" }, { status: 401 });
  }

  // 2) Parse token
  const body = await req.json().catch(() => ({}));
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ ok: false, reason: "Missing token" }, { status: 400 });
  }

  const secret = process.env.EVNTSZN_QR_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "Missing signing secret" }, { status: 500 });
  }

  const verified = verifyEphemeralTicketToken(token, secret);
  if (!verified.ok) {
    return NextResponse.json({ ok: false, reason: verified.reason }, { status: 200 });
  }

  // 3) Check-in (service role)
  const supabase = supabaseService();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("public_id,event_id,status,checked_in_at")
    .eq("public_id", verified.publicId)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ ok: false, reason: "Ticket not found" }, { status: 200 });
  }

  if (ticket.status !== "paid") {
    return NextResponse.json({ ok: false, reason: "Ticket not active" }, { status: 200 });
  }

  if (ticket.checked_in_at) {
    return NextResponse.json({
      ok: true,
      status: "USED",
      publicId: ticket.public_id,
      eventId: ticket.event_id,
      checkedInAt: ticket.checked_in_at,
    });
  }

  const { error: updErr } = await supabase
    .from("tickets")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("public_id", ticket.public_id);

  if (updErr) {
    return NextResponse.json({ ok: false, reason: "Check-in failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    status: "CHECKED_IN",
    publicId: ticket.public_id,
    eventId: ticket.event_id,
  });
}
