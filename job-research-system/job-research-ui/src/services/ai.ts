import type { Job } from '../types';

interface CVVersion {
  type: 'conservative' | 'optimized' | 'stretch';
  alignment: number;
  changes: string[];
  content: string;
}

interface CVOptimizationResult {
  versions: CVVersion[];
  baseline_alignment: number;
  strong_matches: string[];
  gaps: string[];
}

const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'openai';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

class AIService {
  private async callOpenAI(prompt: string): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env file.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a CV optimization specialist. Your job is to analyze job postings and create tailored CV versions that maximize alignment while maintaining complete factual accuracy. Never invent experience or skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured. Please set VITE_ANTHROPIC_API_KEY in .env file.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async optimizeCV(job: Job, cvContent: string): Promise<CVOptimizationResult> {
    if (!cvContent || cvContent.trim().length === 0) {
      throw new Error('No CV content provided. Please upload a CV first.');
    }

    const prompt = `
You are a CV optimization specialist. Your role is to help present existing experience more effectively, NOT to fabricate content.

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

## ✅ ALLOWED Optimizations:

- Reorder existing content to emphasize relevance
- Reframe existing experience with different emphasis (but same domain)
- Add context to make existing skills clearer
- Highlight transferable skills from existing work
- Adjust professional summary to emphasize relevant aspects of existing experience

## Job Details
**Company:** ${job.company}
**Title:** ${job.title}
**Description:** ${job.description || 'Not provided'}
**Requirements:** ${job.requirements || 'Not provided'}
**Current Alignment:** ${job.alignment_score || 'Unknown'}%

## Candidate's CV
${cvContent}

## Task
Create 3 CV versions with different optimization levels:

1. **Conservative (75% target):** Minimal changes, emphasize strongest alignments
2. **Optimized (85% target):** Strategic reframing and keyword optimization (RECOMMENDED)
3. **Stretch (90% target):** Maximum legitimate optimization, emphasize transferable skills

For each version, provide:
- Estimated alignment score
- List of 3-5 key changes made
- Full optimized CV content in markdown

Also identify:
- Strong matches between CV and job requirements
- Gaps that need addressing (be honest about fundamental mismatches)

Return your response in this exact JSON format (ensure all strings are properly escaped):
\`\`\`json
{
  "baseline_alignment": 45,
  "strong_matches": [
    "Design systems experience",
    "Enterprise scale",
    "Cross-functional leadership"
  ],
  "gaps": [
    "Need to emphasize AI/ML experience more",
    "Product operations background not highlighted"
  ],
  "versions": [
    {
      "type": "conservative",
      "alignment": 75,
      "changes": [
        "Reordered skills to match job requirements",
        "Updated professional summary",
        "Highlighted relevant experience"
      ],
      "content": "Full CV content here in markdown format"
    },
    {
      "type": "optimized",
      "alignment": 85,
      "changes": [
        "Strategic reframing of experience",
        "Enhanced keyword optimization",
        "Reordered achievements by relevance",
        "Updated skills section priority"
      ],
      "content": "Full CV content here in markdown format"
    },
    {
      "type": "stretch",
      "alignment": 90,
      "changes": [
        "Maximum legitimate optimization",
        "Emphasized all transferable skills",
        "Added context for emerging skills",
        "Comprehensive keyword alignment"
      ],
      "content": "Full CV content here in markdown format"
    }
  ]
}
\`\`\`

CRITICAL JSON FORMATTING:
- Escape all quotes in the content field using backslash (\\")
- Do not include newlines in JSON strings, use \\n instead
- Ensure valid JSON syntax throughout
- The content field should be a single string with \\n for line breaks
`;

    let response: string;

    try {
      if (AI_PROVIDER === 'anthropic') {
        response = await this.callAnthropic(prompt);
      } else {
        response = await this.callOpenAI(prompt);
      }

      // Extract JSON from response (might be wrapped in markdown code blocks)
      let jsonStr = response.trim();
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      // Remove any leading/trailing whitespace
      jsonStr = jsonStr.trim();
      
      // Try to parse JSON, if it fails, try to fix common issues
      try {
        const result = JSON.parse(jsonStr);

        // Fix escaped newlines in content fields
        if (result.versions) {
          result.versions = result.versions.map((version: CVVersion) => ({
            ...version,
            content: version.content.replace(/\\n/g, '\n')
          }));
        }

        // VALIDATION: Check for fabricated content
        this.validateCVOptimization(cvContent, result);

        return result;
      } catch (parseError) {
        console.error('Initial JSON parse failed, attempting to fix...', parseError);
        
        // Try to find the JSON object in the response
        const jsonObjMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonObjMatch) {
          const result = JSON.parse(jsonObjMatch[0]);

          // Fix escaped newlines in content fields
          if (result.versions) {
            result.versions = result.versions.map((version: CVVersion) => ({
              ...version,
              content: version.content.replace(/\\n/g, '\n')
            }));
          }

          // VALIDATION: Check for fabricated content
          this.validateCVOptimization(cvContent, result);

          return result;
        }
        
        throw new Error('Failed to parse AI response. Please try again or check the AI service logs.');
      }
    } catch (error) {
      console.error('CV optimization error:', error);
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error('Failed to parse AI response. The AI may have returned invalid JSON. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Failed to optimize CV');
    }
  }

  /**
   * Validates CV optimization result to detect fabricated content
   * Throws error if suspicious content is detected
   */
  private validateCVOptimization(baseCV: string, result: CVOptimizationResult): void {
    const baseLower = baseCV.toLowerCase();
    const warnings: string[] = [];

    // Define suspicious keywords that indicate domain/role fabrication
    const suspiciousKeywords: { [key: string]: string[] } = {
      recruiting: [
        'recruiter', 'recruiting', 'recruitment', 'talent acquisition',
        'technical recruiter', 'full-cycle recruiting', 'sourcing candidates',
        'hiring manager', 'ats system', 'candidate pipeline', 'headhunter',
        'talent sourcing', 'interview coordination', 'offer negotiation'
      ],
      sales: [
        'sales', 'account executive', 'business development', 'quota',
        'sales pipeline', 'crm', 'salesforce', 'territory', 'revenue target',
        'account management', 'lead generation', 'closing deals', 'sales quota'
      ],
      engineering: [
        'software engineer', 'backend engineer', 'frontend engineer',
        'full stack engineer', 'devops engineer', 'programming', 'coding algorithms'
      ]
    };

    // Check each version for fabricated content
    for (const version of result.versions) {
      const optimizedLower = version.content.toLowerCase();

      // Check for domain-switching keywords
      for (const [domain, keywords] of Object.entries(suspiciousKeywords)) {
        // Count how many domain keywords appear in base vs optimized
        const baseCount = keywords.filter(kw => baseLower.includes(kw)).length;
        const optimizedCount = keywords.filter(kw => optimizedLower.includes(kw)).length;

        // If optimized CV adds 2+ domain keywords that weren't in base, flag it
        if (optimizedCount >= 2 && baseCount === 0) {
          warnings.push(
            `⚠️ FABRICATION DETECTED in ${version.type} version: Added ${domain} experience not in base CV (found ${optimizedCount} ${domain}-related terms)`
          );
        }
      }

      // Check for fabricated metrics (specific percentages and large numbers)
      const metricPatterns = [
        /(\d+)%\s*(reduction|increase|improvement|growth)/gi,
        /(hired|recruited|filled)\s+(\d+)\s+(positions|roles|candidates)/gi,
        /(\$|€|£)\s*(\d+[kmb]?)\s*(revenue|sales|pipeline)/gi
      ];

      for (const pattern of metricPatterns) {
        const optimizedMatches = optimizedLower.match(pattern) || [];
        for (const match of optimizedMatches) {
          // If metric found in optimized but not in base, it's likely fabricated
          if (!baseLower.includes(match.toLowerCase())) {
            warnings.push(
              `⚠️ FABRICATED METRIC in ${version.type} version: "${match}" - not found in base CV`
            );
          }
        }
      }

      // Check for role title changes that indicate domain switching
      const baseTitleMatch = baseCV.match(/##?\s*([^\n]+)/); // First heading
      const optimizedTitleMatch = version.content.match(/##?\s*([^\n]+)/);

      if (baseTitleMatch && optimizedTitleMatch) {
        const baseTitle = baseTitleMatch[1].toLowerCase();
        const optimizedTitle = optimizedTitleMatch[1].toLowerCase();

        // Detect domain switches in job title
        const domainSwitches = [
          { from: 'designer', to: ['recruiter', 'sales', 'engineer'] },
          { from: 'engineer', to: ['recruiter', 'sales', 'designer'] },
          { from: 'developer', to: ['recruiter', 'sales', 'designer'] }
        ];

        for (const { from, to } of domainSwitches) {
          if (baseTitle.includes(from)) {
            for (const target of to) {
              if (optimizedTitle.includes(target) && !baseTitle.includes(target)) {
                warnings.push(
                  `⚠️ DOMAIN SWITCH DETECTED in ${version.type} version: Changed from "${from}" to "${target}" role`
                );
              }
            }
          }
        }
      }
    }

    // If any warnings were found, reject the optimization
    if (warnings.length > 0) {
      const errorMessage = [
        '🚫 CV OPTIMIZATION REJECTED - FABRICATION DETECTED',
        '',
        'The AI attempted to fabricate content that violates truthfulness rules:',
        '',
        ...warnings,
        '',
        '❌ This optimization has been blocked to protect your professional integrity.',
        '💡 Recommendation: This job may require fundamentally different experience.',
        '   Consider applying to jobs that better match your actual background.',
      ].join('\n');

      throw new Error(errorMessage);
    }
  }
}

export const aiService = new AIService();
