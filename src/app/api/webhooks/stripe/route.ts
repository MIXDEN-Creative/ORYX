import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("❌ Invalid Stripe signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    const eventId = session.metadata?.eventId;
    if (!eventId) {
      console.warn("⚠️ Missing metadata.eventId. Skipping.", { sessionId: session.id });
      return NextResponse.json({ received: true });
    }

    const checkoutSessionId = session.id;
    const publicId = `st_${checkoutSessionId}`;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const buyerEmail =
      session.customer_details?.email ??
      session.customer_email ??
      null;

    const buyerName =
      session.customer_details?.name ?? null;

    const supabase = supabaseService();

    // 1) Quick existence check
    const { data: existing, error: checkErr } = await supabase
      .from("tickets")
      .select("public_id")
      .eq("public_id", publicId)
      .maybeSingle();

    if (checkErr) {
      console.error("🔥 Ticket existence check failed:", checkErr);
      return NextResponse.json({ received: true });
    }

    // If it exists, do nothing (prevents double-log)
    if (existing?.public_id) {
      return NextResponse.json({ received: true });
    }

    // 2) Insert once
    const { error: insertErr } = await supabase.from("tickets").insert({
      event_id: eventId,
      public_id: publicId,
      checkout_session_id: checkoutSessionId,
      stripe_checkout_session_id: checkoutSessionId, // keep if your schema has it
      stripe_payment_intent_id: paymentIntentId,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      status: "paid",
    });

    // If a race happened and the other webhook inserted first, ignore it
    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json({ received: true });
      }
      console.error("🔥 Ticket insert failed:", insertErr);
      return NextResponse.json({ received: true });
    }

    console.log("✅ Ticket created:", publicId);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook handler crash:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
