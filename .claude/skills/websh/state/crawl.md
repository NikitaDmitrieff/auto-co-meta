---
role: crawl-management
summary: |
  Eager link crawling for websh. After fetching a page, automatically prefetch
  linked pages 1-2 layers deep in background. Makes navigation feel instant.
see-also:
  - cache.md: Cache structure
  - ../shell.md: Shell semantics
  - ../commands.md: Command reference
---

# websh Eager Crawl

When you `cd` to a URL, websh can automatically prefetch linked pages in the background. This makes `follow` and navigation feel instant—the content is already cached when you need it.

---

## How It Works

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   cd https://news.ycombinator.com                         │
│         │                                                  │
│         ▼                                                  │
│   ┌───────────────┐                                       │
│   │ Fetch + Extract│  ← Background haiku (existing)       │
│   │ the main page  │                                      │
│   └───────┬───────┘                                       │
│           │ After Pass 1 (links identified)               │
│           ▼                                                │
│   ┌───────────────┐                                       │
│   │ Spawn Eager   │  ← New background haiku               │
│   │ Crawl Agent   │                                       │
│   └───────┬───────┘                                       │
│           │                                                │
│           ▼                                                │
│   For each link (prioritized, rate-limited):             │
│   ┌───────────────┐                                       │
│   │ Fetch + Extract│  ← Parallel background tasks          │
│   │ linked page    │                                       │
│   └───────┬───────┘                                       │
│           │ If depth < max_depth                          │
│           ▼                                                │
│   Queue its links for next layer...                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

The user gets their prompt back immediately. All crawling happens async.

---

## Crawl Settings

Stored in `.websh/session.md` under Environment:

```markdown
## Environment

EAGER_CRAWL: true
CRAWL_DEPTH: 2
CRAWL_SAME_DOMAIN: true
CRAWL_MAX_PER_PAGE: 20
CRAWL_MAX_CONCURRENT: 5
CRAWL_DELAY_MS: 200
```

### Setting Descriptions

| Variable | Default | Description |
|----------|---------|-------------|
| `EAGER_CRAWL` | `true` | Enable/disable eager crawling |
| `CRAWL_DEPTH` | `2` | How many layers deep to prefetch |
| `CRAWL_SAME_DOMAIN` | `true` | Only crawl same-domain links |
| `CRAWL_MAX_PER_PAGE` | `20` | Max links to prefetch per page |
| `CRAWL_MAX_CONCURRENT` | `5` | Max simultaneous fetches |
| `CRAWL_DELAY_MS` | `200` | Delay between requests (rate limit) |

### Changing Settings

```
export EAGER_CRAWL=false           # disable eager crawl
export CRAWL_DEPTH=3               # go 3 layers deep
export CRAWL_SAME_DOMAIN=false     # include external links
prefetch off                       # shortcut to disable
prefetch on --depth 3              # enable with depth 3
```

---

## Crawl Queue

Track in `.websh/crawl-queue.md`:

```markdown
# websh crawl queue

## Active Crawl

origin: https://news.ycombinator.com
started: 2026-01-24T10:30:00Z
depth: 2
same_domain: true

## In Progress

| Slug | URL | Depth | Status |
|------|-----|-------|--------|
| news-ycombinator-com-item-id-41234567 | https://news.ycombinator.com/item?id=41234567 | 1 | extracting |
| news-ycombinator-com-item-id-41234568 | https://news.ycombinator.com/item?id=41234568 | 1 | fetching |

## Queued

| URL | Depth | Priority |
|-----|-------|----------|
| https://news.ycombinator.com/item?id=41234569 | 1 | 2 |
| https://news.ycombinator.com/item?id=41234570 | 1 | 3 |
...

## Completed

| Slug | URL | Depth | Links Found |
|------|-----|-------|-------------|
| news-ycombinator-com | https://news.ycombinator.com | 0 | 30 |

## Skipped

| URL | Reason |
|-----|--------|
| https://external.com/article | external (same_domain=true) |
| https://news.ycombinator.com/login | already cached |
```

---

## Priority Algorithm

Links are prioritized for crawling:

1. **Position on page** — Links appearing earlier get higher priority
2. **Same domain** — Internal links before external
3. **Content signals** — Links in main content > nav/footer
4. **Avoid duplicates** — Skip already-cached URLs
5. **Skip non-content** — Ignore login, logout, settings, etc.

### Link Scoring

```python
def score_link(link, index, is_same_domain, in_main_content):
    score = 1000 - index  # Position: earlier = higher

    if is_same_domain:
        score += 500

    if in_main_content:
        score += 300

    # Penalize common non-content patterns
    skip_patterns = ['login', 'logout', 'signup', 'settings', 'account', '#']
    if any(p in link.href.lower() for p in skip_patterns):
        score -= 1000

    return score
```

---

## The Crawl Agent Prompt

After initial page extraction completes Pass 1, spawn this agent:

````markdown
# websh Eager Crawl Agent

You are prefetching linked pages for websh to make navigation instant.

## Origin Page

URL: {url}
Slug: {slug}
Parsed file: {parsed_path}

## Settings

depth: {depth}
same_domain: {same_domain}
max_per_page: {max_per_page}
max_concurrent: {max_concurrent}

## Task

1. Read the parsed markdown file to get the link list
2. Filter and prioritize links:
   - Skip already-cached URLs (check .websh/cache/index.md)
   - Skip external if same_domain=true
   - Skip login/logout/settings/account URLs
   - Take top {max_per_page} by priority (earlier position = higher)
3. For each link, spawn a fetch+extract task (like cd does)
4. Track progress in .websh/crawl-queue.md
5. If depth > 1, queue discovered links for next layer

## Rate Limiting

- Max {max_concurrent} concurrent fetches
- {delay_ms}ms delay between spawning new tasks
- Be respectful of the origin server

## Spawn Pattern

For each URL to prefetch:

```python
Task(
    description=f"websh: prefetch {slug}",
    prompt=FETCH_AND_EXTRACT_PROMPT,  # Same as cd uses
    subagent_type="general-purpose",
    model="haiku",
    run_in_background=True
)
```

## Completion

When all links at all depths are processed:
1. Update crawl-queue.md with final stats
2. Log completion: "Prefetch complete: {n} pages cached from {origin}"

## Graceful Handling

- If a fetch fails, log and continue with others
- If rate limited, back off and retry
- Never block on slow sites—move to next link
- User can cancel with `kill %crawl` or `prefetch stop`
````

---

## Depth-2 Crawling

When depth > 1, the crawl continues recursively:

```
Layer 0: cd https://news.ycombinator.com
         → extracts 30 links

Layer 1: prefetch top 20 links
         → each page extracts ~10-30 more links

Layer 2: prefetch top 20 links from each Layer 1 page
         → but skip duplicates across all layers
```

### Deduplication

The crawl queue tracks all URLs seen:

```markdown
## Seen URLs

(URLs already cached, in progress, or queued—don't crawl again)

- https://news.ycombinator.com
- https://news.ycombinator.com/item?id=41234567
- https://news.ycombinator.com/item?id=41234568
...
```

This prevents re-crawling the same URL at different depths.

---

## Commands

| Command | Description |
|---------|-------------|
| `prefetch` | Show current crawl status |
| `prefetch on` | Enable eager crawl |
| `prefetch off` | Disable eager crawl |
| `prefetch <url>` | Manually prefetch a specific URL |
| `prefetch --depth N` | Set crawl depth |
| `prefetch --stop` | Stop current crawl |
| `crawl <url>` | Explicit full crawl of URL |
| `crawl --depth N` | Set depth for explicit crawl |
| `queue` | Show crawl queue |

### prefetch status output

```
Eager crawl: enabled
Depth: 2, Same domain: yes, Max per page: 20

Current crawl:
  Origin: https://news.ycombinator.com
  Progress: Layer 1 - 15/20 complete
  Queued: 42 URLs for Layer 2

Recent:
  [✓] news-ycombinator-com-item-id-41234567 (12 links)
  [✓] news-ycombinator-com-item-id-41234568 (8 links)
  [→] news-ycombinator-com-item-id-41234569 (fetching...)
```

---

## Integration with cd

The `cd` command triggers eager crawl after extraction begins:

```python
def cd(url):
    # ... existing cd logic (fetch + extract) ...

    # After spawning extract task, also spawn crawl if enabled
    if env.EAGER_CRAWL:
        # Wait briefly for Pass 1 to complete, then crawl
        Task(
            description=f"websh: eager crawl {slug}",
            prompt=EAGER_CRAWL_PROMPT.format(
                url=full_url,
                slug=slug,
                parsed_path=f".websh/cache/{slug}.parsed.md",
                depth=env.CRAWL_DEPTH,
                same_domain=env.CRAWL_SAME_DOMAIN,
                max_per_page=env.CRAWL_MAX_PER_PAGE,
                max_concurrent=env.CRAWL_MAX_CONCURRENT,
                delay_ms=env.CRAWL_DELAY_MS,
            ),
            subagent_type="general-purpose",
            model="haiku",
            run_in_background=True
        )
```

The crawl agent waits for links to be available, then starts prefetching.

---

## Performance Considerations

### Why Eager Crawl?

| Without eager crawl | With eager crawl |
|---------------------|------------------|
| `follow 3` → wait for fetch | `follow 3` → instant (cached) |
| `back` → might need refetch | `back` → instant (cached) |
| Exploring feels slow | Exploring feels instant |

### Cost/Benefit

| Pros | Cons |
|------|------|
| Navigation feels instant | Uses more bandwidth |
| Content ready when needed | More disk space for cache |
| Natural browsing flow | May fetch pages never visited |
| Works offline for cached pages | Background CPU usage |

### When to Disable

```
prefetch off
```

Disable eager crawl when:
- On metered connection
- Crawling large/slow sites
- Disk space constrained
- Only visiting one page

---

## Example Session

```
~> cd https://news.ycombinator.com

news.ycombinator.com> (fetching...)

news.ycombinator.com> prefetch
Eager crawl: enabled
Current crawl:
  Origin: https://news.ycombinator.com
  Progress: Waiting for extraction...

news.ycombinator.com> ls | head 5
[0] Show HN: I built a tool for...
[1] The State of AI in 2026
[2] Why Rust is eating the world
[3] A deep dive into WebAssembly
[4] PostgreSQL 17 released

news.ycombinator.com> prefetch
Current crawl:
  Origin: https://news.ycombinator.com
  Progress: Layer 1 - 8/20 complete
  [✓] .../item?id=41234567
  [✓] .../item?id=41234568
  [→] .../item?id=41234569 (fetching...)
  ...

news.ycombinator.com> follow 1

news.ycombinator.com/item> (cached)    # Instant! Already prefetched.

news.ycombinator.com/item> cat .title
The State of AI in 2026

news.ycombinator.com/item> back

news.ycombinator.com> (cached)         # Also instant
```

---

## robots.txt Respect

Before crawling, check robots.txt:

```python
def should_crawl(url, domain):
    robots = get_robots(domain)  # cached
    return robots.can_fetch("websh/1.0", url)
```

If disallowed, skip the URL and log:

```markdown
## Skipped

| URL | Reason |
|-----|--------|
| https://example.com/private | disallowed by robots.txt |
```

---

## Cancellation

User can stop crawl at any time:

```
prefetch stop
# or
kill %crawl
```

This cancels pending fetches but keeps already-cached content.
