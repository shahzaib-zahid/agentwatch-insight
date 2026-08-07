# Agent Pulse

Build a professional web dashboard called "AgentWatch" — a competitor content intelligence platform for a solo creator/agency operating in the Agentic AI / AI security niche. The product tracks top-performing competitor content across YouTube, Facebook, Instagram, X, Reddit, and TikTok, and generates content suggestions with a modeled "success probability" score.

Tech & Architecture

React + Tailwind frontend, Supabase for auth, database, and edge functions.

Apify is the data-ingestion layer: Supabase edge functions trigger Apify Actor runs (via the Apify API) on a schedule per competitor/platform, then an ingestion webhook/function receives the run results and upserts them into the posts and metrics tables. Store the Apify API token as a server-side secret — never expose it client-side.

Design should feel like a serious analytics tool (Linear / Vercel dashboard aesthetic) — dark mode default with a light mode toggle, clean data-dense tables, card-based KPI summaries, subtle motion on chart load. Not playful or consumer-social in tone.

Responsive: full desktop dashboard experience, usable but secondary-priority on mobile.

Data Model (core tables)

competitors — id, name, platform, handle/URL, niche_tags, added_date, active(bool)

posts — id, competitor_id, platform, post_url, content_type (reel/short/carousel/post/video/thread), caption_text, posted_at, thumbnail_url, pulled_at

metrics — post_id, views, likes, comments, shares, saves, engagement_rate (computed), last_updated

suggestions — id, based_on_post_id (nullable), suggested_topic, suggested_format, suggested_platform, rationale_text, success_probability (0-100), created_at

users/settings — auth, tracked competitor list, platform API connection status

Pages & Sections

1. Overview Dashboard (home)

KPI cards: total competitors tracked, posts ingested this week, avg engagement rate trend, top-performing platform this week.

A "This Week's Top 10" table pulling the highest-engagement posts across all platforms, with thumbnail, platform icon, competitor name, engagement rate, and a "View" action.

Small trend chart: engagement rate over last 30 days, filterable by platform.

2. Competitor Directory

Grid/table of tracked competitors with platform badges (a competitor may be tracked across multiple platforms — show as chips).

Add/edit competitor form: name, platform, handle/URL, niche tags, notes.

Per-competitor detail page: their post history table, average engagement, posting frequency, best-performing content type.

3. Platform Tabs (YouTube / Facebook / Instagram / X / Reddit / TikTok)

Each platform gets its own tab with a filterable, sortable content table: thumbnail, title/caption snippet, competitor, posted date, views, engagement rate, content type.

Sort by: most recent, highest engagement, highest views.

Filter by: competitor, content type, date range.

Each row expands to a Content Detail Drawer.

4. Content Detail Drawer/Page (opens from any post row)

Full metrics breakdown with a small bar chart (views/likes/comments/shares).

Embedded post preview (thumbnail + link out — do not attempt to re-host competitor media).

AI Suggestion Panel: 2-3 suggested content angles inspired by this post's structure/hook, each with:

Suggested topic/hook text

Suggested format (Reel, carousel, thread, etc.)

Success Probability score (0-100%) with a one-line rationale (e.g., "High-engagement hook pattern + underserved sub-topic")

A visible label/tooltip clarifying: "Modeled estimate based on historical engagement patterns — not a guarantee."

5. Suggestions Hub

Standalone feed of all AI-generated content suggestions across the account, sortable by success probability.

Each card: suggested topic, format, target platform, probability score (color-coded: green 70+, yellow 40-69, red <40), and a "Mark as Planned" action that pushes it into a lightweight content calendar view.

Filter by platform and by probability tier.

6. Content Calendar (lightweight)

Simple month-view calendar. Suggestions marked "Planned" appear on chosen dates. Manual entries allowed too.

Status tags: Idea → Planned → Posted.

7. Data Sources / Settings — Apify Integration

Apify connection panel: field to store the Apify API token (Supabase secret, not stored in a client-visible table), a "Test Connection" button, and account status (credits remaining, if the Apify API exposes it).

Per-platform Actor configuration: for each platform (YouTube, Facebook, Instagram, X, Reddit, TikTok), a settings row showing:

Which Apify Actor is assigned to that platform (dropdown or free-text Actor ID field, since the right Actor depends on what's available/maintained on the Apify Store at build time)

Run schedule (e.g., every 6h/12h/24h) — implemented via Supabase's pg_cron or a scheduled edge function calling the Apify "Run Actor" endpoint

Last run status (success/failed/running) and last successful pull timestamp

A manual "Run Now" trigger button per competitor or per platform

Ingestion log table/page: a simple table showing each Apify run (Actor, platform, competitor, items returned, timestamp, status) so failed or empty runs are visible and debuggable, not silent.

Field-mapping note for the build: Apify Actor output schemas vary by Actor and change over time, so the ingestion function should map incoming JSON fields to the posts/metrics schema defensively (missing-field fallbacks, not hard failures) rather than assuming a fixed shape.

User profile, notification preferences (e.g., weekly digest email of top content).

Success Probability Scoring — build as a transparent, explainable module

Score should be computed from a documented, adjustable formula (e.g., weighted combination of: engagement rate percentile vs. similar posts, hook/topic novelty vs. what's already been posted, competitor's historical performance for that content type, recency/trend alignment).

Show the scoring logic in an "How this is calculated" expandable info box wherever a score appears — never present it as a black-box guarantee.

Build the scoring as a modular function/edge function so the formula can be edited later without a frontend rebuild.

Non-functional requirements

Clean empty states for every table before any competitors/posts are added (with a clear "Add your first competitor" CTA).

Loading skeletons for data tables, not blank screens.

All external post links open in a new tab; never attempt to embed or replay competitor video/audio content directly — link out only, to respect platform ToS and copyright.

Include a persistent left sidebar nav: Overview, Competitors, Platforms (with sub-items per platform), Suggestions, Calendar, Settings.

Build this as a functioning frontend + Supabase schema first, using realistic seeded/mock data (10-15 mock competitors and ~50 mock posts across platforms) so the dashboard is demonstrable before real API integrations are wired in.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://agentwatch-insight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0897cd3c-5039-450a-b83b-ba657dfb1a36).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
