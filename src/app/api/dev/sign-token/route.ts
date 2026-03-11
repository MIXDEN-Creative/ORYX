import { NextResponse } from "next/server";
import { signTicket } from "@/lib/crypto";

export async function POST(req: Request) {
  const { eventId, publicId } = await req.json();
  const payload = `${eventId}:${publicId}`;
  const sig = signTicket(payload, process.env.EVNTSZN_QR_SIGNING_SECRET!);
  return NextResponse.json({ token: `${publicId}.${sig}` });
}
