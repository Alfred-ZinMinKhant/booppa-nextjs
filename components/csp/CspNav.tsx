"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileWarning, UserCheck,
  GraduationCap, CalendarDays, FileText, ShieldCheck, Building2,
} from "lucide-react";

const LINKS = [
  { href: "/csp/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/csp/clients", label: "Clients", icon: Users },
  { href: "/csp/str", label: "STR", icon: FileWarning },
  { href: "/csp/nominees", label: "Nominees", icon: UserCheck },
  { href: "/csp/training", label: "Training", icon: GraduationCap },
  { href: "/csp/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/csp/documents", label: "Documents", icon: FileText },
  { href: "/csp/evidence", label: "Evidence", icon: ShieldCheck },
  { href: "/csp/profile", label: "Profile", icon: Building2 },
];

export default function CspNav() {
  const pathname = usePathname() || "";
  return (
    <header className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-2 h-14 overflow-x-auto">
          <span className="text-white font-black text-sm mr-4 whitespace-nowrap">
            CSP Compliance
          </span>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? "bg-[#10b981] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
