/**
 * Success Probability scoring module.
 *
 * Deliberately transparent + adjustable: change the weights or the signal
 * functions here (or call the /api/public/score endpoint, which uses this same
 * module server-side) without touching any UI code.
 */

export type ScoreSignals = {
  /** 0-100: how this post's engagement rate ranks against comparable posts */
  engagement_percentile: number;
  /** 0-100: how novel the topic/hook is vs. what has already been posted */
  topic_novelty: number;
  /** 0-100: competitor's historical performance for this content format */
  competitor_format_fit: number;
  /** 0-100: recency / trend alignment of the source post */
  recency_alignment: number;
};

export const SCORING_WEIGHTS: Record<keyof ScoreSignals, number> = {
  engagement_percentile: 0.4,
  topic_novelty: 0.25,
  competitor_format_fit: 0.2,
  recency_alignment: 0.15,
};

export const SIGNAL_LABELS: Record<keyof ScoreSignals, string> = {
  engagement_percentile: "Engagement percentile vs. similar posts",
  topic_novelty: "Topic / hook novelty vs. what you've posted",
  competitor_format_fit: "Competitor's historical performance for this format",
  recency_alignment: "Recency & trend alignment",
};

export const SCORING_DISCLAIMER =
  "Modeled estimate based on historical engagement patterns — not a guarantee.";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computeSuccessProbability(signals: Partial<ScoreSignals>): number {
  let total = 0;
  let weightUsed = 0;
  (Object.keys(SCORING_WEIGHTS) as (keyof ScoreSignals)[]).forEach((key) => {
    const value = signals[key];
    if (typeof value !== "number" || Number.isNaN(value)) return;
    const w = SCORING_WEIGHTS[key];
    total += clamp(value) * w;
    weightUsed += w;
  });
  if (weightUsed === 0) return 50;
  return clamp(total / weightUsed);
}

export function scoreTier(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function engagementPercentile(rate: number, allRates: number[]): number {
  if (allRates.length === 0) return 50;
  const below = allRates.filter((r) => r < rate).length;
  return clamp((below / allRates.length) * 100);
}
