# CV Optimizer Integration Guide

## What Was Created

I've added a **CV Optimizer** feature to your Job Research UI! This allows you to optimize your CV directly from the browser for any job.

## Files Created/Modified

### New Files:
1. **`job-research-ui/src/components/CVOptimizer.tsx`** - Modal component for CV optimization
2. **This guide**

### Modified Files:
1. **`job-research-ui/src/components/JobCard.tsx`** - Added "Optimize CV" button
2. **`job-research-ui/src/App.tsx`** - Needs manual updates (see below)

## Manual Steps Required

Since I can't directly edit App.tsx, please make these changes manually:

### 1. Add Import (Line ~9)
```typescript
import { CVOptimizer } from './components/CVOptimizer';
```

### 2. Add State (Line ~17, after other useState)
```typescript
const [selectedJobForCV, setSelectedJobForCV] = useState<Job | null>(null);
```

### 3. Update JobCard Props (Line ~243, in the map function)
```typescript
<JobCard
  key={job.id}
  job={job}
  onAnalyze={handleAnalyze}
  onApply={handleMarkApplied}
  onArchive={handleArchive}
  onOptimizeCV={setSelectedJobForCV}  // ← ADD THIS LINE
/>
```

### 4. Add Modal (Line ~268, before the final `</div>`)
```typescript
      </footer>

      {/* CV Optimizer Modal */}
      {selectedJobForCV && (
        <CVOptimizer
          job={selectedJobForCV}
          onClose={() => setSelectedJobForCV(null)}
        />
      )}
    </div>  {/* ← This is the closing div */}
  );
}
```

## How to Use

Once you've made the above changes:

1. **Restart the dev server** if needed
2. **Open the UI** at http://localhost:5173
3. **Find a job** you want to apply to
4. **Click "Optimize CV"** button on any job card
5. **Generate optimized versions**:
   - Click "Generate Optimized CVs"
   - Wait ~2 seconds for processing
   - Review 3 versions: Conservative, Optimized (recommended), Stretch
6. **Download**:
   - Click to download individual version
   - Or download all 3 at once

## Features

### Three CV Versions Generated:

**Conservative (75% match)**
- Minimal changes
- Emphasizes strongest alignments
- Safe for when you're already a strong candidate

**Optimized (85% match)** ⭐ Recommended
- Strategic reframing
- Enhanced keyword optimization
- Best balance of optimization vs. authenticity

**Stretch (90% match)**
- Maximum legitimate optimization
- Emphasizes transferable skills
- Includes interview prep notes

### Visual Features:

- **Alignment comparison**: Before/after progress bars
- **Key changes list**: See what was modified
- **Preview**: Quick look at CV content
- **Download options**: Individual or bulk download

## Current Implementation

Right now, the CV Optimizer uses **simulated data** for demonstration. To connect it to the real CV optimizer sub-agent, you'll need to:

### Option 1: Use Claude API Directly (Recommended)

Update the `handleOptimize` function in `CVOptimizer.tsx` to call Claude API:

```typescript
const handleOptimize = async () => {
  setIsOptimizing(true);

  // Read the CV optimizer prompt
  const cvOptimizerPrompt = await fetch('/claude-code-agents/cv-optimizer.md');
  const instructions = await cvOptimizerPrompt.text();

  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_API_KEY',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `${instructions}\n\nOptimize my CV for: ${job.title} at ${job.company}`
      }]
    })
  });

  const data = await response.json();
  // Parse and set versions from Claude's response
};
```

### Option 2: Add MCP Tool

Add a new tool to the HTTP server:

```typescript
// In job-research-mcp/src/http-server.ts
case 'optimize_cv':
  result = await optimizeCV(db, args.job_id, args.cv_path);
  break;
```

## Example Workflow

1. User searches: "Find new jobs at Anthropic"
2. Sees **Product Operations Manager, Launch Readiness**
3. Clicks **"Optimize CV"**
4. Modal opens showing the job details
5. Clicks **"Generate Optimized CVs"**
6. Reviews 3 versions with alignment scores
7. Downloads **Optimized version** (85% match)
8. Uses it to apply!

## Integration with Existing System

The CV Optimizer works alongside:
- ✅ **Job search** - Find roles first
- ✅ **Job analysis** - Analyze fit
- ✅ **CV optimization** - Tailor your CV (NEW!)
- ✅ **Application tracking** - Mark as applied
- ✅ **Command line** - Still works for deep analysis

## Next Steps

### Immediate:
1. Make the 4 manual edits to App.tsx (above)
2. Restart dev server
3. Test the CV optimizer

### Future Enhancements:
- Connect to real Claude API for live optimization
- Save optimized CVs to database
- Show optimization history
- Compare multiple job optimizations side-by-side
- Add cover letter generation

## Troubleshooting

**"Optimize CV button not showing"**
- Check that you added `onOptimizeCV={setSelectedJobForCV}` to JobCard

**"Modal doesn't appear"**
- Verify you added the CVOptimizer component before the closing `</div>`
- Check browser console for errors

**"TypeScript errors"**
- Make sure you added the import: `import { CVOptimizer } from './components/CVOptimizer';`
- Verify the state: `const [selectedJobForCV, setSelectedJobForCV] = useState<Job | null>(null);`

---

Enjoy your new CV optimization feature! 🎉
