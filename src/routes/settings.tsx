import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { PlatformChip } from "@/components/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThemeToggle } from "@/components/ThemeToggle";
import { relativeDate } from "@/lib/format";
import { SCORING_WEIGHTS, SIGNAL_LABELS, SCORING_DISCLAIMER } from "@/lib/scoring";
import { useAppSettings, useIngestionRuns, usePlatformConfigs } from "@/lib/data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AgentWatch" },
      {
        name: "description",
        content: "Ingestion schedules, scraping run history, scoring weights and notifications.",
      },
      { property: "og:title", content: "Settings — AgentWatch" },
      {
        property: "og:description",
        content: "Configure AgentWatch ingestion, scoring and notification preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const STATUS_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="size-3.5 text-success" />,
  failed: <CircleAlert className="size-3.5 text-destructive" />,
  running: <Loader2 className="size-3.5 animate-spin text-muted-foreground" />,
  empty: <CircleAlert className="size-3.5 text-warning" />,
};

function SettingsPage() {
  const { data: configs = [], isLoading: loadingConfigs } = usePlatformConfigs();
  const { data: runs = [], isLoading: loadingRuns } = useIngestionRuns();
  const { data: settings } = useAppSettings();

  return (
    <div className="pb-16">
      <MobileNav />
      <PageHeader
        title="Settings"
        description="Ingestion, scoring and notification configuration."
        action={<ThemeToggle />}
      />

      <div className="space-y-6 px-6 py-5">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Data source</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Scraping is powered by Apify actors. The API token is stored server-side as a secret
            and is never exposed to the browser.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={settings?.apify_token_configured ? "default" : "secondary"}>
              {settings?.apify_token_configured ? "Token configured" : "Token not configured"}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => toast.info("Ingestion runs on its scheduled interval.")}>
              <RefreshCw className="size-4" /> Trigger manual run
            </Button>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-semibold">Platform schedules</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              How often each platform's actor is polled.
            </p>
          </div>
          {loadingConfigs ? (
            <Skeleton className="m-4 h-40" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Platform</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Last run</TableHead>
                    <TableHead className="text-right">Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((c) => (
                    <TableRow key={c.platform}>
                      <TableCell>
                        <PlatformChip platform={c.platform} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {c.actor_id ?? "—"}
                      </TableCell>
                      <TableCell className="num text-sm">every {c.schedule_hours}h</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          {STATUS_ICON[c.last_run_status ?? ""] ?? null}
                          {c.last_success_at ? relativeDate(c.last_success_at) : "never"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch checked={c.enabled} disabled />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Scoring weights</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The success probability model is a weighted blend of four signals.
          </p>
          <div className="mt-3 space-y-2">
            {(Object.keys(SCORING_WEIGHTS) as (keyof typeof SCORING_WEIGHTS)[]).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-56 shrink-0 text-xs text-muted-foreground">
                  {SIGNAL_LABELS[k]}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${SCORING_WEIGHTS[k] * 100}%` }}
                  />
                </div>
                <span className="num w-10 text-right text-xs font-medium">
                  {Math.round(SCORING_WEIGHTS[k] * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] italic text-muted-foreground">{SCORING_DISCLAIMER}</p>
        </section>

        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Weekly digest</Label>
                <p className="text-xs text-muted-foreground">
                  A Monday summary of the week's top competitor content.
                </p>
              </div>
              <Switch defaultChecked={settings?.weekly_digest ?? true} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Alert on failed runs</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when an ingestion run fails or returns nothing.
                </p>
              </div>
              <Switch defaultChecked={settings?.alert_on_failed_runs ?? true} />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="email">Notification email</Label>
              <Input id="email" defaultValue={settings?.email ?? ""} className="max-w-sm" />
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-semibold">Recent ingestion runs</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Every scrape attempt is logged so failures are visible, not silent.
            </p>
          </div>
          {loadingRuns ? (
            <Skeleton className="m-4 h-40" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Started</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {relativeDate(r.started_at)}
                      </TableCell>
                      <TableCell>
                        <PlatformChip platform={r.platform} />
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-sm capitalize">
                          {STATUS_ICON[r.status] ?? null}
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="num text-right text-sm">{r.items_returned}</TableCell>
                      <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                        {r.message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
