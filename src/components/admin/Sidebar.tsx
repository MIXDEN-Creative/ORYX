"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasPerm, useActiveOrg } from "./useActiveOrg";

type NavItem = {
  href: string;
  label: string;
  perm?: string; // if present, user must have this perm to see the item
};

export default function Sidebar() {
  const pathname = usePathname();
  const active = useActiveOrg();

  const items: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orgs", label: "Organization", perm: "org.manage" },
    { href: "/admin/events", label: "Events", perm: "events.view" },
    { href: "/admin/messaging", label: "Messaging", perm: "messaging.view" },
    { href: "/admin/finance", label: "Finance", perm: "finance.view" },
    { href: "/admin/music", label: "Music", perm: "music.view" },
    { href: "/admin/roles", label: "Roles", perm: "roles.manage" },
  ];

  const visible = items.filter((i) => !i.perm || hasPerm(active, i.perm));

  return (
    <aside className="sidebar glass pop">
      <div className="brandBlock">
        <div className="brandBig">ORYX</div>
        <div className="brandSmall">Private Ops System</div>
      </div>

      <nav className="nav">
        {visible.map((item) => {
          const activeLink = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`navLink ${activeLink ? "navLinkActive" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebarFooter">
        <div className="small">
          {active.org_name ? `Active: ${active.org_name}` : "Select an org"}
        </div>
      </div>
    </aside>
  );
}
