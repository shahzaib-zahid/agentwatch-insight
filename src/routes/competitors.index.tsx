import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { MobileNav, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, PlatformChip, TableSkeleton } from "@/components/ui-bits";
import { PLATFORMS } from "@/lib/platforms";
import { shortDate } from "@/lib/format";
import { useAddCompetitor, useCompetitors, useToggleCompetitor } from "@/lib/data";

export const Route = createFileRoute("/competitors/")({
  head: () => ({
    meta: [
      { title: "Competitors — AgentWatch" },
      {
        name: "description",
        content: "Manage the creators and brands AgentWatch tracks across every platform.",
      },
      { property: "og:title", content: "Competitors — AgentWatch" },
      {
        property: "og:description",
        content: "Add, pause and review tracked competitors in the Agentic AI niche.",
      },
    ],
  }),
  component: CompetitorsPage,
});

function CompetitorsPage() {
  const { data: competitors = [], isLoading } = useCompetitors();
  const add = useAddCompetitor();
  const toggle = useToggleCompetitor();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<string>("youtube");
  const [url, setUrl] = useState("");

  async function submit() {
    if (!name.trim() || !handle.trim()) {
      toast.error("Name and handle are required");
      return;
    }
    try {
      await add.mutateAsync({
        name: name.trim(),
        handle: handle.trim(),
        platform,
        profile_url: url.trim() || null,
      });
      toast.success(`${name.trim()} is now being tracked`);
      setOpen(false);
      setName("");
      setHandle("");
      setUrl("");
    } catch (e) {
      toast.error("Could not add competitor");
    }
  }

  return (
    <div className="pb-12">
      <MobileNav />
      <PageHeader
        title="Competitors"
        description="Creators and brands AgentWatch monitors for high-performing content."
        action={
          <div className="flex items-center gap-2">
          <ExportButton
            filename="agentwatch-competitors"
            rows={competitors}
            columns={[
              { header: "Name", value: (c) => c.name },
              { header: "Handle", value: (c) => c.handle },
              { header: "Platform", value: (c) => c.platform },
              { header: "Profile URL", value: (c) => c.profile_url ?? "" },
              { header: "Niche tags", value: (c) => (c.niche_tags ?? []).join(" | ") },
              { header: "Active", value: (c) => (c.active ? "yes" : "no") },
              { header: "Added", value: (c) => c.added_date },
              { header: "Notes", value: (c) => c.notes ?? "" },
            ]}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4" /> Add competitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add competitor</DialogTitle>
                <DialogDescription>
                  New competitors are picked up on the next ingestion run.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Name</Label>
                  <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chandle">Handle</Label>
                  <Input
                    id="chandle"
                    placeholder="@handle"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className={
                          "rounded-md border px-2.5 py-1.5 text-xs transition-colors " +
                          (platform === p.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground")
                        }
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="curl">Profile URL</Label>
                  <Input id="curl" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={add.isPending}>
                  {add.isPending ? "Adding…" : "Add competitor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 py-5">
        <div className="panel overflow-hidden">
          {isLoading ? (
            <TableSkeleton />
          ) : competitors.length === 0 ? (
            <EmptyState
              title="No competitors yet"
              description="Add the creators you want AgentWatch to monitor."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Link
                          to="/competitors/$id"
                          params={{ id: c.id }}
                          className="text-sm font-medium hover:underline"
                        >
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.handle}</TableCell>
                      <TableCell>
                        <PlatformChip platform={c.platform} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {shortDate(c.added_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={c.active}
                          onCheckedChange={(v) =>
                            toggle.mutate({ id: c.id, active: v })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
