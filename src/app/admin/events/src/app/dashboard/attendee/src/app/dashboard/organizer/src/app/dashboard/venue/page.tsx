import { Building2, CalendarRange, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VenueDashboardPage() {
  return (
    <AppShell
      title="Venue Dashboard"
      subtitle="Track hosted events, turnout, venue activity, and relationships with organizers."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Hosted Events" value="14" hint="Across active bookings" />
        <StatCard label="Projected Attendance" value="2,380" hint="This month" />
        <StatCard label="Partner Organizers" value="9" hint="Repeat relationships" />
        <StatCard label="Revenue Tracked" value="$31,600" hint="Gross event volume" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
          <CardHeader>
            <CardTitle className="text-white">Venue Overview</CardTitle>
            <CardDescription className="text-zinc-400">
              High-level pulse across your current event schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Building2, label: "Main Room Status", value: "Booked 4 nights this week" },
              { icon: CalendarRange, label: "Upcoming Calendar", value: "6 scheduled events" },
              { icon: Users, label: "Expected Crowd", value: "780 attendees this weekend" },
              { icon: Wallet, label: "Tracked Volume", value: "$9,400 next 7 days" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black/30 p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A259FF]/12 text-[#CDA8FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">{item.label}</p>
                    <p className="mt-1 font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
          <CardHeader>
            <CardTitle className="text-white">Partner Activity</CardTitle>
            <CardDescription className="text-zinc-400">
              Active organizer and event relationships tied to your venue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Sunset Social Group",
              "City Pulse Events",
              "Late Hours Collective",
              "House of Culture",
            ].map((org) => (
              <div
                key={org}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-4"
              >
                <p className="font-semibold text-white">{org}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Active venue relationship
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}