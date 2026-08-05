import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PlatformChip, TableSkeleton } from "@/components/ui-bits";
import { ContentDrawer } from "@/components/ContentDrawer";
import { ExportButton } from "@/components/ExportButton";
import { compact, pct, shortDate } from "@/lib/format";
import { CONTENT_TYPES } from "@/lib/platforms";
import type { PostWithMetrics } from "@/lib/data";

export const POST_CSV_COLUMNS = [
  { header: "Competitor", value: (p: PostWithMetrics) => p.competitors?.name ?? "" },
  { header: "Handle", value: (p: PostWithMetrics) => p.competitors?.handle ?? "" },
  { header: "Platform", value: (p: PostWithMetrics) => p.platform },
  { header: "Content type", value: (p: PostWithMetrics) => p.content_type },
  { header: "Caption", value: (p: PostWithMetrics) => p.caption_text ?? "" },
  { header: "Posted at", value: (p: PostWithMetrics) => p.posted_at },
  { header: "Views", value: (p: PostWithMetrics) => Number(p.metrics?.views ?? 0) },
  { header: "Likes", value: (p: PostWithMetrics) => Number(p.metrics?.likes ?? 0) },
  { header: "Comments", value: (p: PostWithMetrics) => Number(p.metrics?.comments ?? 0) },
  { header: "Shares", value: (p: PostWithMetrics) => Number(p.metrics?.shares ?? 0) },
  { header: "Saves", value: (p: PostWithMetrics) => Number(p.metrics?.saves ?? 0) },
  {
    header: "Engagement rate %",
    value: (p: PostWithMetrics) => Number(p.metrics?.engagement_rate ?? 0),
  },
  { header: "URL", value: (p: PostWithMetrics) => p.post_url },
];

type SortKey = "recent" | "engagement" | "views";

export function PostsTable({
  posts,
  loading,
  showPlatform = true,
  showFilters = true,
  competitorOptions,
  emptyAction,
  limit,
}: {
  posts: PostWithMetrics[];
  loading?: boolean;
  showPlatform?: boolean;
  showFilters?: boolean;
  competitorOptions?: { id: string; name: string }[];
  emptyAction?: React.ReactNode;
  limit?: number;
}) {
  const [sort, setSort] = useState<SortKey>("engagement");
  const [competitor, setCompetitor] = useState("all");
  const [type, setType] = useState("all");
  const [days, setDays] = useState("all");
  const [active, setActive] = useState<PostWithMetrics | null>(null);

  const rows = useMemo(() => {
    let list = [...posts];
    if (competitor !== "all") list = list.filter((p) => p.competitor_id === competitor);
    if (type !== "all") list = list.filter((p) => p.content_type === type);
    if (days !== "all") {
      const cutoff = Date.now() - Number(days) * 86400000;
      list = list.filter((p) => new Date(p.posted_at).getTime() >= cutoff);
    }
    list.sort((a, b) => {
      if (sort === "recent")
        return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
      if (sort === "views") return Number(b.metrics?.views ?? 0) - Number(a.metrics?.views ?? 0);
      return Number(b.metrics?.engagement_rate ?? 0) - Number(a.metrics?.engagement_rate ?? 0);
    });
    return limit ? list.slice(0, limit) : list;
  }, [posts, competitor, type, days, sort, limit]);

  return (
    <div className="panel overflow-hidden">
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-8 w-[170px] text-xs">
              <ArrowUpDown className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Highest engagement</SelectItem>
              <SelectItem value="views">Highest views</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>

          {competitorOptions && competitorOptions.length > 0 && (
            <Select value={competitor} onValueChange={setCompetitor}>
              <SelectTrigger className="h-8 w-[170px] text-xs">
                <SelectValue placeholder="Competitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All competitors</SelectItem>
                {competitorOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All formats</SelectItem>
              {CONTENT_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Once an ingestion run completes, competitor posts will appear here."
          action={emptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[280px]">Content</TableHead>
                {showPlatform && <TableHead>Platform</TableHead>}
                <TableHead>Competitor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Eng. rate</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setActive(p)}
                >
                  <TableCell className="max-w-[380px]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-raised text-[10px] uppercase text-muted-foreground">
                        {p.content_type.slice(0, 3)}
                      </div>
                      <span className="line-clamp-2 text-sm">{p.caption_text}</span>
                    </div>
                  </TableCell>
                  {showPlatform && (
                    <TableCell>
                      <PlatformChip platform={p.platform} />
                    </TableCell>
                  )}
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {p.competitors?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {p.content_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {shortDate(p.posted_at)}
                  </TableCell>
                  <TableCell className="num text-right text-sm">
                    {compact(p.metrics?.views)}
                  </TableCell>
                  <TableCell className="num text-right text-sm font-medium">
                    {pct(p.metrics?.engagement_rate)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button asChild variant="ghost" size="icon" className="size-7">
                      <a href={p.post_url} target="_blank" rel="noreferrer noopener">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ContentDrawer post={active} onOpenChange={(o) => !o && setActive(null)} />
    </div>
  );
}
