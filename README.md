# Fyloo Pin Scheduler — Artisanal Pinterest Studio

A comprehensive, handcrafted Pinterest automation and creator intelligence suite built specifically for maker and artisan shops.
100% original design, responsive handmade-craft look with warm cream canvas and deep red accents.

## Live Deployment & Architecture

- **Code Repository**: [asadimalik677/fyloo-pin-scheduler](https://github.com/asadimalik677/fyloo-pin-scheduler)
- **Live Production URL**: [https://fyloo-pin-scheduler.vercel.app](https://fyloo-pin-scheduler.vercel.app)
- **Deployment Platform**: Vercel Hobby Free Tier (Serverless, zero laptop hosting required)
- **Database**: Supabase Free Tier Postgres (with durable store fallback)
- **Authentication**: Supabase Auth Free Tier (Email & Password)
- **Publishing Engine**: Official Pinterest API v5 (OAuth authorized publishing + `/api/publish-due` cron)

---

## Complete Feature Modules

### 1. Keyword Research (`/keywords`)
- Pinterest autocomplete suggestions & seed query expansion
- Search intent classification (Inspirational, Commercial, DIY/How-To, Gift Intent)
- Keyword clustering into aesthetics, techniques, and occasions
- Competition estimates & opportunity scores (0-100)
- Saved keyword lists with 1-click bulk CSV export

### 2. Competitor Spy (`/competitor-spy`)
- Public Pinterest creator profile inspection (followers, monthly viewers)
- Public boards & top pin metadata view (hashtags, destination domains)
- Content Gap Detection: highlights high-traffic competitor topics missing from your Fyloo boards

### 3. Pin Analytics (`/analytics`)
- High-level engagement metrics: Total Impressions, Saves (Repins), Outbound Shop Clicks, Average CTR%
- Board-by-board performance matrix
- Top Performing Pins leaderboard ranked by save rate & CTR
- Weekly posting velocity recommendations

### 4. Trend Radar (`/trends`)
- Pinterest Trends & breakout topics (+95% to +220% surge rate)
- Seasonal Planning Calendar (Q1 Spring, Q2 Weddings/Mother's Day, Q3 Autumn Cozy, Q4 Holiday Gifting)
- 45-60 day advance planning guidance tailored for artisan and craft shops

### 5. AI Pin Creator (`/ai-creator`)
- Template-based smart generation engine (produces 3 catchy titles, 2 descriptions with hashtags, and image alt text)
- Content Brief generation (target audience persona, visual mood, suggested board)
- Original Pin Graphic Designer with 4 styled 2:3 aspect ratio templates (Artisan Parchment, Terracotta, Botanical Sage, Gift Edition)
- 1-click transfer into Pin Composer

### 6. AI SEO & Rich Pin Auditor (`/seo-auditor`)
- URL inspection for shop & product pages
- Metadata verification (`<title>`, `<meta name="description">`)
- Open Graph & Pinterest Rich Pins readiness (`og:image`, `og:title`, `og:description`)
- Focus keyword relevance & density check
- Broken links verification and prioritized optimization checklist

### 7. Content Planner (`/planner`)
- Full monthly interactive calendar view of scheduled pins
- Duplicate-Pin Protection: scans queue and alerts if identical destination links or titles appear within 7 days
- Bulk CSV Import: parse spreadsheet files with columns `Title, Description, Board, ScheduledAt, Link` directly into Drafts or Queue

### 8. Publishing Automation (`/automation`)
- Authorized Pinterest OAuth connection diagnostics & token expiration tracking
- Live publishing queue status with failure rates
- Failed-Post Alert Center with clear error explanations and single-click "Retry Publishing Now" action
- Background cron verification (`/api/publish-due`)

### 9. Growth Dashboard (`/growth`)
- Traffic velocity & repin momentum metrics
- Attributed monthly shop visits simulator
- Target keyword rankings and position changes
- Content format performance breakdown (Making-of process vs product showcases vs flatlays)

### 10. AI Assistant (`/assistant`)
- Conversational maker concierge answering natural-language questions
- Live context aggregation: answers reference your actual boards, queued pins, tracked keywords, and drafts
- Pre-made quick prompts for schedule reviews, title ideas, and SEO tips

---

## Core Scheduler & Public Pages

- **Landing Homepage (`/`)**: Hero section, 6 feature cards, 3-step guide, pricing teaser, and craft footer.
- **Login (`/login`) & Signup (`/signup`)**: Supabase Auth email/password authentication. Protects all studio app pages.
- **Pricing Page (`/pricing`)**: Starter, Pro (Most Popular), and Business tiers with interactive monthly/yearly billing toggle.
- **Studio Dashboard (`/dashboard`)**: Metric cards, Pinterest status, quick actions, and upcoming pins.
- **Boards Manager (`/boards`)**: Visual board cards, direct pinning, and modal to inspect pins.
- **Composer (`/compose`)**: Full pin form with LIVE real-time visual pin preview, drafts, and queueing.
- **Queue & Calendar (`/queue`)**: Scheduled pins timeline grouped by day, status badges, and reschedule modal.
- **Bulk Scheduler (`/bulk`)**: Batch upload multiple images, apply shared templates, distribute across time slots, and queue all in one go.
- **Drafts Workshop (`/drafts`)**: Saved unfinished pins ready for later scheduling.
- **Published History (`/published`)**: Searchable archive of live pins with direct Pinterest links.
- **Posting Schedule Settings (`/settings/schedule`)**: Daily time slots (Morning, Afternoon, Night) automatically filled by bulk scheduling.

---

## Setup & Environment Variables

To run locally or configure on Vercel:

```env
# Pinterest API v5 (OAuth App)
PINTEREST_CLIENT_ID="your_pinterest_client_id"
PINTEREST_CLIENT_SECRET="your_pinterest_client_secret"
PINTEREST_REDIRECT_URI="https://your-domain.vercel.app/api/auth/callback"

# Optional: Durable Storage / Supabase Free Tier Postgres
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Alternative: Vercel KV / Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Optional: Background Cron Security
CRON_SECRET="your_cron_secret"
```

## Free Tier Notes

- When Supabase credentials are not yet configured in environment variables, the app seamlessly runs on its built-in cloud store layer. Connecting Supabase free tier in Vercel settings instantly activates remote Postgres storage and Supabase Auth.
- The `vercel.json` cron calls `/api/publish-due` once daily on the Vercel Hobby plan. External free cron services (e.g. cron-job.org) can call `/api/publish-due` hourly for tighter scheduling windows.
