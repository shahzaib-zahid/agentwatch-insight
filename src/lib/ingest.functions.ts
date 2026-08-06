import { createServerFn } from "@tanstack/react-start";
import type { Platform } from "@/lib/platforms";

const VALID: Platform[] = ["youtube", "facebook", "instagram", "x", "reddit", "tiktok"];

export const runIngestion = createServerFn({ method: "POST" })
  .inputValidator((input: { platform: Platform }) => {
    if (!input || !VALID.includes(input.platform)) throw new Error("Invalid platform");
    return { platform: input.platform };
  })
  .handler(async ({ data }) => {
    const { ingestPlatform } = await import("@/lib/apify.server");
    return await ingestPlatform(data.platform);
  });
