import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { EmptyState, PlatformChip, ScoreBadge } from "@/components/ui-bits";
import { HowCalculated } from "@/components/HowCalculated";
import { ExportButton } from "@/components/ExportButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/lib/platforms";
import { SCORING_DISCLAIMER } from "@/lib/scoring";
import { useAddCalendarItem, useSuggestions } from "@/lib/data";

export const Route = createFileRoute("/suggestions")({
  head: () => ({
    meta: [
      { title: "Content ideas — AgentWatch" },
      {
        name: "description",
        content:
          "Ranked content suggestions with a modeled success probability and transparent scoring.",
      },
      { property: "og:title", content: "Content ideas — AgentWatch" },
      {
        property: "og:description",
        content: "Turn competitor performance into scored, ready-to-plan content ideas.",
      },
    ],
  }),
  component: SuggestionsPage,
});

function SuggestionsPage() {
  const { data: suggestions = [], isLoading } = useSuggestions();
  const addToCalendar = useAddCalendarItem();
  const [platform, setPlatform] = useState("all");
  const [minScore, setMinScore] = useState("0");

  const rows = useMemo(
    () =>
      suggestions
        .filter((s) => platform === "all" || s.suggested_platform === platform)
        .filter((s) => s.success_probability >= Number(minScore)),
    [suggestions, platform, minScore],
  );

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title="Content ideas"
        description="Ranked by modeled success probability. Weights are configurable and fully visible."
        action={
          <ExportButton
            filename="agentwatch-content-ideas"
            rows={rows}
            columns={[
              { header: "Topic", value: (s) => s.suggested_topic },
              { header: "Platform", value: (s) => s.suggested_platform },
              { header: "Format", value: (s) => s.suggested_format },
              { header: "Success probability", value: (s) => s.success_probability },
              { header: "Status", value: (s) => s.status },
              { header: "Rationale", value: (s) => s.rationale_text },
              { header: "Created at", value: (s) => s.created_at },
            ]}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-2 px-6 py-4">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minScore} onValueChange={setMinScore}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any score</SelectItem>
            <SelectItem value="60">60+ only</SelectItem>
            <SelectItem value="75">75+ only</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[11px] italic text-muted-foreground">
          {SCORING_DISCLAIMER}
        </span>
      </div>

      <div className="px-6">
        {isLoading ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="No ideas match those filters"
              description="Loosen the score threshold or pick another platform."
            />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((s, i) => (
              <article
                key={s.id}
                className="panel animate-rise space-y-3 p-4"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold leading-snug">{s.suggested_topic}</h2>
                  <ScoreBadge score={s.success_probability} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformChip platform={s.suggested_platform} />
                  <Badge variant="secondary" className="capitalize">
                    {s.suggested_format}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {s.status}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{s.rationale_text}</p>
                <HowCalculated breakdown={s.score_breakdown} />
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  disabled={addToCalendar.isPending}
                  onClick={async () => {
                    try {
                      await addToCalendar.mutateAsync({
                        suggestion_id: s.id,
                        title: s.suggested_topic,
                        platform: s.suggested_platform,
                        format: s.suggested_format,
                      });
                      toast.success("Added to your content calendar");
                    } catch {
                      toast.error("Could not add to calendar");
                    }
                  }}
                >
                  <CalendarPlus className="size-4" /> Add to calendar
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
