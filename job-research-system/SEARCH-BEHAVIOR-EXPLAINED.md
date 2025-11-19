# Search Behavior Explained

## How Job Search Works

### Understanding "Find new jobs at [Company]"

When you type **"Find new jobs at Anthropic"** in the UI, here's what happens:

#### 1. **Scraping Phase** (New Job Discovery)
The system scrapes the company's career page looking for jobs that **aren't already in your database**:

```
Scraping Anthropic careers page...
Checking each job against database...
Found: 3 new jobs that weren't there before
```

#### 2. **Display Phase** (Show All Matching Jobs)
After scraping, the UI shows **ALL jobs** for that company (new + existing):

```
✓ Found 3 new jobs! Showing all 45 jobs.
```

### Why You See "No New Jobs Found"

After the **first search**, subsequent searches will show:

```
No new jobs found, but showing 45 existing jobs.
All jobs are already in your database.
```

This is **normal and expected** because:
- ✅ The jobs were already scraped in the first search
- ✅ Companies don't post new jobs every minute
- ✅ Your database preserves all found jobs
- ✅ You still see ALL existing jobs for that company

### Status Messages Explained

#### ✓ Success (Green)
```
✓ Found 3 new jobs! Showing all 45 jobs.
```
- **Meaning**: Discovered brand new job postings
- **Action**: New jobs added to your database
- **Display**: Showing all jobs including the new ones

#### ⚠ Info (Yellow)
```
No new jobs found, but showing 45 existing jobs.
All jobs are already in your database.
```
- **Meaning**: No new postings since last search
- **Action**: Nothing to add (database is up-to-date)
- **Display**: Showing all existing jobs for the company

#### ❌ Error (Red)
```
No jobs found at [Company]. Try searching for a different company.
```
- **Meaning**: Company not in our scrapers, or no jobs match criteria
- **Action**: Try a different company name
- **Display**: Empty results

## Supported Companies

The system currently scrapes jobs from:

### Greenhouse Companies:
- **Anthropic**
- Vercel
- And others configured in scrapers

### Lever Companies:
- Various companies using Lever ATS

### Adding More Companies

To search more companies, they need to be added to the scrapers:
- `job-research-mcp/src/scrapers/greenhouse.ts` - For Greenhouse-based career pages
- `job-research-mcp/src/scrapers/lever.ts` - For Lever-based career pages

## Search Commands & Examples

### Finding New Jobs

| Command | Behavior | Result |
|---------|----------|--------|
| `Find new jobs at Anthropic` | Scrape Anthropic + show all | New + existing Anthropic jobs |
| `Find new jobs` | Scrape all companies | New + all existing jobs |
| `Search jobs at Vercel` | Scrape Vercel + show all | New + existing Vercel jobs |

### Filtering Existing Jobs

| Command | Behavior | Result |
|---------|----------|--------|
| `Show me high-priority jobs` | No scraping | Only high-priority jobs |
| `What jobs need attention?` | No scraping | Jobs needing review |
| `Show applied` | No scraping | Jobs you've applied to |

### Other Commands

| Command | Behavior |
|---------|----------|
| Reload/Refresh | Show all jobs from database |
| Empty prompt + Submit | Show all jobs from database |

## When to Expect New Jobs

You'll find **new jobs** when:
- ✅ Searching for the first time
- ✅ Company posts new positions (typically weekly/monthly)
- ✅ Searching a company you haven't searched before
- ✅ Enough time has passed since last search (companies update careers pages)

You **won't** find new jobs when:
- ❌ Searching the same company multiple times in a row
- ❌ No new positions have been posted
- ❌ Company career page hasn't changed
- ❌ Jobs were already scraped earlier

## Database Behavior

### Job Lifecycle

```
1. Discovery: Job found on career page
   ↓
2. Storage: Added to SQLite database (status: "new")
   ↓
3. Analysis: You analyze the job (status: "reviewed")
   ↓
4. Application: You apply (status: "applied")
   ↓
5. Archive: Job filled or passed (status: "archived")
```

### Jobs Never Disappear

- All jobs stay in your database
- Even if removed from company career page
- Use **Archive** to hide jobs you don't want
- Use **Filters** to focus on specific statuses

## Best Practices

### First-Time Search
```
"Find new jobs at Anthropic"
→ Expect: New jobs found (scraping fresh data)
→ Action: Browse and analyze interesting roles
```

### Subsequent Searches
```
"Find new jobs at Anthropic"
→ Expect: "No new jobs found, showing 45 existing"
→ Action: Browse existing jobs, or search another company
```

### Regular Checks (Daily/Weekly)
```
"Find new jobs"  (searches all companies)
→ Expect: New jobs from any company that posted
→ Action: Review new postings, archive old ones
```

### Focused Search
```
1. "Find new jobs at Anthropic"
2. Filter by "New" status
3. Analyze high-match jobs
4. Archive irrelevant ones
5. Come back tomorrow/next week
```

## Troubleshooting

### "I searched but see no jobs"

**Check:**
1. Is the company spelled correctly?
2. Is the company in our scrapers? (Currently: Anthropic, Vercel, etc.)
3. Is the API server running? (port 3001)
4. Check browser console for errors

### "Same jobs keep showing"

**This is correct!** The database preserves all jobs. Use:
- **Filters** to see only "new" status jobs
- **Archive** button to hide jobs you've reviewed
- **Applied** status to track applications

### "I want to see ONLY new jobs"

1. After search, click **"New"** filter button
2. Or use the Archive feature to hide reviewed jobs
3. Or check the status message to see how many new ones were found

## Technical Details

### What "searchJobs" Actually Does

```javascript
1. Scrape company career page(s)
2. Check each job against database
3. Add ONLY jobs that don't exist yet
4. Return ONLY the newly added jobs
```

### What the UI Does

```javascript
1. Call searchJobs() → Get new jobs array
2. Call getJobs() → Get all jobs from database
3. Filter by company if specified
4. Show status message about new vs existing
5. Display ALL matching jobs (new + existing)
```

This design ensures you:
- ✓ Never lose track of jobs
- ✓ See new jobs immediately
- ✓ Can browse all jobs for a company
- ✓ Get clear feedback about what's new

---

**Summary**: "Find new jobs" searches for **new postings** but displays **all jobs** for transparency. This is the expected behavior! 🎯
