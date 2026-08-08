import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { PostsTable } from "@/components/PostsTable";
import { KpiCard, PlatformChip } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useCompetitors, usePosts } from "@/lib/data";
import { compact, pct, shortDate } from "@/lib/format";

export const Route = createFileRoute("/competitors/$id")({
  head: () => ({
    meta: [
      { title: "Competitor detail — AgentWatch" },
      {
        name: "description",
        content: "Per-competitor content history, engagement averages and best formats.",
      },
      { property: "og:title", content: "Competitor detail — AgentWatch" },
      {
        property: "og:description",
        content: "Drill into a single competitor's top-performing content.",
      },
    ],
  }),
  component: CompetitorDetail,
});

function CompetitorDetail() {
  const { id } = Route.useParams();
  const { data: competitors = [] } = useCompetitors();
  const { data: allPosts = [], isLoading } = usePosts();

  const competitor = competitors.find((c) => c.id === id);
  const posts = allPosts.filter((p) => p.competitor_id === id);

  const avgEng = posts.length
    ? posts.reduce((a, p) => a + Number(p.metrics?.engagement_rate ?? 0), 0) / posts.length
    : 0;
  const totalViews = posts.reduce((a, p) => a + Number(p.metrics?.views ?? 0), 0);

  const formatCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.content_type] = (acc[p.content_type] ?? 0) + 1;
    return acc;
  }, {});
  const bestFormat =
    Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title={competitor?.name ?? "Competitor"}
        description={
          competitor
            ? `${competitor.handle} · added ${shortDate(competitor.added_date)}`
            : "Loading competitor…"
        }
        action={
          <Button asChild variant="secondary" size="sm">
            <Link to="/competitors">
              <ArrowLeft className="size-4" /> All competitors
            </Link>
          </Button>
        }
      />

      <section className="px-6 py-5">
        <h2 className="mb-3 text-sm font-semibold">Performance summary</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Posts tracked" value={posts.length} loading={isLoading} />
        <KpiCard label="Avg engagement" value={pct(avgEng)} loading={isLoading} delay={60} />
        <KpiCard label="Total views" value={compact(totalViews)} loading={isLoading} delay={120} />
        <KpiCard
          label="Best format"
          value={<span className="capitalize">{bestFormat}</span>}
          loading={isLoading}
          delay={180}
        />
      </div>

      {competitor && (
        <div className="px-6 pb-3">
          <PlatformChip platform={competitor.platform} />
        </div>
      )}

      <div className="px-6">
        <PostsTable posts={posts} loading={isLoading} />
      </div>
    </div>
  );
}
