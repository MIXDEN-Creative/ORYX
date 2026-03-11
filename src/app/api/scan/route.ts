import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

function hmac(secret: string, data: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const secret = process.env.EVNTSZN_QR_SIGNING_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing EVNTSZN_QR_SIGNING_SECRET" }, { status: 500 });
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }

  const [payloadB64, sig] = parts;

  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
  }

  const expected = hmac(secret, payload);
  if (sig !== expected) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  // Payload: eventId:publicId:bucket
  const [eventId, publicId, bucketStr] = payload.split(":");
  const bucket = Number(bucketStr);

  if (!eventId || !publicId || !Number.isFinite(bucket)) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  // Allow current bucket and previous bucket (grace window)
  const nowBucket = Math.floor(Date.now() / 10000);
  if (bucket !== nowBucket && bucket !== nowBucket - 1) {
    return NextResponse.json({ error: "EXPIRED" }, { status: 400 });
  }

  const supabase = supabaseService();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("public_id,event_id,status")
    .eq("public_id", publicId)
    .eq("event_id", eventId)
    .single();

  if (error || !ticket) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }

  if (ticket.status !== "paid") {
    return NextResponse.json({ error: "NOT ACTIVE" }, { status: 400 });
  }

  return NextResponse.json({ valid: true, publicId });
}
