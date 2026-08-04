import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export type Platform = "youtube" | "facebook" | "instagram" | "x" | "reddit" | "tiktok";
export type ContentType = "reel" | "short" | "carousel" | "post" | "video" | "thread";

export const PLATFORMS: {
  id: Platform;
  label: string;
  icon: LucideIcon;
  chart: string;
}[] = [
  { id: "youtube", label: "YouTube", icon: Youtube, chart: "var(--chart-4)" },
  { id: "facebook", label: "Facebook", icon: Facebook, chart: "var(--chart-5)" },
  { id: "instagram", label: "Instagram", icon: Instagram, chart: "var(--chart-3)" },
  { id: "x", label: "X", icon: Twitter, chart: "var(--chart-1)" },
  { id: "reddit", label: "Reddit", icon: MessageCircle, chart: "var(--chart-2)" },
  { id: "tiktok", label: "TikTok", icon: Music2, chart: "var(--chart-1)" },
];

export const CONTENT_TYPES: ContentType[] = [
  "reel",
  "short",
  "carousel",
  "post",
  "video",
  "thread",
];

export function platformMeta(id: string) {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]!;
}
