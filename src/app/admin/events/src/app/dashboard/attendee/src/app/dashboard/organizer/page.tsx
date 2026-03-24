import Link from "next/link";

export default function OrganizerDashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-8 py-14">

        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          EVNTSZN ORGANIZER
        </p>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Organizer Dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          Manage your events, track ticket sales, and monitor performance.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-950">
            <p className="text-sm text-zinc-500">Total Events</p>
            <p className="mt-2 text-3xl font-semibold">6</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-950">
            <p className="text-sm text-zinc-500">Tickets Sold</p>
            <p className="mt-2 text-3xl font-semibold">842</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-950">
            <p className="text-sm text-zinc-500">Revenue</p>
            <p className="mt-2 text-3xl font-semibold">$12,480</p>
          </div>

        </div>

        <div className="mt-12 flex gap-4">

          <Link
            href="/dashboard/organizer/create-event"
            className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Create Event
          </Link>

          <Link
            href="/events"
            className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-medium"
          >
            View Marketplace
          </Link>

        </div>

      </div>
    </main>
  );
}