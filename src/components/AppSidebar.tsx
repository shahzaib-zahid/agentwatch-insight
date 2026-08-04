import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Users,
} from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/suggestions", label: "Suggestions", icon: Lightbulb },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [platformsOpen, setPlatformsOpen] = useState(pathname.startsWith("/platforms"));

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
    );

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Activity className="size-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">AgentWatch</p>
          <p className="text-[11px] text-muted-foreground">Content intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {NAV.slice(0, 2).map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={itemClass(
              item.exact ? pathname === item.to : pathname.startsWith(item.to),
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setPlatformsOpen((o) => !o)}
          className={cn(itemClass(pathname.startsWith("/platforms")), "w-full justify-between")}
        >
          <span className="flex items-center gap-2.5">
            <Activity className="size-4" />
            Platforms
          </span>
          <ChevronDown
            className={cn("size-3.5 transition-transform", platformsOpen && "rotate-180")}
          />
        </button>
        {platformsOpen && (
          <div className="ml-4 space-y-0.5 border-l border-sidebar-border pl-2">
            {PLATFORMS.map((p) => (
              <Link
                key={p.id}
                to="/platforms/$platform"
                params={{ platform: p.id }}
                className={itemClass(pathname === `/platforms/${p.id}`)}
              >
                <p.icon className="size-3.5" />
                {p.label}
              </Link>
            ))}
          </div>
        )}

        {NAV.slice(2).map((item) => (
          <Link key={item.to} to={item.to} className={itemClass(pathname.startsWith(item.to))}>
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-sidebar-border px-3 py-3">
        <span className="text-[11px] text-muted-foreground">Demo workspace</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
