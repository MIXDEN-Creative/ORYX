import Link from "next/link";

export default function CreateEventPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      <div className="mx-auto max-w-5xl px-8 py-16">

        <Link
          href="/dashboard/organizer"
          className="text-sm text-zinc-400"
        >
          ← Back to Organizer Dashboard
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          Create Event
        </h1>

        <p className="mt-3 text-zinc-400">
          Build your event listing for EVNTSZN.
        </p>

        <div className="mt-12 space-y-8">

          <div>
            <label className="text-sm text-zinc-400">
              Event Title
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              placeholder="Sunset Rooftop Experience"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Event Description
            </label>

            <textarea
              rows={5}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              placeholder="Describe the vibe of your event"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="text-sm text-zinc-400">
                Event Date
              </label>

              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Start Time
              </label>

              <input
                type="time"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              />
            </div>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="text-sm text-zinc-400">
                Ticket Price
              </label>

              <input
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                placeholder="25"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Ticket Quantity
              </label>

              <input
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
                placeholder="250"
              />
            </div>

          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Venue
            </label>

            <input
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3"
              placeholder="Skyline Rooftop"
            />
          </div>

          <div className="pt-4">

            <button className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black">
              Publish Event
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}