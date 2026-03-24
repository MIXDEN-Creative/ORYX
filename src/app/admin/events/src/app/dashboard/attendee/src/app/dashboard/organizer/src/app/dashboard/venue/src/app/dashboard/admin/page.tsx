import { Shield, Users, Building2, Ticket, Wallet, Briefcase } from "lucide-react";
import { AppShell } from "@/components/ui/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <AppShell
      title="Admin Control Center"
      subtitle="Internal EVNTSZN operations for employees, roles, organizations, platform oversight, and performance."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Organizations" value="126" hint="Across all active cities" />
        <StatCard label="Venues" value="47" hint="Approved and active" />
        <StatCard label="Tickets Processed" value="18,240" hint="Trailing 30 days" />
        <StatCard label="Gross Volume" value="$412,800" hint="Tracked platform GMV" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
          <CardHeader>
            <CardTitle className="text-white">Admin Domains</CardTitle>
            <CardDescription className="text-zinc-400">
              Platform oversight areas managed by EVNTSZN team roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Users, label: "Organizations", value: "Manage organizer accounts and access" },
              { icon: Building2, label: "Venues", value: "Approve and monitor venue relationships" },
              { icon: Ticket, label: "Events & Tickets", value: "Track active listings and sales" },
              { icon: Wallet, label: "Finance", value: "Review payout and revenue operations" },
              { icon: Briefcase, label: "Internal Roles", value: "Access based on employee permissions" },
              { icon: Shield, label: "Trust & Safety", value: "Moderation and operational oversight" },
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
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-zinc-800 bg-zinc-950/85">
          <CardHeader>
            <CardTitle className="text-white">Role-Protected Access</CardTitle>
            <CardDescription className="text-zinc-400">
              Admin tools should only be visible to the right EVNTSZN employees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Support Admin",
              "Finance Admin",
              "Operations Admin",
              "Trust & Safety Admin",
              "Super Admin",
            ].map((role) => (
              <div
                key={role}
                className="rounded-2xl border border-zinc-800 bg-black/30 p-4"
              >
                <p className="font-semibold text-white">{role}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Access should be controlled by employee role permissions
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}