import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Plus,
  ScanLine,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Events", icon: CalendarRange, href: "#" },
  { label: "Tickets", icon: Ticket, href: "#" },
  { label: "Check-In", icon: ScanLine, href: "#" },
  { label: "Audience", icon: Users, href: "#" },
  { label: "Payouts", icon: CreditCard, href: "#" },
  { label: "Analytics", icon: BarChart3, href: "#" },
  { label: "Settings", icon: Settings, href: "#" },
];

const recentEvents = [
  {
    title: "Sunset Rooftop Experience",
    meta: "Saturday • March 22 • Baltimore",
    status: "On Sale",
  },
  {
    title: "Creative Mixer After Dark",
    meta: "Friday • March 28 • Washington, DC",
    status: "Draft",
  },
  {
    title: "Singles Social House Party",
    meta: "Sunday • March 30 • Baltimore",
    status: "On Sale",
  },
];

export default function OrganizerDashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-zinc-900 bg-black/60">
          <div className="flex h-16 items-center border-b border-zinc-900 px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-semibold">
                E
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-white">
                  EVNTSZN
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  ORGANIZER OS
                </p>
              </div>
            </Link>
          </div>

          <div className="px-4 py-5">
            <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Organization
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Sunset Social Group
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Premium nightlife and social experiences
              </p>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      item.label === "Overview"
                        ? "bg-[#A259FF]/12 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <AppShell
          title="Organizer Dashboard"
          subtitle="Run events, track performance, and manage your operation from one premium control center."
          actions={
            <Button className="bg-white text-black hover:bg-zinc-200">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          }
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Sales" value="$12,480" hint="+18.4% this month" />
            <StatCard label="Tickets Sold" value="842" hint="Across 6 events" />
            <StatCard label="Check-Ins" value="517" hint="Live and completed events" />
            <StatCard label="Conversion" value="4.8%" hint="View to purchase rate" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
              <CardHeader>
                <CardTitle className="text-white">Recent Events</CardTitle>
                <CardDescription className="text-zinc-400">
                  A clean view of your active and upcoming event pipeline.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.title}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/30 p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">{event.meta}</p>
                    </div>

                    <div className="rounded-full bg-[#A259FF]/12 px-3 py-1 text-xs font-medium text-[#CDA8FF]">
                      {event.status}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
                <CardHeader>
                  <CardTitle className="text-white">Live Signal</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Operational pulse across your current event stack.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                    <p className="text-sm text-zinc-500">Current focus</p>
                    <p className="mt-1 font-semibold text-white">
                      Push conversions on Sunset Rooftop Experience
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                    <p className="text-sm text-zinc-500">Scanner status</p>
                    <p className="mt-1 font-semibold text-white">Ready for deployment</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4">
                    <p className="text-sm text-zinc-500">Venue relationship</p>
                    <p className="mt-1 font-semibold text-white">2 active venue partners</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Move fast without digging through menus.
                  </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-3">
                  <Button className="justify-start bg-white text-black hover:bg-zinc-200">
                    Create New Event
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
                  >
                    Open Check-In Tools
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start border-zinc-700 bg-transparent text-white hover:bg-zinc-900"
                  >
                    View Ticket Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </AppShell>
      </div>
    </div>
  );
}