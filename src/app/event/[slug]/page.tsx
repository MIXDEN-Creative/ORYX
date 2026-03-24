import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

type EventPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatEventDate(value: string | null) {
  if (!value) return "Date TBA";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBA";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatEventTime(value: string | null) {
  if (!value) return "Time TBA";

  const [hourString, minuteString] = (value || "").split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value || "Time TBA";

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMoneyFromCents(cents: number | null) {
  const amount = Number(cents || 0) / 100;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function buildGoogleMapsEmbed(address: string) {
  const query = encodeURIComponent(address);
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export async function generateMetadata({ params }: EventPageProps) {
  const resolvedParams = await params;

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("title, description")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!event) {
    return {
      title: "Event Not Found | EVNTSZN",
    };
  }

  return {
    title: `${event.title} | EVNTSZN`,
    description: event.description || "Premium event listing on EVNTSZN.",
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;

  const { data: event, error } = await supabaseAdmin
    .from("events")
    .select(`
      id,
      slug,
      title,
      description,
      category,
      city,
      venue_name,
      venue_address,
      venue_website,
      location,
      event_date,
      start_time,
      ticket_price,
      ticket_quantity,
      capacity,
      price_cents,
      age_requirement,
      custom_age_requirement,
      attire,
      refunds_allowed,
      ada_info,
      parking_info,
      image_url_1,
      image_url_2,
      image_url_3,
      cover_image_url,
      is_free,
      faq_1_question,
      faq_1_answer,
      faq_2_question,
      faq_2_answer,
      faq_3_question,
      faq_3_answer,
      tags,
      status,
      venue_id
    `)
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !event) {
    notFound();
  }

  const { data: ticketTypes } = await supabaseAdmin
    .from("event_ticket_types")
    .select("id, name, price_cents, quantity, description, sort_order, is_active")
    .eq("event_id", event.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  let venueHasProfile = false;

  if (event.venue_id) {
    const { data: venueProfile } = await supabaseAdmin
      .from("venues")
      .select("id")
      .eq("id", event.venue_id)
      .single();

    venueHasProfile = Boolean(venueProfile?.id);
  }

  const heroImage =
    event.cover_image_url ||
    event.image_url_1 ||
    event.image_url_2 ||
    event.image_url_3 ||
    "";

  const venueLine = [event.venue_name, event.venue_address, event.city]
    .filter(Boolean)
    .join(", ");

  const capacity = Number(event.capacity || event.ticket_quantity || 0);

  const faqs = [
    {
      question: event.faq_1_question,
      answer: event.faq_1_answer,
    },
    {
      question: event.faq_2_question,
      answer: event.faq_2_answer,
    },
    {
      question: event.faq_3_question,
      answer: event.faq_3_answer,
    },
  ].filter((item) => item.question && item.answer);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(162,89,255,0.28),transparent_38%),linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.82))]" />
        {heroImage ? (
          <img
            src={heroImage}
            alt={event.title}
            className="h-[440px] w-full object-cover opacity-40"
          />
        ) : (
          <div className="h-[440px] w-full bg-[radial-gradient(circle_at_top,rgba(162,89,255,0.35),transparent_38%),#0a0a0a]" />
        )}

        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-10 pt-8 md:px-10">
            <Link
              href="/events"
              className="mb-6 inline-flex w-fit rounded-full border border-white/15 bg-black/35 px-4 py-2 text-sm text-zinc-200 backdrop-blur"
            >
              ← Back to Events
            </Link>

            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap gap-3">
                {event.category ? (
                  <span className="rounded-full border border-[#A259FF]/55 bg-[#A259FF]/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#DCC6FF]">
                    {event.category}
                  </span>
                ) : null}

                {event.city ? (
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
                    {event.city}
                  </span>
                ) : null}

                {event.is_free ? (
                  <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
                    Free Entry Available
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
                {event.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-200 md:text-base">
                <span>{formatEventDate(event.event_date)}</span>
                <span className="text-zinc-500">•</span>
                <span>{formatEventTime(event.start_time)}</span>
                {event.venue_name ? (
                  <>
                    <span className="text-zinc-500">•</span>
                    <span>{event.venue_name}</span>
                  </>
                ) : null}
              </div>

              <p className="mt-6 max-w-3xl text-base leading-7 text-zinc-300 md:text-lg">
                {event.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_420px] md:px-10">
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-[#A259FF]/60 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#D0B0FF]">Date</p>
              <p className="mt-3 text-lg font-medium text-white">{formatEventDate(event.event_date)}</p>
              <p className="mt-1 text-sm text-zinc-400">{formatEventTime(event.start_time)}</p>
            </div>

            <div className="rounded-3xl border border-[#A259FF]/60 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#D0B0FF]">Venue</p>
              <p className="mt-3 text-lg font-medium text-white">{event.venue_name || "Venue TBA"}</p>
              <p className="mt-1 text-sm text-zinc-400">{event.city || "Location TBA"}</p>
            </div>

            <div className="rounded-3xl border border-[#A259FF]/60 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[#D0B0FF]">Starting At</p>
              <p className="mt-3 text-lg font-medium text-white">
                {event.is_free ? "Free" : formatMoneyFromCents(event.price_cents)}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {(ticketTypes || []).length > 0 ? `${ticketTypes?.length} ticket tiers` : "Tickets coming soon"}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#A259FF]/60 bg-zinc-950/85 p-6 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
            <h2 className="text-2xl font-semibold">About this event</h2>
            <p className="mt-4 text-base leading-8 text-zinc-300">{event.description}</p>

            {Array.isArray(event.tags) && event.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {event.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-[#A259FF]/60 bg-zinc-950/85 p-6 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
            <h2 className="text-2xl font-semibold">Venue & map</h2>

            <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Venue</p>
                  <p className="mt-3 text-lg font-medium text-white">{event.venue_name || "Venue TBA"}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {venueLine || "Venue details coming soon."}
                  </p>
                </div>

                {event.venue_website ? (
                  <a
                    href={event.venue_website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl border border-[#A259FF]/55 bg-[#A259FF]/12 px-4 py-3 text-sm font-medium text-[#DCC6FF]"
                  >
                    Visit Venue Website
                  </a>
                ) : null}

                {event.parking_info ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Parking</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{event.parking_info}</p>
                  </div>
                ) : null}

                {event.ada_info ? (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">ADA</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{event.ada_info}</p>
                  </div>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                {event.venue_address || event.venue_name ? (
                  <iframe
                    title="Event location"
                    src={buildGoogleMapsEmbed(event.venue_address || event.venue_name || "")}
                    className="h-[420px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(162,89,255,0.22),transparent_45%),#09090b] text-sm text-zinc-500">
                    Map preview coming soon
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#A259FF]/60 bg-zinc-950/85 p-6 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
            <h2 className="text-2xl font-semibold">Event details</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Age</p>
                <p className="mt-3 text-sm text-zinc-300">
                  {[event.age_requirement, event.custom_age_requirement].filter(Boolean).join(" • ") || "Not specified"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Attire</p>
                <p className="mt-3 text-sm text-zinc-300">{event.attire || "Not specified"}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Refunds</p>
                <p className="mt-3 text-sm text-zinc-300">
                  {event.refunds_allowed ? "Refunds allowed" : "No refunds"}
                </p>
              </div>

              {venueHasProfile && capacity > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Venue Capacity</p>
                  <p className="mt-3 text-sm text-zinc-300">{capacity} max attendees</p>
                </div>
              ) : null}
            </div>
          </div>

          {faqs.length > 0 ? (
            <div className="rounded-[28px] border border-[#A259FF]/60 bg-zinc-950/85 p-6 shadow-[0_0_0_1px_rgba(162,89,255,0.08)]">
              <h2 className="text-2xl font-semibold">FAQs</h2>

              <div className="mt-5 space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={`${faq.question}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/30 p-5"
                  >
                    <p className="text-base font-medium text-white">{faq.question}</p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="md:sticky md:top-8 md:self-start">
          <div className="overflow-hidden rounded-[30px] border border-[#A259FF]/65 bg-zinc-950/90 shadow-[0_0_0_1px_rgba(162,89,255,0.08),0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-[#D0B0FF]">Tickets</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold text-white">
                    {event.is_free ? "Free" : formatMoneyFromCents(event.price_cents)}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {event.is_free ? "Free entry available" : "Starting price"}
                  </p>
                </div>

                <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                  Available now
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mt-1 space-y-4">
                {(ticketTypes || []).length > 0 ? (
                  ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-[#A259FF]/45 bg-black/35 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-medium text-white">{ticket.name}</p>
                          {ticket.description ? (
                            <p className="mt-2 text-sm leading-6 text-zinc-400">{ticket.description}</p>
                          ) : null}
                        </div>

                        <div className="text-right">
                          <p className="text-base font-semibold text-white">
                            {Number(ticket.price_cents || 0) === 0
                              ? "Free"
                              : formatMoneyFromCents(ticket.price_cents)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">
                    Ticket tiers coming soon.
                  </div>
                )}
              </div>

              <button className="mt-6 h-14 w-full rounded-2xl bg-white text-base font-semibold text-black transition hover:opacity-92">
                Get Tickets
              </button>

              <button className="mt-3 h-12 w-full rounded-2xl border border-[#A259FF]/45 bg-[#A259FF]/10 text-sm font-medium text-[#DCC6FF] transition hover:bg-[#A259FF]/16">
                Share Event
              </button>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[#D0B0FF]">Why EVNTSZN</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Cleaner discovery. Premium event presentation. Built for events that deserve more than basic ticketing.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
