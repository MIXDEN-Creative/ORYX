"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  function loginAs(role: string) {
    if (role === "attendee") router.push("/dashboard/attendee");
    if (role === "organizer") router.push("/dashboard/organizer");
    if (role === "venue") router.push("/dashboard/venue");
    if (role === "admin") router.push("/dashboard/admin");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                EVNTSZN ACCESS
              </p>

              <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">
                Choose your dashboard.
              </h1>

              <p className="max-w-xl text-base leading-8 text-zinc-400 md:text-lg">
                A cleaner access point for attendees, organizers, venues, and internal
                EVNTSZN team members.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-lg font-semibold text-white">Clean</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Simple access by role.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-lg font-semibold text-white">Fast</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Get where you need to go quickly.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-lg font-semibold text-white">Premium</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Designed like a real platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center px-6 py-12 md:px-10 lg:px-12">
          <div className="w-full rounded-[32px] border border-zinc-800 bg-zinc-950/85 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Select Role
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Enter EVNTSZN
              </h2>
              <p className="text-sm leading-7 text-zinc-400">
                Pick the experience you want to access right now.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => loginAs("attendee")}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 px-5 py-4 text-left transition hover:border-[#A259FF]/40 hover:bg-zinc-900"
              >
                <div>
                  <p className="font-semibold text-white">Attendee</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Tickets, saved events, upcoming experiences
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </button>

              <button
                onClick={() => loginAs("organizer")}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 px-5 py-4 text-left transition hover:border-[#A259FF]/40 hover:bg-zinc-900"
              >
                <div>
                  <p className="font-semibold text-white">Organizer</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Events, sales, operations, audience
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </button>

              <button
                onClick={() => loginAs("venue")}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 px-5 py-4 text-left transition hover:border-[#A259FF]/40 hover:bg-zinc-900"
              >
                <div>
                  <p className="font-semibold text-white">Venue</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Venue activity, relationships, hosted events
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </button>

              <button
                onClick={() => loginAs("admin")}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 px-5 py-4 text-left transition hover:border-[#A259FF]/40 hover:bg-zinc-900"
              >
                <div>
                  <p className="font-semibold text-white">Admin</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Internal EVNTSZN team access
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </button>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}