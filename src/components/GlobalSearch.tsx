import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Lightbulb, Search, Settings, Users } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { PLATFORMS, platformMeta } from "@/lib/platforms";
import { useCompetitors, usePosts, useSuggestions } from "@/lib/data";
import { pct } from "@/lib/format";

const PAGES = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/suggestions", label: "Content ideas", icon: Lightbulb },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function GlobalSearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("agentwatch:open-search"))}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <Search className="size-3.5" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded border border-border px-1 py-0.5 text-[10px]">⌘K</kbd>
    </button>
  );
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: competitors = [] } = useCompetitors();
  const { data: posts = [] } = usePosts();
  const { data: suggestions = [] } = useSuggestions();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("agentwatch:open-search", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("agentwatch:open-search", onOpen);
    };
  }, []);

  const topPosts = useMemo(
    () =>
      [...posts]
        .sort(
          (a, b) =>
            Number(b.metrics?.engagement_rate ?? 0) - Number(a.metrics?.engagement_rate ?? 0),
        )
        .slice(0, 40),
    [posts],
  );

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search competitors, posts, ideas and pages…" />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem
              key={p.to}
              value={`page ${p.label}`}
              onSelect={() => go(() => navigate({ to: p.to }))}
            >
              <p.icon className="size-4" />
              {p.label}
            </CommandItem>
          ))}
          {PLATFORMS.map((p) => (
            <CommandItem
              key={p.id}
              value={`platform ${p.label}`}
              onSelect={() =>
                go(() => navigate({ to: "/platforms/$platform", params: { platform: p.id } }))
              }
            >
              <p.icon className="size-4" />
              {p.label} platform
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Competitors">
          {competitors.map((c) => (
            <CommandItem
              key={c.id}
              value={`competitor ${c.name} ${c.handle} ${c.platform}`}
              onSelect={() => go(() => navigate({ to: "/competitors/$id", params: { id: c.id } }))}
            >
              <Users className="size-4" />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.handle}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Top posts">
          {topPosts.map((p) => (
            <CommandItem
              key={p.id}
              value={`post ${p.caption_text ?? ""} ${p.competitors?.name ?? ""} ${p.platform}`}
              onSelect={() =>
                go(() =>
                  navigate({ to: "/competitors/$id", params: { id: p.competitor_id } }),
                )
              }
            >
              <LayoutDashboard className="size-4" />
              <span className="flex-1 truncate">{p.caption_text ?? "Untitled post"}</span>
              <span className="text-xs text-muted-foreground">
                {platformMeta(p.platform).label} · {pct(p.metrics?.engagement_rate)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Content ideas">
          {suggestions.map((s) => (
            <CommandItem
              key={s.id}
              value={`idea ${s.suggested_topic} ${s.suggested_platform} ${s.suggested_format}`}
              onSelect={() => go(() => navigate({ to: "/suggestions" }))}
            >
              <Lightbulb className="size-4" />
              <span className="flex-1 truncate">{s.suggested_topic}</span>
              <span className="num text-xs text-muted-foreground">{s.success_probability}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
