import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const { eventId, amount, name, buyerEmail, buyerName } =
      await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing eventId" },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: "Missing amount" },
        { status: 400 }
      );
    }

    /*
    --------------------------------------------------
    IMPORTANT
    Uses Cloudflare tunnel instead of localhost
    --------------------------------------------------
    */

    const base =
      process.env.PUBLIC_APP_URL ||
      new URL(req.url).origin;

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        payment_method_types: ["card"],

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: name || "EVNTSZN Ticket",
              },
            },
          },
        ],

        /*
        -----------------------------------------
        CUSTOMER INFO
        -----------------------------------------
        */

        customer_email: buyerEmail ?? undefined,

        metadata: {
          eventId,
          buyerEmail: buyerEmail ?? "",
          buyerName: buyerName ?? "",
        },

        /*
        -----------------------------------------
        SUCCESS + CANCEL URLS
        -----------------------------------------
        */

        success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/`,
      });

    return NextResponse.json({
      url: session.url,
      id: session.id,
    });
  } catch (err) {
    console.error("Checkout creation failed:", err);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
