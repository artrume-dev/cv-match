# CV Fabrication Prevention System

## Overview

This document describes the multi-layered defense system implemented to prevent the AI CV optimizer from fabricating false information in optimized CVs. The system was created in response to a critical issue where the optimizer was inventing experience (e.g., adding "recruiter" experience to a designer's CV).

**Date Implemented:** 2025-11-22
**Status:** ✅ Active
**Priority:** P0 - Critical

---

## The Problem

### What Was Happening

The CV optimizer was fabricating content that violated truthfulness principles:

**Example violation:**
- **Base CV:** "Senior Product Designer | Design Systems Engineer"
- **Fabricated CV:** "Global Recruiter | Sales & AI Integration Specialist"
- **False claims added:**
  - "Built High-Performing Sales Teams"
  - "Filled over 50 high-level sales positions"
  - "40% reduction in time-to-hire"
  - "Global Sales Talent Acquisition" project

### Root Causes Identified

1. **Weak AI prompt** - Truthfulness rules buried at end, not explicit enough
2. **No validation layer** - Fabricated content accepted blindly
3. **Poor job matching** - Unrelated jobs scored 61-75% match instead of <30%
4. **Missing domain mismatch detection** - Designer → Recruiter got no penalty

---

## The Solution: 4-Layer Defense System

The system uses a defense-in-depth approach where multiple layers protect against fabrication. Even if one layer fails, others catch the issue.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Layer 4: UI Safety Warning (CVOptimizer.tsx)           │
│ Shows critical warning for jobs <50% alignment          │
│ Requires user confirmation to proceed                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Strengthened AI Prompt (ai.ts)                │
│ Explicit truthfulness rules at top of prompt            │
│ "NEVER change professional domain" + examples           │
└─────────────────────────────────────────────────────────┘
                          ↓
              AI generates 3 CV versions
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Validation Layer (ai.ts)                      │
│ Scans for domain switches, fabricated metrics           │
│ Rejects optimization if fabrication detected            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Improved Job Matching (analyze.ts)            │
│ Domain mismatch detection for recruiting/sales          │
│ Lower scores for fundamentally different roles          │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: Strengthened AI Prompt

**File:** `job-research-system/job-research-ui/src/services/ai.ts`
**Lines:** 97-217

### Changes Made

Moved truthfulness rules to the **top of the prompt** with high visibility and explicit examples.

### Key Rules Added

```markdown
## ⚠️ CRITICAL: TRUTHFULNESS RULES (NON-NEGOTIABLE) ⚠️

These rules override ALL other instructions. Violating these will result in immediate rejection:

1. **NEVER change the candidate's professional domain or job title type**
   - If CV says "Product Designer", optimized CV MUST remain "Product Designer" or similar design role
   - NEVER transform into "Recruiter", "Sales", "Engineer", "Manager" etc. if not in original CV
   - Example violations: Designer → Recruiter, Designer → Sales, Designer → Software Engineer

2. **NEVER invent experience, projects, or achievements**
   - Every bullet point must trace directly back to something in the base CV
   - Do NOT fabricate new projects, roles, or responsibilities
   - Example violations: Adding "recruitment experience", "sales pipeline management", "hired 50 people"

3. **NEVER fabricate metrics or statistics**
   - Do NOT add numbers that aren't in the base CV
   - Example violations: "40% reduction in time-to-hire", "filled 50 positions", "$2M in revenue"

4. **NEVER claim skills, tools, or domains not mentioned in base CV**
   - If base CV doesn't mention recruiting → DO NOT add recruiting experience
   - If base CV doesn't mention sales → DO NOT add sales experience
   - If base CV doesn't mention a specific tool → DO NOT add proficiency in it

5. **If job requires fundamentally different experience than CV has:**
   - DO NOT fabricate experience to match the job
   - Instead: Clearly note the gap in the "gaps" section
   - Keep CV factually accurate - integrity matters more than appearing to fit
```

### Allowed Optimizations

```markdown
## ✅ ALLOWED Optimizations:

- Reorder existing content to emphasize relevance
- Reframe existing experience with different emphasis (but same domain)
- Add context to make existing skills clearer
- Highlight transferable skills from existing work
- Adjust professional summary to emphasize relevant aspects of existing experience
```

---

## Layer 2: Validation Layer

**File:** `job-research-system/job-research-ui/src/services/ai.ts`
**Lines:** 273-382
**Method:** `validateCVOptimization(baseCV, result)`

### What It Does

Post-processes AI output to detect fabricated content before accepting it.

### Detection Mechanisms

#### 1. Domain-Switching Detection

Checks if optimized CV adds 2+ domain-specific keywords that weren't in the base CV.

**Monitored domains:**
- **Recruiting:** recruiter, recruiting, talent acquisition, sourcing candidates, hiring manager, ats system, candidate pipeline, headhunter, etc. (20 keywords)
- **Sales:** sales, account executive, business development, quota, sales pipeline, crm, revenue target, lead generation, closing deals, etc. (24 keywords)
- **Engineering:** software engineer, backend engineer, frontend engineer, programming, coding algorithms, etc. (7 keywords)

**Logic:**
```typescript
// Count domain keywords in base vs optimized
const baseCount = keywords.filter(kw => baseLower.includes(kw)).length;
const optimizedCount = keywords.filter(kw => optimizedLower.includes(kw)).length;

// If optimized adds 2+ domain keywords that weren't in base, flag it
if (optimizedCount >= 2 && baseCount === 0) {
  warnings.push(`⚠️ FABRICATION DETECTED in ${version.type} version:
    Added ${domain} experience not in base CV (found ${optimizedCount} ${domain}-related terms)`);
}
```

#### 2. Fabricated Metrics Detection

Scans for specific metrics patterns that appear in optimized but not in base CV.

**Patterns detected:**
- `(\d+)%\s*(reduction|increase|improvement|growth)` - e.g., "40% reduction"
- `(hired|recruited|filled)\s+(\d+)\s+(positions|roles|candidates)` - e.g., "hired 50 people"
- `(\$|€|£)\s*(\d+[kmb]?)\s*(revenue|sales|pipeline)` - e.g., "$2M revenue"

#### 3. Role Title Domain Switch

Compares job titles between base and optimized CV to detect domain changes.

**Detected switches:**
- Designer → Recruiter/Sales/Engineer
- Engineer → Recruiter/Sales/Designer
- Developer → Recruiter/Sales/Designer

### Error Handling

If any violations are detected, the system throws a detailed error:

```
🚫 CV OPTIMIZATION REJECTED - FABRICATION DETECTED

The AI attempted to fabricate content that violates truthfulness rules:

⚠️ FABRICATION DETECTED in optimized version: Added recruiting experience not in base CV (found 8 recruiting-related terms)
⚠️ FABRICATED METRIC in stretch version: "filled 50 positions" - not found in base CV
⚠️ DOMAIN SWITCH DETECTED in optimized version: Changed from "designer" to "recruiter" role

❌ This optimization has been blocked to protect your professional integrity.
💡 Recommendation: This job may require fundamentally different experience.
   Consider applying to jobs that better match your actual background.
```

**User sees:** Clear explanation of what was fabricated and why it was rejected.

---

## Layer 3: Improved Job Matching

**File:** `job-research-system/job-research-mcp/src/tools/analyze.ts`
**Lines:** 164-195 (domain definitions), 512-524 (thresholds)

### Domain Mismatch Detection

Added recruiting and sales to the domain mismatch detection system.

#### Recruiting Domain

```typescript
recruiting: {
  keywords: [
    'recruiter', 'recruiting', 'recruitment', 'talent acquisition', 'technical recruiter',
    'full-cycle recruiting', 'sourcing candidates', 'hiring manager', 'candidate pipeline',
    'recruitment strategy', 'headhunter', 'talent sourcing', 'interview coordination',
    'offer negotiation', 'recruiting experience', 'ats system', 'talent partner',
    'recruiting operations', 'hire talent', 'build teams', 'recruiting background'
  ],
  cvKeywords: [
    'recruiter', 'recruiting', 'recruitment', 'talent acquisition', 'hired',
    'sourced candidates', 'talent partner', 'hr', 'human resources', 'headhunter',
    'recruiting experience', 'recruiting background', 'recruiting operations'
  ],
  domainName: 'recruiting/talent acquisition experience',
  requiredCount: 2
}
```

#### Sales Domain

```typescript
sales: {
  keywords: [
    'sales', 'account executive', 'business development', 'quota', 'sales quota',
    'sales pipeline', 'crm', 'salesforce', 'territory', 'revenue target',
    'account management', 'lead generation', 'closing deals', 'sales target',
    'sales experience', 'sales background', 'sold', 'deal closing', 'sales cycle',
    'outbound sales', 'inbound sales', 'sales strategy', 'sales operations'
  ],
  cvKeywords: [
    'sales', 'sold', 'account executive', 'quota', 'revenue', 'sales pipeline',
    'crm', 'business development', 'sales experience', 'sales background',
    'account management', 'closing deals', 'sales operations'
  ],
  domainName: 'sales experience',
  requiredCount: 2
}
```

### Updated Alignment Thresholds

Clearer thresholds with stronger warnings for low-match jobs:

| Score Range | Recommendation | Message |
|-------------|----------------|---------|
| **70-100%** | `high` | "Strong alignment (X%). Your experience closely matches requirements. This is a good fit!" |
| **50-69%** | `medium` | "Moderate alignment (X%) with some gaps. Consider emphasizing transferable skills in your application." |
| **30-49%** | `low` | "Limited alignment (X%). Significant gaps in key requirements. Application not recommended - focus on jobs with better match." |
| **0-29%** | `low` | "Very low alignment (X%). Fundamental domain mismatch detected. DO NOT APPLY - this role requires experience you don't have. Optimizing CV for this role may lead to fabricated content." |

**Impact:**
- Jobs requiring recruiter experience for designers will now score <30% instead of 61-75%
- System explicitly warns against applying to fundamentally mismatched jobs
- Mentions fabrication risk in the reasoning text

---

## Layer 4: UI Safety Warning

**File:** `job-research-system/job-research-ui/src/components/CVOptimizer.tsx`
**Lines:** 81-101

### Pre-Optimization Check

Added safety check at the beginning of `handleOptimize()` function.

### Warning Logic

```typescript
const alignmentScore = job.alignment_score ?? 0;

if (alignmentScore < 50) {
  const warningMessage = alignmentScore < 30
    ? `⚠️ CRITICAL WARNING: This job has a very low match score (${alignmentScore}%).\n\n` +
      `This indicates a fundamental domain mismatch between your experience and the job requirements. ` +
      `Optimizing your CV for this role is likely to result in fabricated content, which will be automatically rejected.\n\n` +
      `❌ We strongly recommend NOT applying to this job.\n` +
      `✅ Instead, focus on jobs with 50%+ alignment that match your actual background.\n\n` +
      `Do you still want to proceed?`
    : `⚠️ WARNING: This job has a low match score (${alignmentScore}%).\n\n` +
      `This job has significant gaps from your actual experience. The CV optimizer may struggle to create a ` +
      `truthful optimized version without fabricating content.\n\n` +
      `Consider focusing on jobs with better alignment (50%+).\n\n` +
      `Do you want to proceed anyway?`;

  const proceed = window.confirm(warningMessage);
  if (!proceed) {
    return; // User cancels optimization
  }
}
```

### Warning Levels

#### Critical Warning (<30% alignment)

```
⚠️ CRITICAL WARNING: This job has a very low match score (25%).

This indicates a fundamental domain mismatch between your experience
and the job requirements. Optimizing your CV for this role is likely
to result in fabricated content, which will be automatically rejected.

❌ We strongly recommend NOT applying to this job.
✅ Instead, focus on jobs with 50%+ alignment that match your actual background.

Do you still want to proceed?
```

#### Standard Warning (30-49% alignment)

```
⚠️ WARNING: This job has a low match score (45%).

This job has significant gaps from your actual experience. The CV
optimizer may struggle to create a truthful optimized version without
fabricating content.

Consider focusing on jobs with better alignment (50%+).

Do you want to proceed anyway?
```

**User action required:** Must click "OK" to proceed or "Cancel" to abort.

---

## How The System Works End-to-End

### Scenario: Designer CV + Recruiter Job

#### Old Behavior (Broken) ❌

1. Job scored 61-75% alignment
2. User clicks "Optimize CV"
3. AI fabricated recruiter experience (violated truthfulness)
4. Output accepted blindly
5. User downloads fake CV with fabricated content
6. **Risk:** Professional integrity damaged if submitted

#### New Behavior (Protected) ✅

1. **Job Analysis (Layer 3)**
   - System detects 2+ recruiting keywords in job
   - Checks CV for recruiting experience → not found
   - Scores job <30% alignment
   - Reasoning: "Very low alignment. Fundamental domain mismatch detected. DO NOT APPLY"

2. **UI Warning (Layer 4)**
   - User clicks "Optimize for [Company]"
   - System checks alignment score → 25%
   - Shows CRITICAL WARNING dialog
   - "This indicates a fundamental domain mismatch... likely to result in fabricated content"
   - User must confirm to proceed (or cancel)

3. **AI Prompt (Layer 1)**
   - If user proceeds, AI receives strengthened prompt
   - Truthfulness rules at the top
   - "NEVER change professional domain" explicitly stated
   - Examples of violations provided
   - AI is instructed to note gaps honestly instead of fabricating

4. **Validation (Layer 2)**
   - AI returns 3 CV versions
   - System runs `validateCVOptimization()`
   - Scans for recruiting keywords → if 2+ added, flags violation
   - Scans for fabricated metrics → if found, flags violation
   - Scans for role title change → if domain switch detected, flags violation
   - **If violations found:** Throws error, rejects optimization completely
   - **If no violations:** Passes through to user

5. **Outcome:**
   - **Best case:** AI respects rules, produces honest CV with many gaps noted in "gaps" section
   - **Worst case:** AI attempts fabrication → caught by validation → rejected with detailed error
   - **User protection:** Cannot accidentally create fabricated CV

---

## Testing & Verification

### Test Cases

#### Test 1: Very Low Match Job (<30%)

**Setup:**
- CV: Product Designer background
- Job: Recruiter, Sales (EMEA) at Anthropic

**Expected behavior:**
1. Job analysis scores it <30%
2. Job card shows "Low" recommendation with red badge
3. Reasoning states "DO NOT APPLY - Fundamental domain mismatch"
4. Clicking "Optimize" shows CRITICAL WARNING dialog
5. If user proceeds anyway:
   - Either AI respects rules and notes many gaps
   - OR validation catches fabrication and rejects with error

**Verification:**
```bash
# Check job alignment score
curl http://localhost:3001/api/jobs | jq '.jobs[] | select(.company == "Anthropic" and .title | contains("Recruiter"))'

# Should show alignment_score < 30
```

#### Test 2: Low Match Job (30-49%)

**Setup:**
- CV: Product Designer background
- Job: Product Manager at tech company (some overlap but different role)

**Expected behavior:**
1. Job analysis scores it 30-49%
2. Job card shows "Low" recommendation
3. Reasoning states "Application not recommended - focus on jobs with better match"
4. Clicking "Optimize" shows standard WARNING dialog
5. Optimization proceeds if user confirms

#### Test 3: Good Match Job (50-69%)

**Setup:**
- CV: Product Designer with design systems experience
- Job: Design Systems Engineer at Anthropic

**Expected behavior:**
1. Job analysis scores it 50-69%
2. Job card shows "Medium" recommendation
3. No warning dialog
4. Optimization proceeds normally
5. Result emphasizes relevant experience truthfully

#### Test 4: High Match Job (70%+)

**Setup:**
- CV: Product Designer with design systems experience
- Job: Senior Product Designer, Design Systems at Anthropic

**Expected behavior:**
1. Job analysis scores it 70%+
2. Job card shows "High" recommendation with green badge
3. No warning dialog
4. Optimization proceeds normally
5. Result should have minimal changes (already strong fit)

### Validation Testing

To verify the validation layer catches fabrication:

**Manual test:**
1. Temporarily disable Layer 1 (remove truthfulness rules from prompt)
2. Try optimizing designer CV for recruiter job
3. Validation layer should catch:
   - "Added recruiting experience not in base CV"
   - "DOMAIN SWITCH DETECTED: Changed from 'designer' to 'recruiter'"
4. Optimization should be rejected with detailed error

---

## Monitoring & Alerts

### What To Monitor

1. **Validation rejection rate**
   - Track how often `validateCVOptimization()` throws errors
   - High rate might indicate AI prompt needs strengthening

2. **Low-match optimizations**
   - Track how many users proceed despite <30% warning
   - Consider stronger UI blocking for <20% jobs

3. **User feedback**
   - Monitor for reports of fabricated content getting through
   - Indicates validation rules need tightening

### Error Logging

All fabrication attempts are logged:

```typescript
// In ai.ts validation method
if (warnings.length > 0) {
  console.error('CV FABRICATION DETECTED:', warnings);
  // Error is thrown to user with details
}
```

Check browser console for:
- `CV FABRICATION DETECTED: [array of warnings]`

---

## Configuration

### Environment Variables

No new environment variables required. Uses existing AI provider config:

```env
VITE_AI_PROVIDER=openai  # or "anthropic"
VITE_OPENAI_API_KEY=sk-proj-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Tuning Validation Sensitivity

To adjust validation strictness, modify in `ai.ts`:

```typescript
// Current: Requires 2+ domain keywords to flag
if (optimizedCount >= 2 && baseCount === 0) {
  // Flag as violation
}

// More strict: Requires only 1 domain keyword
if (optimizedCount >= 1 && baseCount === 0) {
  // Flag as violation
}

// Less strict: Requires 3+ domain keywords
if (optimizedCount >= 3 && baseCount === 0) {
  // Flag as violation
}
```

**Recommendation:** Keep at 2+ for balance between false positives and protection.

---

## Limitations & Edge Cases

### Known Limitations

1. **Synonym detection limited**
   - Validation checks exact keywords
   - Might miss clever synonyms (e.g., "talent specialist" instead of "recruiter")
   - **Mitigation:** Layer 1 (AI prompt) instructs against this

2. **Transferable skills boundary**
   - Hard to distinguish "emphasizing transferable skills" vs "fabricating experience"
   - Example: Designer mentions "cross-functional collaboration" → is this recruiting?
   - **Mitigation:** Validation allows generic terms, only flags domain-specific clusters

3. **User can override warnings**
   - Layer 4 (UI warning) can be dismissed
   - User could proceed with <30% job despite warning
   - **Mitigation:** Layers 1-3 still protect even if user proceeds

4. **AI prompt jailbreaking**
   - Sophisticated user could modify code to remove validation
   - Or use API directly bypassing UI
   - **Mitigation:** This is an integrity tool, not security tool; assumes good faith

### Edge Cases

#### Case 1: Similar domain terms

**Scenario:** CV mentions "team building" → job requires "build teams" (recruiting context)

**Handling:**
- "build teams" in recruiting keyword list
- "team building" in CV (design context)
- Validation might flag false positive
- **Resolution:** Review error, adjust keywords if needed

#### Case 2: Career transition

**Scenario:** User genuinely transitioning from design to recruiting

**Handling:**
- System will block/warn (by design)
- **Recommendation:** User should update base CV first to reflect new direction
- Don't use optimizer to fabricate transition that hasn't happened

#### Case 3: Hybrid roles

**Scenario:** Job is "Design Recruiter" (requires both design AND recruiting experience)

**Handling:**
- Job might score medium if design matches but recruiting doesn't
- Validation will flag if recruiting experience added
- **Resolution:** System working as intended; user shouldn't fabricate recruiting half

---

## Maintenance

### Regular Updates Needed

1. **Keyword list expansion** (quarterly)
   - Add new recruiting/sales terms as they emerge
   - Review job descriptions for patterns
   - Update `ai.ts` validation keywords

2. **Prompt refinement** (as needed)
   - If fabrication gets through, strengthen Layer 1 rules
   - Add specific examples of new violation patterns

3. **Threshold adjustments** (based on data)
   - Monitor average alignment scores
   - Adjust <30%, 30-49%, 50-69%, 70%+ cutoffs if needed

### Code Ownership

| Component | File | Owner Responsibility |
|-----------|------|---------------------|
| AI Prompt | `ai.ts:97-217` | Keep truthfulness rules at top, add examples as needed |
| Validation | `ai.ts:273-382` | Update keyword lists, adjust thresholds |
| Job Matching | `analyze.ts:164-195, 512-524` | Add new domains, tune scoring |
| UI Warning | `CVOptimizer.tsx:81-101` | Adjust warning text, thresholds |

---

## References

### Related Documentation

- [CV Optimizer Agent](../claude-code-agents/cv-optimizer.md) - Original agent instructions (not integrated into UI workflow)
- [Alignment Algorithm](./alignment-algorithm.md) - How job matching scores are calculated
- [Job Research System](../howitwork.md) - Overall system architecture

### Key Files Modified

1. `job-research-system/job-research-ui/src/services/ai.ts`
   - Lines 97-217: Strengthened AI prompt
   - Lines 273-382: Validation layer

2. `job-research-system/job-research-mcp/src/tools/analyze.ts`
   - Lines 164-195: Recruiting/sales domain definitions
   - Lines 512-524: Updated alignment thresholds

3. `job-research-system/job-research-ui/src/components/CVOptimizer.tsx`
   - Lines 81-101: UI safety warning

### Git Commits

```bash
# View changes
git diff HEAD~1 -- job-research-system/job-research-ui/src/services/ai.ts
git diff HEAD~1 -- job-research-system/job-research-mcp/src/tools/analyze.ts
git diff HEAD~1 -- job-research-system/job-research-ui/src/components/CVOptimizer.tsx
```

---

## Summary

The CV Fabrication Prevention System uses **4 defensive layers** to ensure optimized CVs remain truthful:

1. ✅ **Strengthened AI Prompt** - Explicit rules at top of prompt
2. ✅ **Validation Layer** - Post-processing to catch fabrications
3. ✅ **Improved Job Matching** - Lower scores for mismatched roles
4. ✅ **UI Safety Warning** - Warns users before optimizing low-match jobs

**Key principle:** Professional integrity matters more than appearing to fit every job.

**Protection level:** Multi-layered defense means even if one layer fails, others catch fabrication.

**User experience:** Clear warnings help users focus on jobs that match their actual background, increasing application success rate with honest CVs.

---

**Last Updated:** 2025-11-22
**Version:** 1.0
**Status:** ✅ Production Ready
