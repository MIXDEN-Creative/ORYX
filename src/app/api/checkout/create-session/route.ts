import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const stripe = new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-02-25.clover",
  });

  const { eventId, publicId } = await req.json();

  if (!eventId || !publicId) {
    return NextResponse.json({ error: "eventId and publicId are required" }, { status: 400 });
  }

  // Change price/line items later. This is a simple test checkout.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "EVNTSZN Ticket" },
          unit_amount: 100, // $1.00 test
        },
        quantity: 1,
      },
    ],
    // These are the keys the webhook uses to mint the ticket
    metadata: { eventId, publicId },

    // For now just send them back to a ticket page
    success_url: `${requiredEnv("PUBLIC_BASE_URL")}/ticket/${publicId}`,
    cancel_url: `${requiredEnv("PUBLIC_BASE_URL")}/`,
  });

  return NextResponse.json({ url: session.url });
}
