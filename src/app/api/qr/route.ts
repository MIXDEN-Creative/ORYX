import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const SECRET = process.env.QR_SECRET || "dev_secret";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const publicId = searchParams.get("publicId");
  const eventId = searchParams.get("eventId");

  if (!publicId || !eventId) {
    return NextResponse.json(
      { error: "missing params" },
      { status: 400 }
    );
  }

  const expires = Date.now() + 10000;

  const payload = `${publicId}.${eventId}.${expires}`;

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  const token = `${payload}.${sig}`;

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return NextResponse.json({
    url: `${base}/scan/${token}`,
  });
}
