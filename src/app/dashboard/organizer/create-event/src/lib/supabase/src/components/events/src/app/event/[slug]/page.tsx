import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { supabasePublic } from "@/lib/supabase/public";
import EventMap from "@/components/events/event-map";
import BuyTicketButton from "@/components/events/buy-ticket-button";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailsPage({ params }: EventPageProps) {
  const { slug } = await params;

  const { data: event } = await supabasePublic
    .from("events")
    .select(
      "id, title, description, slug, category, city, venue_name, venue_address, event_date, start_time, price_cents, capacity, status, age_requirement, refunds_allowed, image_url_1, image_url_2, image_url_3"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!event) {
    notFound();
  }

  const { count: soldCount } = await supabasePublic
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)
    .in("ticket_status", ["active", "checked_in"]);

  const ticketsSold = soldCount ?? 0;
  const ticketsLeft = Math.max((event.capacity ?? 0) - ticketsSold, 0);

  const priceText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((event.price_cents ?? 0) / 100);

  const eventDateText = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBA";

  const mapAddress =
    event.venue_address ||
    [event.venue_name, event.city].filter(Boolean).join(", ") ||
    "Baltimore, MD";

  const imageUrls = [event.image_url_1, event.image_url_2, event.image_url_3].filter(
    Boolean
  ) as string[];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <Link href="/events" className="text-sm text-zinc-400">
          ← Back to Events
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-[32px] border border-[#A259FF]/50 bg-zinc-950 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[0]}
                  alt={event.title}
                  className="h-[380px] w-full object-cover"
                />
              ) : (
                <div className="h-[380px] w-full bg-[linear-gradient(135deg,#0a0a0a,rgba(162,89,255,0.24))]" />
              )}
            </div>

            {imageUrls.length > 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {imageUrls.slice(1).map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="overflow-hidden rounded-[24px] border border-[#A259FF]/40 bg-zinc-950"
                  >
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="h-[220px] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-[#A259FF]/30 bg-[#A259FF]/10 px-3 py-1 text-xs font-medium text-[#CDA8FF]">
                {event.category || "Event"}
              </div>

              <h1 className="text-5xl font-semibold tracking-tight">
                {event.title}
              </h1>

              <p className="max-w-3xl text-base leading-8 text-zinc-400">
                {event.description || "Premium event experience on EVNTSZN."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#A259FF]/35 bg-zinc-950 p-5">
                <div className="flex items-center gap-3 text-zinc-300">
                  <CalendarDays className="h-5 w-5 text-[#A259FF]" />
                  <div>
                    <p className="text-sm text-zinc-500">Date</p>
                    <p className="mt-1 font-semibold text-white">
                      {eventDateText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#A259FF]/35 bg-zinc-950 p-5">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Clock3 className="h-5 w-5 text-[#A259FF]" />
                  <div>
                    <p className="text-sm text-zinc-500">Time</p>
                    <p className="mt-1 font-semibold text-white">
                      {event.start_time || "Time TBA"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#A259FF]/35 bg-zinc-950 p-5">
                <div className="flex items-center gap-3 text-zinc-300">
                  <MapPin className="h-5 w-5 text-[#A259FF]" />
                  <div>
                    <p className="text-sm text-zinc-500">Venue</p>
                    <p className="mt-1 font-semibold text-white">
                      {event.venue_name || "Venue TBA"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {event.venue_address || event.city || "Location TBA"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#A259FF]/35 bg-zinc-950 p-5">
                <div className="flex items-center gap-3 text-zinc-300">
                  <Users className="h-5 w-5 text-[#A259FF]" />
                  <div>
                    <p className="text-sm text-zinc-500">Availability</p>
                    <p className="mt-1 font-semibold text-white">
                      {ticketsLeft} tickets left
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {ticketsSold} already claimed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Location
              </h2>
              <EventMap address={mapAddress} />
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[28px] border border-[#A259FF]/50 bg-zinc-950 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Reserve Your Spot
              </p>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Starting at</p>
                  <p className="mt-1 text-4xl font-semibold text-white">
                    {priceText}
                  </p>
                </div>

                <div className="rounded-full border border-[#A259FF]/30 bg-[#A259FF]/10 px-3 py-1 text-xs font-medium text-[#CDA8FF]">
                  {ticketsLeft > 0 ? `${ticketsLeft} left` : "Sold out"}
                </div>
              </div>

              <div className="mt-6">
                {ticketsLeft > 0 ? (
                  <BuyTicketButton slug={event.slug} />
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl bg-zinc-800 px-5 py-3 text-sm font-medium text-zinc-400"
                  >
                    Sold Out
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-[#A259FF]/25 bg-black/30 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[#A259FF]" />
                    <div>
                      <p className="font-medium text-white">Trusted checkout</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Secure Stripe-powered payment flow with ticket delivery after purchase.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#A259FF]/25 bg-black/30 p-4">
                  <div className="flex items-start gap-3">
                    <Ticket className="mt-0.5 h-5 w-5 text-[#A259FF]" />
                    <div>
                      <p className="font-medium text-white">Entry policy</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {event.age_requirement || "All Ages"} •{" "}
                        {event.refunds_allowed ? "Refunds allowed" : "No refunds"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#A259FF]/15 pt-5">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Why this feels premium
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  One clean action card. One clear price. One dominant checkout path.
                  That single sticky rail is the design move that makes ticket platforms feel more elite instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}