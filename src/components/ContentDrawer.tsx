import { ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HowCalculated } from "@/components/HowCalculated";
import { PlatformChip, ScoreBadge } from "@/components/ui-bits";
import { compact, pct, shortDate } from "@/lib/format";
import { SCORING_DISCLAIMER } from "@/lib/scoring";
import { useSuggestionsForPost, type PostWithMetrics } from "@/lib/data";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ContentDrawer({
  post,
  onOpenChange,
}: {
  post: PostWithMetrics | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: suggestions, isLoading } = useSuggestionsForPost(post?.id ?? null);
  const m = post?.metrics;

  const chartData = [
    { name: "Views", value: Number(m?.views ?? 0) },
    { name: "Likes", value: Number(m?.likes ?? 0) },
    { name: "Comments", value: Number(m?.comments ?? 0) },
    { name: "Shares", value: Number(m?.shares ?? 0) },
    { name: "Saves", value: Number(m?.saves ?? 0) },
  ];

  return (
    <Sheet open={!!post} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {post ? (
          <>
            <SheetHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <PlatformChip platform={post.platform} />
                <Badge variant="secondary" className="capitalize">
                  {post.content_type}
                </Badge>
              </div>
              <SheetTitle className="text-base leading-snug">
                {post.caption_text ?? "Untitled post"}
              </SheetTitle>
              <SheetDescription>
                {post.competitors?.name ?? "Unknown competitor"} · posted{" "}
                {shortDate(post.posted_at)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <div className="panel flex items-center justify-between gap-4 p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Original post</p>
                  <p className="truncate text-sm">{post.post_url}</p>
                </div>
                <Button asChild size="sm" variant="secondary">
                  <a href={post.post_url} target="_blank" rel="noreferrer noopener">
                    Open <ExternalLink className="ml-1 size-3.5" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Stat label="Views" value={compact(m?.views)} />
                <Stat label="Engagement" value={pct(m?.engagement_rate)} />
                <Stat label="Saves" value={compact(m?.saves)} />
              </div>

              <div className="panel p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Metrics breakdown
                </p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={44} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">AI suggestion panel</h3>
                  <span className="text-[11px] text-muted-foreground">{SCORING_DISCLAIMER}</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : suggestions && suggestions.length > 0 ? (
                  suggestions.map((s) => (
                    <div key={s.id} className="panel space-y-2 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-snug">{s.suggested_topic}</p>
                        <ScoreBadge score={s.success_probability} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {s.suggested_format}
                        </Badge>
                        <PlatformChip platform={s.suggested_platform} />
                      </div>
                      <p className="text-xs text-muted-foreground">{s.rationale_text}</p>
                      <HowCalculated breakdown={s.score_breakdown} />
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    No suggestions generated from this post yet.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
