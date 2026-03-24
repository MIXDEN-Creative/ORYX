import Link from "next/link";

export default function OrganizerDashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
          Organizer Dashboard
        </p>

        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          Organizer Control Center
        </h1>

        <p className="mt-4 max-w-2xl text-zinc-400">
          This is the organizer dashboard route for EVNTSZN.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard/organizer/create-event"
            className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Go to Create Event
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-white"
          >
            Back to Dashboard Gateway
          </Link>
        </div>
      </div>
    </main>
  );
}
