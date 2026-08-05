import { createFileRoute } from "@tanstack/react-router";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { ExportButton } from "@/components/ExportButton";
import { EmptyState, PlatformChip } from "@/components/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarItems } from "@/lib/data";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Content calendar — AgentWatch" },
      {
        name: "description",
        content: "A simple two-week planning view for ideas you've committed to publishing.",
      },
      { property: "og:title", content: "Content calendar — AgentWatch" },
      {
        property: "og:description",
        content: "Plan scored content ideas across platforms over the next two weeks.",
      },
    ],
  }),
  component: CalendarPage,
});

const STATUS_STYLES: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  planned: "bg-primary/15 text-foreground",
  posted: "bg-success/15 text-success",
};

function CalendarPage() {
  const { data: items = [], isLoading } = useCalendarItems();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => new Date(start.getTime() + i * 86400000));

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title="Content calendar"
        description="The next two weeks of planned content, grouped by day."
        action={
          <ExportButton
            filename="agentwatch-calendar"
            rows={items}
            columns={[
              { header: "Title", value: (i) => i.title },
              { header: "Platform", value: (i) => i.platform },
              { header: "Format", value: (i) => i.format },
              { header: "Scheduled for", value: (i) => i.scheduled_for },
              { header: "Status", value: (i) => i.status },
            ]}
          />
        }
      />

      <div className="px-6 py-5">
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : items.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="Nothing scheduled"
              description="Add an idea from the Content ideas page to start planning."
            />
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {days.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const dayItems = items.filter((i) => i.scheduled_for.slice(0, 10) === key);
              return (
                <div key={key} className="panel min-h-32 p-2.5">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                  </p>
                  <div className="space-y-1.5">
                    {dayItems.map((i) => (
                      <div key={i.id} className="rounded-md bg-surface-raised p-2">
                        <p className="line-clamp-3 text-xs leading-snug">{i.title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1">
                          <PlatformChip platform={i.platform} />
                          <Badge
                            variant="secondary"
                            className={`capitalize ${STATUS_STYLES[i.status] ?? ""}`}
                          >
                            {i.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
