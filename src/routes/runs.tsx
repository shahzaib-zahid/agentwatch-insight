import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, CheckCircle2, CircleSlash, ExternalLink, Loader2 } from "lucide-react";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { ExportButton } from "@/components/ExportButton";
import { IngestButton } from "@/components/IngestButton";
import { EmptyState, KpiCard, PlatformChip, TableSkeleton } from "@/components/ui-bits";
import { Badge } from "@/components/ui/badge";
import { relativeDate, shortDate } from "@/lib/format";
import { PLATFORMS, platformMeta, profileUrl, type Platform } from "@/lib/platforms";
import {
  useIngestionRunDetails,
  usePlatformConfigs,
  type IngestionRunDetail,
} from "@/lib/data";

export const Route = createFileRoute("/runs")({
  head: () => ({
    meta: [
      { title: "Apify run details — AgentWatch" },
      {
        name: "description",
        content:
          "Actor status, last pulled time, and per-competitor reasons a platform scrape returned no results.",
      },
      { property: "og:title", content: "Apify run details — AgentWatch" },
      {
        property: "og:description",
        content: "Inspect every Apify actor run: status, timing, item counts, and empty-result diagnostics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RunsPage,
});

const STATUS_META: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  success: { label: "Success", className: "bg-success/15 text-success", icon: CheckCircle2 },
  empty: { label: "Empty", className: "bg-warning/15 text-warning", icon: CircleSlash },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive", icon: AlertTriangle },
  running: { label: "Running", className: "bg-primary/15 text-foreground", icon: Loader2 },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META["running"]!;
  const Icon = meta.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${meta.className}`}>
      <Icon className={`size-3 ${status === "running" ? "animate-spin" : ""}`} />
      {meta.label}
    </Badge>
  );
}

/** Human explanation for why a run produced no usable posts. */
function emptyReason(run: IngestionRunDetail): string | null {
  if (run.items_returned > 0) return null;
  const msg = (run.message ?? "").toLowerCase();
  if (run.status === "failed") {
    if (msg.includes("401") || msg.includes("403") || msg.includes("unauthorized"))
      return "Apify rejected the request — the actor isn't available on the connected plan, or the connection needs re-authorising.";
    if (msg.includes("404")) return "The actor ID could not be found on Apify.";
    if (msg.includes("429")) return "Apify rate-limited this run. It will succeed on a later retry.";
    if (msg.includes("timeout") || msg.includes("timed out"))
      return "The actor exceeded the 120s sync run window before returning items.";
    if (msg.includes("not configured"))
      return "The Apify connection isn't linked for this project, so no request was sent.";
    return run.message ?? "The actor run failed before returning any items.";
  }
  if (run.status === "empty") {
    return "The actor ran fine but returned zero items — usually a private/renamed profile, a handle with no recent public posts, or content the actor can't see without login.";
  }
  return null;
}

function RunsPage() {
  const { data: runs = [], isLoading } = useIngestionRunDetails();
  const { data: configs = [] } = usePlatformConfigs();

  const total = runs.length;
  const successes = runs.filter((r) => r.status === "success").length;
  const empties = runs.filter((r) => r.status === "empty").length;
  const failures = runs.filter((r) => r.status === "failed").length;
  const lastPulled = runs.find((r) => r.status === "success")?.started_at ?? null;

  const byPlatform = PLATFORMS.map((p) => {
    const cfg = configs.find((c) => c.platform === p.id);
    const platformRuns = runs.filter((r) => r.platform === p.id);
    const last = platformRuns[0] ?? null;
    return {
      platform: p.id as Platform,
      label: p.label,
      actor: cfg?.actor_id ?? p.actor,
      enabled: cfg?.enabled ?? true,
      scheduleHours: cfg?.schedule_hours ?? 24,
      lastStatus: cfg?.last_run_status ?? last?.status ?? null,
      lastSuccessAt: cfg?.last_success_at ?? null,
      lastRunAt: last?.started_at ?? null,
      items: platformRuns.reduce((s, r) => s + r.items_returned, 0),
      problems: platformRuns.filter((r) => r.items_returned === 0),
    };
  });

  return (
    <div className="flex flex-col">
      <MobileNav />
      <PageHeader
        title="Apify run details"
        description="Actor status per platform, when data was last pulled, and why individual competitors came back empty."
        action={
          <ExportButton
            filename="apify-runs"
            rows={runs}
            columns={[
              { header: "Started at", value: (r) => r.started_at },
              { header: "Platform", value: (r) => r.platform },
              { header: "Actor", value: (r) => r.actor_id ?? "" },
              { header: "Competitor", value: (r) => r.competitors?.name ?? "" },
              { header: "Handle", value: (r) => r.competitors?.handle ?? "" },
              { header: "Items", value: (r) => r.items_returned },
              { header: "Status", value: (r) => r.status },
              { header: "Message", value: (r) => r.message ?? "" },
              { header: "Diagnosis", value: (r) => emptyReason(r) ?? "" },
            ]}
          />
        }
      />

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        <KpiCard label="Runs logged" value={total} icon={<Activity className="size-4" />} loading={isLoading} />
        <KpiCard label="Successful" value={successes} hint={`${failures} failed`} loading={isLoading} />
        <KpiCard label="Empty results" value={empties} hint="Actor ran, returned nothing" loading={isLoading} />
        <KpiCard
          label="Last pulled"
          value={lastPulled ? relativeDate(lastPulled) : "Never"}
          hint={lastPulled ? shortDate(lastPulled) : "No successful run yet"}
          loading={isLoading}
        />
      </div>

      {/* Per-platform actor status */}
      <div className="px-4 pb-4 lg:px-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Actor status by platform</h2>
            <p className="text-xs text-muted-foreground">
              Each platform maps to one Apify actor. Run it manually to refresh the data now.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Platform</th>
                  <th className="px-4 py-2 text-left font-medium">Actor</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Last pulled</th>
                  <th className="px-4 py-2 text-right font-medium">Items</th>
                  <th className="px-4 py-2 text-right font-medium">Run</th>
                </tr>
              </thead>
              <tbody>
                {byPlatform.map((p) => (
                  <tr key={p.platform} className="border-t border-border/60">
                    <td className="px-4 py-2.5">
                      <PlatformChip platform={p.platform} />
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs text-muted-foreground">{p.actor}</code>
                      <span className="ml-2 text-xs text-muted-foreground">every {p.scheduleHours}h</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {p.lastStatus ? (
                        <StatusBadge status={p.lastStatus} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Not run yet</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {p.lastSuccessAt || p.lastRunAt ? (
                        <span title={shortDate(p.lastSuccessAt ?? p.lastRunAt)}>
                          {relativeDate(p.lastSuccessAt ?? p.lastRunAt)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="num px-4 py-2.5 text-right">{p.items}</td>
                    <td className="px-4 py-2.5 text-right">
                      <IngestButton platform={p.platform} label="Run" variant="outline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty / failed diagnostics */}
      <div className="px-4 pb-4 lg:px-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Why competitors returned no results</h2>
            <p className="text-xs text-muted-foreground">
              Every run that produced zero posts, grouped by platform, with the actor's own message.
            </p>
          </div>
          {isLoading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : byPlatform.every((p) => p.problems.length === 0) ? (
            <EmptyState
              title="No empty or failed runs"
              description="Every logged Apify run returned at least one post."
            />
          ) : (
            <div className="divide-y divide-border/60">
              {byPlatform
                .filter((p) => p.problems.length > 0)
                .map((p) => (
                  <div key={p.platform} className="px-4 py-3">
                    <div className="mb-2 flex items-center gap-2">
                      <PlatformChip platform={p.platform} />
                      <span className="text-xs text-muted-foreground">
                        {p.problems.length} run{p.problems.length === 1 ? "" : "s"} with no items
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {p.problems.map((r) => {
                        const handle = r.competitors?.handle ?? null;
                        const link =
                          r.competitors?.profile_url ??
                          (handle ? profileUrl(p.platform, handle) : platformMeta(p.platform).url);
                        return (
                          <li key={r.id} className="rounded-md border border-border/60 bg-muted/20 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={r.status} />
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                              >
                                {r.competitors?.name ?? "Unknown competitor"}
                                {handle ? (
                                  <span className="text-muted-foreground">@{handle.replace(/^@/, "")}</span>
                                ) : null}
                                <ExternalLink className="size-3 text-muted-foreground" />
                              </a>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {relativeDate(r.started_at)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm text-muted-foreground">{emptyReason(r)}</p>
                            {r.message ? (
                              <p className="mt-1 break-words font-mono text-xs text-muted-foreground/70">
                                {r.message}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Full log */}
      <div className="px-4 pb-8 lg:px-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Full run log</h2>
          </div>
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : runs.length === 0 ? (
            <EmptyState
              title="No runs yet"
              description="Trigger an ingestion above to start recording Apify actor runs."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Started</th>
                    <th className="px-4 py-2 text-left font-medium">Platform</th>
                    <th className="px-4 py-2 text-left font-medium">Competitor</th>
                    <th className="px-4 py-2 text-left font-medium">Actor</th>
                    <th className="px-4 py-2 text-right font-medium">Items</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-border/60">
                      <td className="px-4 py-2.5 text-muted-foreground">{shortDate(r.started_at)}</td>
                      <td className="px-4 py-2.5">
                        <PlatformChip platform={r.platform} />
                      </td>
                      <td className="px-4 py-2.5">{r.competitors?.name ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <code className="text-xs text-muted-foreground">{r.actor_id ?? "—"}</code>
                      </td>
                      <td className="num px-4 py-2.5 text-right">{r.items_returned}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
