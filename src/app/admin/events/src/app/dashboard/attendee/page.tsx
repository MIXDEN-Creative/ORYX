import Link from "next/link";
import { CalendarDays, Ticket, UserCircle, Heart } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AttendeeDashboardPage() {
  return (
    <AppShell
      title="Your Dashboard"
      subtitle="Track tickets, upcoming events, saved experiences, and your event activity."
      actions={
        <Button asChild className="bg-white text-black hover:bg-zinc-200">
          <Link href="/events">Explore Events</Link>
        </Button>
      }
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming Events" value="3" hint="Tickets ready to use" />
        <StatCard label="Tickets Owned" value="7" hint="Across your account" />
        <StatCard label="Saved Events" value="12" hint="Watchlist growing" />
        <StatCard label="Cities Explored" value="4" hint="Baltimore, DC, Philly, NYC" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Tickets</CardTitle>
            <CardDescription className="text-zinc-400">
              Your next events and entry-ready tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Sunset Rooftop Experience",
              "Creative Mixer After Dark",
              "Singles Social House Party",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 p-4"
              >
                <div>
                  <p className="font-semibold text-white">{item}</p>
                  <p className="mt-1 text-sm text-zinc-500">Ticket ready</p>
                </div>
                <div className="rounded-full bg-[#A259FF]/12 px-3 py-1 text-xs font-medium text-[#CDA8FF]">
                  Active
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
            <CardHeader>
              <CardTitle className="text-white">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button className="justify-start bg-white text-black hover:bg-zinc-200">
                <Ticket className="mr-2 h-4 w-4" />
                View My Tickets
              </Button>
              <Button variant="outline" className="justify-start border-zinc-700 bg-transparent text-white hover:bg-zinc-900">
                <CalendarDays className="mr-2 h-4 w-4" />
                Upcoming Events
              </Button>
              <Button variant="outline" className="justify-start border-zinc-700 bg-transparent text-white hover:bg-zinc-900">
                <Heart className="mr-2 h-4 w-4" />
                Saved Events
              </Button>
              <Button variant="outline" className="justify-start border-zinc-700 bg-transparent text-white hover:bg-zinc-900">
                <UserCircle className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}