import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Lightbulb, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearchTrigger } from "@/components/GlobalSearch";

const ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/platforms/youtube", label: "Platforms", icon: LayoutDashboard },
  { to: "/suggestions", label: "Ideas", icon: Lightbulb },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="border-b border-border bg-sidebar md:hidden">
      <div className="px-2 pt-2">
        <GlobalSearchTrigger />
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 py-2">
      {ITEMS.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
            pathname === i.to
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          <i.icon className="size-3.5" />
          {i.label}
        </Link>
      ))}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
