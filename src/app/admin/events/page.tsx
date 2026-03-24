import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/ui/event-card";
import { supabasePublic } from "@/lib/supabase/public";

export default async function ExploreEventsPage() {
  const { data: events } = await supabasePublic
    .from("events")
    .select("id, title, slug, category, city, event_date, start_time, price_cents, status")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const filters = ["All", "Nightlife", "Singles", "Networking", "Live Music", "Creative"];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-zinc-900 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-semibold">
              E
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-white">
                EVNTSZN
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                DISCOVER EVENTS
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200">
              Get Early Access
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(162,89,255,0.12),transparent_28%)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            EXPLORE
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Discover premium events that look worth showing up for.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 md:text-lg">
            EVNTSZN is designed for nightlife, live music, singles events, creative
            mixers, and culture-forward experiences that deserve stronger presentation.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search events, cities, organizers, or venues"
                className="h-12 border-zinc-800 bg-black/40 pl-11 text-white placeholder:text-zinc-600"
              />
            </div>

            <Button
              variant="outline"
              className="h-12 border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <Badge
                key={filter}
                className={
                  index === 0
                    ? "border-0 bg-[#A259FF]/15 px-4 py-2 text-[#CDA8FF]"
                    : "border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-zinc-300"
                }
              >
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                MARKETPLACE
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Live events
              </h2>
            </div>

            <p className="text-sm text-zinc-500">
              {events?.length ?? 0} events available
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {events?.map((event) => (
              <EventCard
                key={event.id}
                href={`/event/${event.slug}`}
                title={event.title}
                date={
                  event.event_date
                    ? `${new Date(event.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} • ${event.start_time || "Time TBA"}`
                    : "Date TBA"
                }
                location={event.city || "Location TBA"}
                price={new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format((event.price_cents ?? 0) / 100)}
                category={event.category || "Event"}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}