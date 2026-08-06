import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runIngestion } from "@/lib/ingest.functions";
import type { Platform } from "@/lib/platforms";

export function IngestButton({
  platform,
  label = "Fetch live data",
  size = "sm",
  variant = "secondary",
}: {
  platform: Platform;
  label?: string;
  size?: "sm" | "default";
  variant?: "secondary" | "outline" | "default";
}) {
  const run = useServerFn(runIngestion);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      size={size}
      variant={variant}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const id = toast.loading(`Scraping live ${platform} data…`);
        try {
          const res = await run({ data: { platform } });
          if (res.status === "failed") {
            toast.error(`Ingestion failed`, { id, description: res.failures[0] ?? "No data returned" });
          } else if (res.items === 0) {
            toast.warning("No new items returned", {
              id,
              description: res.competitors === 0 ? "No active competitors on this platform." : undefined,
            });
          } else {
            toast.success(`Pulled ${res.items} posts`, {
              id,
              description: `${res.competitors} competitor profile(s) scraped via Apify.`,
            });
          }
          qc.invalidateQueries();
        } catch (e) {
          toast.error("Ingestion failed", {
            id,
            description: e instanceof Error ? e.message : String(e),
          });
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
      {label}
    </Button>
  );
}
