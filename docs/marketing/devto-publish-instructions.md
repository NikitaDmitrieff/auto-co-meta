# DEV.to Manual Publish Instructions

**Status:** Article ready. Awaiting manual publish or API key.
**Article file:** `docs/marketing/devto-article.md`
**Written:** Cycle 18 (2026-03-07)

---

## Option A: Publish via API (Autonomous — preferred)

Add API key to `.env`:

```
DEVTO_API_KEY=your_key_here
```

Get key from: https://dev.to/settings/extensions → "DEV Community API Keys" → Generate API Key

Then run next cycle — auto-co will publish automatically via:
```
POST https://dev.to/api/articles
```

---

## Option B: Manual Copy-Paste (5 minutes)

1. Go to https://dev.to/new
2. Click **"Edit"** tab (raw markdown mode)
3. Copy the full contents of `docs/marketing/devto-article.md`
4. Paste into the editor
5. Set the front matter at the top:

```yaml
---
title: I built an autonomous AI company that runs itself — 18 cycles of receipts
published: true
tags: ai, opensource, buildinpublic, javascript
---
```

6. Preview — verify the table and code blocks render correctly
7. Click **Publish**
8. Copy the article URL and add it to `memories/consensus.md` under Metrics

---

## Post-Publish Checklist

- [ ] Copy article URL
- [ ] Update consensus.md with URL and publish date
- [ ] Share URL in Twitter thread (tweet 10 or 11)
- [ ] Post on Indie Hackers: https://www.indiehackers.com/post
- [ ] Submit to Hacker News Show HN (Tuesday-Thursday morning EST is optimal)
- [ ] Add DEV.to link to GitHub README

---

## Hacker News Show HN Template

**Title:** Show HN: I built an autonomous AI company that runs itself (18 cycles of receipts)

**Text:**
```
auto-co is an autonomous AI company OS — 14 AI agents (CEO/CTO/CFO etc.)
running in a bash loop, making decisions, shipping code, and deploying to
production without human involvement.

The core mechanic: a consensus.md relay baton that travels cycle to cycle.
No database, no vector store — just a markdown file in Claude's context window.

In 18 cycles (~3 weeks): built the framework, landing page, demo dashboard,
and this post. Total cost: $26.30. Revenue: $0 (first post ever).

Live demo: https://auto-co-landing-production.up.railway.app/demo
GitHub (MIT): https://github.com/NikitaDmitrieff/auto-co-meta
```

**Best time to post:** Tuesday-Thursday, 8-10am EST

---

## Indie Hackers Post Template

**Title:** I let 14 AI agents run my side project for 3 weeks — here's what they built

**Body:** Link to DEV.to article + brief personal note about what surprised you most.
