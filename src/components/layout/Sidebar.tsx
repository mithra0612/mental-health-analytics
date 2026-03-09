"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Lightbulb,
  Bot,
  Target,
  SlidersHorizontal,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Overview",      href: "/dashboard/overview",   icon: LayoutDashboard },
  { label: "Journal",       href: "/dashboard/journal",    icon: BookOpen        },
  { label: "Analytics",     href: "/dashboard/analytics",  icon: LineChart       },
  { label: "Insights",      href: "/dashboard/insights",   icon: Lightbulb       },
  { label: "AI Assistant",  href: "/dashboard/assistant",  icon: Bot             },
  { label: "Goals",         href: "/dashboard/goals",      icon: Target          },
  // { label: "Reports",       href: "/dashboard/reports",    icon: FileBarChart    },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:bg-muted active:scale-95"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 h-screen w-[220px] shrink-0 flex flex-col
          bg-background border-r border-border
          transition-transform duration-300 ease-in-out
          md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
            <Activity className="h-4 w-4 text-background" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-foreground">MindTrack</p>
            <p className="text-[11px] text-muted-foreground">Wellness Analytics</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 ease-out
                  ${active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110
                    ${active ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`}
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-background opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-2.5 py-3 space-y-0.5">
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-150 ease-out
              ${isActive("/dashboard/settings")
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            <SlidersHorizontal
              className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110
                ${isActive("/dashboard/settings") ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`}
            />
            <span>Settings</span>
          </Link>
        </div>

        <div className="border-t border-border px-3 py-3">
          <UserMenu />
        </div>
      </aside>
    </>
  );
}
