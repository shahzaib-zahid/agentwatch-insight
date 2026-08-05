import { useMemo, useState } from "react";
import { Flame, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PlatformChip } from "@/components/ui-bits";
import { ContentDrawer } from "@/components/ContentDrawer";
import { ExportButton } from "@/components/ExportButton";
import { detectSpikes, SPIKE_THRESHOLD, SPIKE_WINDOW_DAYS } from "@/lib/alerts";
import { compact, pct, shortDate } from "@/lib/format";
import type { PostWithMetrics } from "@/lib/data";

export function SpikeAlerts({
  posts,
  loading,
  limit = 6,
}: {
  posts: PostWithMetrics[];
  loading?: boolean;
  limit?: number;
}) {
  const [active, setActive] = useState<PostWithMetrics | null>(null);
  const alerts = useMemo(() => detectSpikes(posts), [posts]);
  const shown = alerts.slice(0, limit);

  return (
    <div className="panel animate-rise overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-warning" />
            Competitor spike alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="num">
                {alerts.length}
              </Badge>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Posts from the last {SPIKE_WINDOW_DAYS} days performing at least {SPIKE_THRESHOLD}× a
            competitor's own median engagement.
          </p>
        </div>
        <ExportButton
          filename="agentwatch-spike-alerts"
          rows={alerts}
          columns={[
            { header: "Competitor", value: (a) => a.competitorName },
            { header: "Platform", value: (a) => a.post.platform },
            { header: "Caption", value: (a) => a.post.caption_text ?? "" },
            { header: "Posted at", value: (a) => a.post.posted_at },
            { header: "Engagement rate %", value: (a) => a.engagement.toFixed(2) },
            { header: "Baseline %", value: (a) => a.baseline.toFixed(2) },
            { header: "Multiplier", value: (a) => a.multiplier.toFixed(2) },
            { header: "Severity", value: (a) => a.severity },
            { header: "URL", value: (a) => a.post.post_url },
          ]}
        />
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          title="No spikes detected"
          description="Nothing in the last week is meaningfully outperforming its competitor baseline."
        />
      ) : (
        <ul className="divide-y divide-border">
          {shown.map((a) => (
            <li key={a.post.id}>
              <button
                type="button"
                onClick={() => setActive(a.post)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised"
              >
                <span
                  className={
                    "flex size-8 shrink-0 items-center justify-center rounded-md " +
                    (a.severity === "high"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-warning/15 text-warning")
                  }
                >
                  <Flame className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{a.competitorName}</span>
                    <PlatformChip platform={a.post.platform} />
                    <span className="text-xs text-muted-foreground">
                      {shortDate(a.post.posted_at)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                    {a.post.caption_text}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="num block text-sm font-semibold">
                    {a.multiplier.toFixed(1)}×
                  </span>
                  <span className="num block text-[11px] text-muted-foreground">
                    {pct(a.engagement)} · {compact(a.post.metrics?.views)} views
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ContentDrawer post={active} onOpenChange={(o) => !o && setActive(null)} />
    </div>
  );
}
