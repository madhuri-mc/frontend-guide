# Frontend Guide — Project Brief

Paste this entire document at the start of a new conversation to resume with full context.

## What this project is
A personal frontend development blog/guide, built to:
1. Serve as an interview-prep/portfolio asset for a job switch (career growth is the primary goal, not income)
2. Genuinely deepen the author's own technical understanding through writing
3. Secondary/exploratory: build an audience, possibly convert to Shorts/Reels content later

Explicitly NOT optimized for short-term monetization — traffic/income expectations are modest and long-term.

## Tech stack
- **Framework**: Astro (v6+), using Content Collections with a `glob` loader (not the older `type: 'content'` auto-detection)
- **Hosting**: Vercel, Hobby (free) plan, auto-deploys on push to `main`
- **Domain**: currently a Vercel subdomain (`.vercel.app`) — `frontendguide.dev` confirmed available for future purchase (~$12-15/yr via Porkbun) once traffic justifies it
- **Repo**: public GitHub repo, connected to Vercel for auto-deploy
- **Analytics**: `@vercel/analytics` installed and integrated in `Layout.astro`

## File structure
```
src/
  content.config.ts          # schema for articles collection
  content/articles/*.md      # all article files live here
  layouts/Layout.astro       # shared header/sidebar/footer, site-wide styles
  components/RelatedReading.astro  # renders related article links on article pages
  pages/
    index.astro               # home page, card grid of all articles
    about.astro
    articles/[slug].astro     # individual article template
    categories/[category].astro  # per-category listing page
  utils/readTime.ts           # word-count-based read time calculator
public/
  favicon.svg                 # "FG" monogram, indigo (#4f46e5) background
```

## Content schema (content.config.ts)
```ts
schema: z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(['React', 'CSS', 'JavaScript', 'Career', 'Performance', 'Accessibility']),
  tags: z.array(z.string()),
  coreTakeaway: z.string(),       // one-sentence hook, doubles as future Shorts script line
  publishDate: z.date(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  relatedArticles: z.array(z.string()).optional(),  // slugs of related articles
})
```

## Article writing template (established structure — follow for every new article)
```md
## What [concept] actually is
[2-3 sentences, plain language, no code — ground the reader before anything technical]

## When developers actually run into this
[Real scenario — "you'll hit this when doing X" — answers "why should I care" before the code]

## The problem
[Concrete broken code example + 1-2 sentence explanation of what's wrong]

## The fix
[Concrete corrected code example + 1-2 sentence explanation]

## Why this happens (the deeper reason)
[Deeper "under the hood" explanation — builds real understanding, not just a memorized fix]
```
Additional sections (e.g. "More scenarios, quickly", "When you actually need this") are added when a topic benefits from extra practical decision-guidance beyond the core template.

## Brand/design
- Primary color: indigo `#4f46e5`
- Category badge colors: React (indigo), CSS (pink `#db2777`), JavaScript (yellow `#ca8a04`), Career (green `#16a34a`), Performance (orange `#ea580c`), Accessibility (purple `#7c3aed`)
- Card-based layout on home/category pages, compact/truncated on mobile (2-line description clamp)
- Favicon: "FG" white text on indigo rounded-square

## Content strategy
- **Angle**: cover topics/gotchas that are genuinely underexplained elsewhere — not generic "what is X" tutorials, but "why does X actually work this way" / specific confusing edge cases
- **Cadence goal**: 2-3 articles/week, ~25-35 articles over first 3 months
- **Category balance**: React series is currently the deepest (6+ interlinked articles); CSS/JS/Career/Performance/Accessibility each still need more content to avoid the site feeling React-only

## Current article inventory (React series, in reading-progression order)
1. Why Does useEffect Exist? *(Intermediate)*
2. React Lifecycle, Explained *(Beginner)*
3. The Complete React Render Cycle: Trigger, Render, Commit, and Paint *(Advanced)*
4. Why You Can't Call a Hook Inside a Condition *(Advanced)*
5. Why React State Can Feel Stale *(Intermediate)*
6. useMemo and useCallback Don't Make Your Code Faster By Default *(Advanced)*

Plus one article each in CSS, JavaScript, Career, Performance, Accessibility (written early on, simpler structure, not yet updated to the full template — worth revisiting).

## Queued topic backlog (not yet written)
**Hooks**: useRef (mutable box, doesn't trigger re-renders), useContext re-render behavior, useState vs useReducer
**JavaScript**: `[] == false` type coercion, `NaN !== NaN`, hoisting/TDZ nuance, mutating arrays inside `.map()`, `Promise.all` vs `allSettled`
**Career**: resume vs portfolio distinction (already written), more interview-prep angles TBD

## Distribution/marketing plan (ongoing, per-article checklist)
1. Crosspost to dev.to with canonical URL pointing back to the site
2. Share in relevant subreddit when genuinely fitting (r/reactjs, r/webdev) — not every article, no spam
3. One tweet/X post with the core insight
4. Share in Reactiflux (React Discord) when relevant
Longer-term: Google Search Console + sitemap submitted, Hacker News for strongest pieces, Stack Overflow answers linking back when genuinely relevant, email list signup (not yet set up).

## Key decisions made (don't re-litigate unless something changed)
- AI-assisted writing workflow is fine: brainstorm/draft with AI, but always verify technical accuracy and ensure genuine understanding before publishing
- Domain: staying on free Vercel subdomain for now; revisit `frontendguide.dev` purchase once there's real traffic/sharing happening
- Comments: intentionally skipped for now (Giscus is the pick if/when added later)
- No monetization features built yet (by design) — revisit after 3-6 months of consistent output
- Job search: separate, higher-priority track for salary/career growth; this site is secondary/supportive, not a replacement

## Open items / not yet done
- [ ] Google Search Console verification (meta tag method chosen) — confirm completed
- [ ] `@astrojs/sitemap` integration — confirm installed and submitted
- [ ] Email signup — not yet added
- [ ] Older 5 articles (CSS/JS/Career/Performance/Accessibility) not yet updated to match the newer, deeper template structure