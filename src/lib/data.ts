import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Platform, ContentType } from "@/lib/platforms";

export type Metrics = {
  post_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number;
  last_updated: string;
};

export type Competitor = {
  id: string;
  name: string;
  platform: Platform;
  handle: string;
  profile_url: string | null;
  niche_tags: string[];
  notes: string | null;
  active: boolean;
  added_date: string;
};

export type PostWithMetrics = {
  id: string;
  competitor_id: string;
  platform: Platform;
  post_url: string;
  content_type: ContentType;
  caption_text: string | null;
  posted_at: string;
  thumbnail_url: string | null;
  pulled_at: string;
  competitors: { name: string; handle: string } | null;
  metrics: Metrics | null;
};

export type Suggestion = {
  id: string;
  based_on_post_id: string | null;
  suggested_topic: string;
  suggested_format: ContentType;
  suggested_platform: Platform;
  rationale_text: string;
  success_probability: number;
  score_breakdown: Record<string, number>;
  status: "idea" | "planned" | "posted";
  created_at: string;
};

export type CalendarItem = {
  id: string;
  suggestion_id: string | null;
  title: string;
  platform: Platform;
  format: ContentType;
  scheduled_for: string;
  status: "idea" | "planned" | "posted";
};

export type PlatformConfig = {
  platform: Platform;
  actor_id: string | null;
  schedule_hours: number;
  enabled: boolean;
  last_run_status: "success" | "failed" | "running" | "empty" | null;
  last_success_at: string | null;
};

export type IngestionRun = {
  id: string;
  platform: Platform;
  actor_id: string | null;
  competitor_id: string | null;
  items_returned: number;
  status: "success" | "failed" | "running" | "empty";
  message: string | null;
  started_at: string;
};

const POST_SELECT = "*, competitors(name, handle), metrics(*)";

export function useCompetitors() {
  return useQuery({
    queryKey: ["competitors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as Competitor[];
    },
  });
}

export function useAddCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      handle: string;
      platform: string;
      profile_url: string | null;
    }) => {
      const { error } = await supabase.from("competitors").insert(input as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitors"] }),
  });
}

export function useToggleCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("competitors").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competitors"] }),
  });
}

export function useCompetitor(id: string) {
  return useQuery({
    queryKey: ["competitor", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Competitor | null;
    },
  });
}

export function usePosts(filters?: { platform?: Platform; competitorId?: string }) {
  return useQuery({
    queryKey: ["posts", filters?.platform ?? "all", filters?.competitorId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("posts").select(POST_SELECT).order("posted_at", { ascending: false });
      if (filters?.platform) q = q.eq("platform", filters.platform);
      if (filters?.competitorId) q = q.eq("competitor_id", filters.competitorId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PostWithMetrics[];
    },
  });
}

export function useSuggestions() {
  return useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("success_probability", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Suggestion[];
    },
  });
}

export function useSuggestionsForPost(postId: string | null) {
  return useQuery({
    enabled: !!postId,
    queryKey: ["suggestions", "post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .eq("based_on_post_id", postId!)
        .order("success_probability", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Suggestion[];
    },
  });
}

export function useCalendarItems() {
  return useQuery({
    queryKey: ["calendar_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_items")
        .select("*")
        .order("scheduled_for");
      if (error) throw error;
      return (data ?? []) as unknown as CalendarItem[];
    },
  });
}

export function usePlatformConfigs() {
  return useQuery({
    queryKey: ["platform_configs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_configs").select("*");
      if (error) throw error;
      return (data ?? []) as unknown as PlatformConfig[];
    },
  });
}

export function useIngestionRuns() {
  return useQuery({
    queryKey: ["ingestion_runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingestion_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as IngestionRun[];
    },
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").maybeSingle();
      if (error) throw error;
      return data as unknown as {
        id: boolean;
        display_name: string;
        email: string | null;
        weekly_digest: boolean;
        alert_on_failed_runs: boolean;
        apify_token_configured: boolean;
      } | null;
    },
  });
}

export function engagementRate(p: PostWithMetrics) {
  return Number(p.metrics?.engagement_rate ?? 0);
}

export function useAddCalendarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      suggestion_id: string;
      title: string;
      platform: string;
      format: string;
    }) => {
      const scheduled = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
      const { error } = await supabase
        .from("calendar_items")
        .insert({ ...input, scheduled_for: scheduled, status: "planned" } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar_items"] }),
  });
}
