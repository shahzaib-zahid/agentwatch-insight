import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { PostsTable } from "@/components/PostsTable";
import { IngestButton } from "@/components/IngestButton";
import { KpiCard } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { PLATFORMS, platformMeta } from "@/lib/platforms";
import { compact, pct } from "@/lib/format";
import { useCompetitors, usePosts } from "@/lib/data";


export const Route = createFileRoute("/platforms/$platform")({
  head: () => ({
    meta: [
      { title: "Platform breakdown — AgentWatch" },
      {
        name: "description",
        content: "Per-platform competitor content performance and format breakdown.",
      },
      { property: "og:title", content: "Platform breakdown — AgentWatch" },
      {
        property: "og:description",
        content: "See which competitor formats win on each social platform.",
      },
    ],
  }),
  component: PlatformDetail,
});

function PlatformDetail() {
  const { platform } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = platformMeta(platform);
  const { data: allPosts = [], isLoading } = usePosts();
  const { data: competitors = [] } = useCompetitors();

  const posts = allPosts.filter((p) => p.platform === platform);
  const avgEng = posts.length
    ? posts.reduce((a, p) => a + Number(p.metrics?.engagement_rate ?? 0), 0) / posts.length
    : 0;
  const views = posts.reduce((a, p) => a + Number(p.metrics?.views ?? 0), 0);
  const active = competitors.filter((c) => c.platform === platform);

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title={meta.label}
        description={`Top competitor content on ${meta.label}.`}
        action={
          <div className="flex items-center gap-2">
            <a
              href={meta.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
              {meta.url.replace("https://", "")}
            </a>
            <IngestButton platform={meta.id} />
          </div>
        }
      />


      <div className="flex gap-1 overflow-x-auto border-b border-border px-6 py-2">
        {PLATFORMS.map((p) => (
          <Link
            key={p.id}
            to="/platforms/$platform"
            params={{ platform: p.id }}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs transition-colors",
              pathname === `/platforms/${p.id}`
                ? "bg-surface-raised font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Posts tracked" value={posts.length} loading={isLoading} />
        <KpiCard label="Avg engagement" value={pct(avgEng)} loading={isLoading} delay={60} />
        <KpiCard label="Total views" value={compact(views)} loading={isLoading} delay={120} />
        <KpiCard label="Competitors" value={active.length} loading={isLoading} delay={180} />
      </div>

      <div className="px-6">
        <PostsTable
          posts={posts}
          loading={isLoading}
          showPlatform={false}
          competitorOptions={active.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
