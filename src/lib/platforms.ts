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
  url: string;
  actor: string;
}[] = [
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    chart: "var(--chart-4)",
    url: "https://www.youtube.com",
    actor: "streamers~youtube-scraper",
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    chart: "var(--chart-5)",
    url: "https://www.facebook.com",
    actor: "apify~facebook-posts-scraper",
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    chart: "var(--chart-3)",
    url: "https://www.instagram.com",
    actor: "apify~instagram-scraper",
  },
  {
    id: "x",
    label: "X",
    icon: Twitter,
    chart: "var(--chart-1)",
    url: "https://x.com",
    actor: "apidojo~tweet-scraper",
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: MessageCircle,
    chart: "var(--chart-2)",
    url: "https://www.reddit.com",
    actor: "trudax~reddit-scraper-lite",
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Music2,
    chart: "var(--chart-1)",
    url: "https://www.tiktok.com",
    actor: "clockworks~tiktok-scraper",
  },
];

export function profileUrl(platform: Platform, handle: string) {
  const h = handle.replace(/^@/, "");
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/@${h}`;
    case "facebook":
      return `https://www.facebook.com/${h}`;
    case "instagram":
      return `https://www.instagram.com/${h}`;
    case "x":
      return `https://x.com/${h}`;
    case "reddit":
      return `https://www.reddit.com/r/${h}`;
    case "tiktok":
      return `https://www.tiktok.com/@${h}`;
  }
}


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
