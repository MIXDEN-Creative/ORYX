import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Missing event slug." },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select(
        "id, title, description, slug, price_cents, capacity, venue_name, venue_address, city, status"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !event) {
      return NextResponse.json(
        { ok: false, error: "Event not found." },
        { status: 404 }
      );
    }

    const { count: soldCount } = await supabaseAdmin
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("ticket_status", ["active", "checked_in"]);

    const remaining = Math.max((event.capacity ?? 0) - (soldCount ?? 0), 0);

    if (remaining <= 0) {
      return NextResponse.json(
        { ok: false, error: "This event is sold out." },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/event/${event.slug}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: event.price_cents ?? 0,
            product_data: {
              name: event.title,
              description:
                event.description || `${event.venue_name || "EVNTSZN event"}`,
            },
          },
        },
      ],
      metadata: {
        event_id: event.id,
        event_slug: event.slug,
      },
    });

    return NextResponse.json({
      ok: true,
      url: session.url,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}