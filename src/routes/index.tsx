import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Layers, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/ui-bits";
import { PostsTable, POST_CSV_COLUMNS } from "@/components/PostsTable";
import { SpikeAlerts } from "@/components/SpikeAlerts";
import { ExportButton } from "@/components/ExportButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetitors, usePosts } from "@/lib/data";
import { PLATFORMS, platformMeta } from "@/lib/platforms";
import { pct } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — AgentWatch" },
      {
        name: "description",
        content:
          "Weekly competitor content performance across YouTube, Instagram, TikTok, X, Reddit and Facebook.",
      },
      { property: "og:title", content: "Overview — AgentWatch" },
      {
        property: "og:description",
        content: "Competitor content intelligence for the Agentic AI and AI security niche.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: posts = [], isLoading } = usePosts();
  const { data: competitors = [] } = useCompetitors();
  const [chartPlatform, setChartPlatform] = useState("all");

  const weekAgo = Date.now() - 7 * 86400000;
  const thisWeek = posts.filter((p) => new Date(p.pulled_at).getTime() >= weekAgo);

  const avgEngagement = posts.length
    ? posts.reduce((a, p) => a + Number(p.metrics?.engagement_rate ?? 0), 0) / posts.length
    : 0;

  const topPlatform = useMemo(() => {
    const byPlatform = new Map<string, { total: number; n: number }>();
    posts.forEach((p) => {
      const e = byPlatform.get(p.platform) ?? { total: 0, n: 0 };
      e.total += Number(p.metrics?.engagement_rate ?? 0);
      e.n += 1;
      byPlatform.set(p.platform, e);
    });
    let best = { id: "—", avg: 0 };
    byPlatform.forEach((v, k) => {
      const avg = v.total / v.n;
      if (avg > best.avg) best = { id: k, avg };
    });
    return best;
  }, [posts]);

  const trend = useMemo(() => {
    const source = chartPlatform === "all" ? posts : posts.filter((p) => p.platform === chartPlatform);
    const days: { date: string; rate: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000);
      const key = day.toISOString().slice(0, 10);
      const dayPosts = source.filter((p) => p.posted_at.slice(0, 10) === key);
      const rate = dayPosts.length
        ? dayPosts.reduce((a, p) => a + Number(p.metrics?.engagement_rate ?? 0), 0) / dayPosts.length
        : 0;
      days.push({
        date: day.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        rate: Number(rate.toFixed(2)),
      });
    }
    return days;
  }, [posts, chartPlatform]);

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title="Overview"
        description="Competitor content performance across all tracked platforms."
      />

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Competitors tracked"
          value={competitors.length}
          hint={`${competitors.filter((c) => c.active).length} active`}
          icon={<Users className="size-4" />}
          loading={isLoading}
        />
        <KpiCard
          label="Posts ingested (7d)"
          value={thisWeek.length}
          hint={`${posts.length} total in library`}
          icon={<Layers className="size-4" />}
          loading={isLoading}
          delay={60}
        />
        <KpiCard
          label="Avg engagement rate"
          value={pct(avgEngagement)}
          hint="Across all ingested posts"
          icon={<TrendingUp className="size-4" />}
          loading={isLoading}
          delay={120}
        />
        <KpiCard
          label="Top platform"
          value={topPlatform.id === "—" ? "—" : platformMeta(topPlatform.id).label}
          hint={`${pct(topPlatform.avg)} avg engagement`}
          icon={<Activity className="size-4" />}
          loading={isLoading}
          delay={180}
        />
      </div>

      <div className="px-6">
        <div className="panel animate-rise p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Engagement rate — last 30 days</h2>
              <p className="text-xs text-muted-foreground">Daily average across tracked posts</p>
            </div>
            <Select value={chartPlatform} onValueChange={setChartPlatform}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
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
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" minTickGap={24} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={40} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#eng)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        <h2 className="mb-3 text-sm font-semibold">This week's top 10</h2>
        <PostsTable posts={posts} loading={isLoading} showFilters={false} limit={10} />
      </div>
    </div>
  );
}
