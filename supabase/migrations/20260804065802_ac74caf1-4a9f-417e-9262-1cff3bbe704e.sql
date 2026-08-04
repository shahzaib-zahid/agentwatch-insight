
CREATE TYPE public.platform AS ENUM ('youtube','facebook','instagram','x','reddit','tiktok');
CREATE TYPE public.content_type AS ENUM ('reel','short','carousel','post','video','thread');
CREATE TYPE public.plan_status AS ENUM ('idea','planned','posted');
CREATE TYPE public.run_status AS ENUM ('success','failed','running','empty');

CREATE TABLE public.competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform public.platform NOT NULL,
  handle text NOT NULL,
  profile_url text,
  niche_tags text[] NOT NULL DEFAULT '{}',
  notes text,
  active boolean NOT NULL DEFAULT true,
  added_date timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  platform public.platform NOT NULL,
  post_url text NOT NULL,
  content_type public.content_type NOT NULL,
  caption_text text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  thumbnail_url text,
  pulled_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX posts_competitor_idx ON public.posts(competitor_id);
CREATE INDEX posts_platform_idx ON public.posts(platform);

CREATE TABLE public.metrics (
  post_id uuid PRIMARY KEY REFERENCES public.posts(id) ON DELETE CASCADE,
  views bigint NOT NULL DEFAULT 0,
  likes bigint NOT NULL DEFAULT 0,
  comments bigint NOT NULL DEFAULT 0,
  shares bigint NOT NULL DEFAULT 0,
  saves bigint NOT NULL DEFAULT 0,
  engagement_rate numeric GENERATED ALWAYS AS (
    CASE WHEN views > 0 THEN round(((likes + comments + shares + saves)::numeric / views) * 100, 2) ELSE 0 END
  ) STORED,
  last_updated timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  based_on_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  suggested_topic text NOT NULL,
  suggested_format public.content_type NOT NULL,
  suggested_platform public.platform NOT NULL,
  rationale_text text NOT NULL,
  success_probability integer NOT NULL DEFAULT 50 CHECK (success_probability BETWEEN 0 AND 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.plan_status NOT NULL DEFAULT 'idea',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.calendar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid REFERENCES public.suggestions(id) ON DELETE SET NULL,
  title text NOT NULL,
  platform public.platform NOT NULL,
  format public.content_type NOT NULL,
  scheduled_for date NOT NULL,
  status public.plan_status NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.platform_configs (
  platform public.platform PRIMARY KEY,
  actor_id text,
  schedule_hours integer NOT NULL DEFAULT 24,
  enabled boolean NOT NULL DEFAULT true,
  last_run_status public.run_status,
  last_success_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.platform NOT NULL,
  actor_id text,
  competitor_id uuid REFERENCES public.competitors(id) ON DELETE SET NULL,
  items_returned integer NOT NULL DEFAULT 0,
  status public.run_status NOT NULL DEFAULT 'running',
  message text,
  started_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  display_name text NOT NULL DEFAULT 'AgentWatch Operator',
  email text,
  weekly_digest boolean NOT NULL DEFAULT true,
  alert_on_failed_runs boolean NOT NULL DEFAULT true,
  apify_token_configured boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitors, public.posts, public.metrics, public.suggestions, public.calendar_items, public.platform_configs, public.ingestion_runs, public.app_settings TO anon, authenticated;
GRANT ALL ON public.competitors, public.posts, public.metrics, public.suggestions, public.calendar_items, public.platform_configs, public.ingestion_runs, public.app_settings TO service_role;

ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo open access" ON public.competitors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.suggestions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.calendar_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.platform_configs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.ingestion_runs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.app_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.app_settings (id, email) VALUES (true, 'operator@agentwatch.io');

INSERT INTO public.platform_configs (platform, actor_id, schedule_hours, last_run_status, last_success_at) VALUES
 ('youtube','streamers/youtube-scraper',12,'success', now() - interval '4 hours'),
 ('instagram','apify/instagram-scraper',6,'success', now() - interval '2 hours'),
 ('tiktok','clockworks/tiktok-scraper',6,'failed', now() - interval '1 day'),
 ('x','apidojo/tweet-scraper',12,'success', now() - interval '9 hours'),
 ('reddit','trudax/reddit-scraper',24,'success', now() - interval '20 hours'),
 ('facebook','apify/facebook-posts-scraper',24,'empty', now() - interval '2 days');

INSERT INTO public.competitors (name, platform, handle, profile_url, niche_tags, notes) VALUES
 ('Agentic Labs','youtube','@agenticlabs','https://youtube.com/@agenticlabs','{"agentic-ai","tooling"}','Weekly long-form agent build-alongs.'),
 ('PromptShield','youtube','@promptshield','https://youtube.com/@promptshield','{"ai-security","prompt-injection"}','Strong on red-teaming demos.'),
 ('Vector Defense','instagram','@vectordefense','https://instagram.com/vectordefense','{"ai-security","enterprise"}','Carousel-heavy explainer account.'),
 ('AutoAgent Daily','instagram','@autoagentdaily','https://instagram.com/autoagentdaily','{"agentic-ai","news"}','High posting frequency, reels.'),
 ('Red Team Rachel','x','@redteamrachel','https://x.com/redteamrachel','{"ai-security","red-teaming"}','Threads perform best.'),
 ('LLMOps Weekly','x','@llmopsweekly','https://x.com/llmopsweekly','{"llmops","agentic-ai"}','Newsletter cross-posts.'),
 ('The Agent Stack','tiktok','@theagentstack','https://tiktok.com/@theagentstack','{"agentic-ai","dev-tools"}','Short hook-driven explainers.'),
 ('Secure The Model','tiktok','@securethemodel','https://tiktok.com/@securethemodel','{"ai-security","compliance"}','Fast-growing account.'),
 ('r/AgenticAI Watch','reddit','u/agenticai_watch','https://reddit.com/user/agenticai_watch','{"agentic-ai","community"}','Deep technical write-ups.'),
 ('AI Risk Digest','reddit','u/ai_risk_digest','https://reddit.com/user/ai_risk_digest','{"ai-security","governance"}','Policy and risk framing.'),
 ('Guardrails Group','facebook','guardrailsgroup','https://facebook.com/guardrailsgroup','{"ai-security","enterprise"}','B2B audience, slower cadence.'),
 ('Build With Agents','facebook','buildwithagents','https://facebook.com/buildwithagents','{"agentic-ai","education"}','Community-driven posts.');

WITH hooks(txt, ctype) AS (
  VALUES
   ('I gave an AI agent access to my terminal for 24 hours. Here is what broke.','video'),
   ('Prompt injection is not a bug, it is the default behaviour of your agent','short'),
   ('The 3-layer guardrail stack every agentic app needs','carousel'),
   ('Your RAG pipeline is leaking data and you cannot see it','reel'),
   ('Stop giving agents tool access without a permission boundary','thread'),
   ('We red-teamed 12 agent frameworks. Only 2 survived.','post'),
   ('Why memory poisoning is the next big AI security story','video'),
   ('A 60-second audit for any agent you deploy this week','short'),
   ('Multi-agent systems fail in ways nobody warns you about','thread'),
   ('The cheapest way to sandbox an autonomous agent','reel'),
   ('Everyone is shipping agents. Almost nobody is logging them.','post'),
   ('Tool-calling security checklist we use before every launch','carousel')
),
numbered AS (
  SELECT c.id AS cid, c.platform AS plat, h.txt AS txt, h.ctype::public.content_type AS ctype,
         row_number() OVER (ORDER BY c.name, h.txt) AS rn
  FROM public.competitors c
  CROSS JOIN LATERAL (SELECT * FROM hooks ORDER BY md5(c.name || hooks.txt) LIMIT 5) h
),
ins AS (
  INSERT INTO public.posts (competitor_id, platform, post_url, content_type, caption_text, posted_at, thumbnail_url, pulled_at)
  SELECT n.cid, n.plat,
         'https://example.com/' || n.plat || '/post/' || n.rn,
         CASE
           WHEN n.plat = 'youtube' THEN (CASE WHEN n.rn % 2 = 0 THEN 'video' ELSE 'short' END)::public.content_type
           WHEN n.plat = 'x' THEN (CASE WHEN n.rn % 2 = 0 THEN 'thread' ELSE 'post' END)::public.content_type
           WHEN n.plat = 'reddit' THEN 'post'::public.content_type
           WHEN n.plat = 'tiktok' THEN 'short'::public.content_type
           WHEN n.plat = 'instagram' THEN (CASE WHEN n.rn % 2 = 0 THEN 'reel' ELSE 'carousel' END)::public.content_type
           ELSE n.ctype
         END,
         n.txt,
         now() - ((n.rn * 17) % 29) * interval '1 day' - (n.rn % 11) * interval '1 hour',
         NULL,
         now() - interval '3 hours'
  FROM numbered n
  RETURNING id, (extract(day from posted_at)::int + length(caption_text)) AS seed
)
INSERT INTO public.metrics (post_id, views, likes, comments, shares, saves)
SELECT id,
       2000 + ((seed * 7919) % 480000),
       80 + ((seed * 104729) % 21000),
       5 + ((seed * 12997) % 1400),
       2 + ((seed * 15485) % 900),
       1 + ((seed * 32452) % 2600)
FROM ins;

INSERT INTO public.suggestions (based_on_post_id, suggested_topic, suggested_format, suggested_platform, rationale_text, success_probability, score_breakdown)
SELECT p.id,
       CASE (row_number() OVER (ORDER BY m.engagement_rate DESC)) % 5
         WHEN 0 THEN 'Rebuild this hook as a "what breaks first" teardown of an agent with tool access'
         WHEN 1 THEN 'Turn this into a 5-step guardrail checklist creators can screenshot'
         WHEN 2 THEN 'Contrarian angle: why most prompt-injection advice is already outdated'
         WHEN 3 THEN 'Case-study format: one real agent incident, three preventable causes'
         ELSE 'Beginner framing: explain agent permission boundaries with a physical analogy'
       END,
       (CASE (row_number() OVER (ORDER BY m.engagement_rate DESC)) % 4
         WHEN 0 THEN 'reel' WHEN 1 THEN 'thread' WHEN 2 THEN 'carousel' ELSE 'short' END)::public.content_type,
       p.platform,
       CASE (row_number() OVER (ORDER BY m.engagement_rate DESC)) % 3
         WHEN 0 THEN 'High-engagement hook pattern + underserved sub-topic in your niche'
         WHEN 1 THEN 'Strong engagement percentile, but topic novelty is moderate — expect solid not viral'
         ELSE 'Format matches the competitor''s best-performing type, recency alignment is strong'
       END,
       LEAST(97, GREATEST(18, round(m.engagement_rate * 6)::int + 22)),
       jsonb_build_object('engagement_percentile', LEAST(99, round(m.engagement_rate * 8)::int),
                          'topic_novelty', 40 + (length(p.caption_text) % 55),
                          'competitor_format_fit', 50 + (length(p.caption_text) % 45),
                          'recency_alignment', 60 + (length(p.caption_text) % 35))
FROM public.posts p
JOIN public.metrics m ON m.post_id = p.id
ORDER BY m.engagement_rate DESC
LIMIT 14;

INSERT INTO public.calendar_items (suggestion_id, title, platform, format, scheduled_for, status)
SELECT s.id, s.suggested_topic, s.suggested_platform, s.suggested_format,
       (current_date + ((((row_number() OVER (ORDER BY s.success_probability DESC)) * 3) % 26))::int), 'planned'
FROM public.suggestions s
ORDER BY s.success_probability DESC
LIMIT 4;

UPDATE public.suggestions SET status = 'planned'
WHERE id IN (SELECT suggestion_id FROM public.calendar_items WHERE suggestion_id IS NOT NULL);

INSERT INTO public.ingestion_runs (platform, actor_id, competitor_id, items_returned, status, message, started_at)
SELECT pc.platform, pc.actor_id, c.id,
       CASE WHEN pc.last_run_status = 'failed' THEN 0 ELSE 5 + (length(c.name) % 20) END,
       COALESCE(pc.last_run_status, 'success'),
       CASE WHEN pc.last_run_status = 'failed' THEN 'Actor run timed out after 300s' WHEN pc.last_run_status = 'empty' THEN 'Run finished with 0 items — check actor input mapping' ELSE 'Mapped items into posts/metrics' END,
       now() - (length(c.name) % 30) * interval '1 hour'
FROM public.platform_configs pc
JOIN public.competitors c ON c.platform = pc.platform;
