import type { PostWithMetrics } from "@/lib/data";

export type SpikeAlert = {
  post: PostWithMetrics;
  competitorName: string;
  engagement: number;
  baseline: number;
  multiplier: number;
  severity: "high" | "medium";
};

export const SPIKE_WINDOW_DAYS = 7;
export const SPIKE_THRESHOLD = 1.75; // x the competitor's own baseline
const MIN_BASELINE_POSTS = 3;

/**
 * A "spike" is a recent post whose engagement rate materially outperforms
 * the same competitor's median engagement rate across their post history.
 */
export function detectSpikes(
  posts: PostWithMetrics[],
  opts?: { windowDays?: number; threshold?: number },
): SpikeAlert[] {
  const windowDays = opts?.windowDays ?? SPIKE_WINDOW_DAYS;
  const threshold = opts?.threshold ?? SPIKE_THRESHOLD;
  const cutoff = Date.now() - windowDays * 86400000;

  const byCompetitor = new Map<string, PostWithMetrics[]>();
  for (const p of posts) {
    const list = byCompetitor.get(p.competitor_id) ?? [];
    list.push(p);
    byCompetitor.set(p.competitor_id, list);
  }

  const alerts: SpikeAlert[] = [];
  byCompetitor.forEach((list, competitorId) => {
    void competitorId;
    if (list.length < MIN_BASELINE_POSTS) return;
    const rates = list
      .map((p) => Number(p.metrics?.engagement_rate ?? 0))
      .sort((a, b) => a - b);
    const mid = Math.floor(rates.length / 2);
    const baseline =
      rates.length % 2 === 0 ? ((rates[mid - 1] ?? 0) + (rates[mid] ?? 0)) / 2 : (rates[mid] ?? 0);
    if (baseline <= 0) return;

    for (const p of list) {
      if (new Date(p.posted_at).getTime() < cutoff) continue;
      const engagement = Number(p.metrics?.engagement_rate ?? 0);
      const multiplier = engagement / baseline;
      if (multiplier < threshold) continue;
      alerts.push({
        post: p,
        competitorName: p.competitors?.name ?? "Unknown competitor",
        engagement,
        baseline,
        multiplier,
        severity: multiplier >= threshold * 1.5 ? "high" : "medium",
      });
    }
  });

  return alerts.sort((a, b) => b.multiplier - a.multiplier);
}
