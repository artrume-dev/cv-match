import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Download, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import type { Job } from '../types';
import { aiService } from '../services/ai';

interface CVOptimizerProps {
  job: Job;
  onClose: () => void;
}

interface CVVersion {
  type: 'conservative' | 'optimized' | 'stretch';
  alignment: number;
  changes: string[];
  content: string;
}

export function CVOptimizer({ job, onClose }: CVOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [versions, setVersions] = useState<CVVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<'conservative' | 'optimized' | 'stretch'>('optimized');
  const [error, setError] = useState<string | null>(null);
  const [baselineAlignment, setBaselineAlignment] = useState<number>(0);
  const [strongMatches, setStrongMatches] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setError(null);

    try {
      const result = await aiService.optimizeCV(job);

      setVersions(result.versions);
      setBaselineAlignment(result.baseline_alignment);
      setStrongMatches(result.strong_matches);
      setGaps(result.gaps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize CV. Please check your API configuration.');
      console.error('CV optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownload = (version: CVVersion) => {
    const blob = new Blob([version.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV-${job.company}-${job.title.replace(/\s+/g, '-')}-${version.type}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedVersionData = versions.find(v => v.type === selectedVersion);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CV Optimizer
              </CardTitle>
              <CardDescription className="mt-1">
                Optimize your CV for: {job.title} at {job.company}
              </CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-semibold mb-1">Error</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>✕</Button>
            </div>
          )}

          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
              <p className="text-muted-foreground mb-2">
                Click the button below to generate 3 optimized CV versions tailored for this role
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Using {import.meta.env.VITE_AI_PROVIDER || 'OpenAI'} API
              </p>
              <Button onClick={handleOptimize} disabled={isOptimizing}>
                {isOptimizing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin mr-2" />
                    Optimizing CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Optimized CVs
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Version Selector */}
              <div className="flex gap-2">
                {versions.map((version) => (
                  <button
                    key={version.type}
                    onClick={() => setSelectedVersion(version.type)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      selectedVersion === version.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-semibold capitalize mb-1">
                      {version.type}
                      {version.type === 'optimized' && (
                        <Badge variant="default" className="ml-2 text-xs">Recommended</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      {version.alignment}% match
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Version Details */}
              {selectedVersionData && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Key Changes:</h3>
                    <ul className="space-y-1">
                      {selectedVersionData.changes.map((change, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Alignment Improvement:</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Baseline</span>
                          <span className="font-semibold">{baselineAlignment || job.alignment_score || 45}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-muted-foreground"
                            style={{ width: `${baselineAlignment || job.alignment_score || 45}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="capitalize">{selectedVersionData.type}</span>
                          <span className="font-semibold text-primary">{selectedVersionData.alignment}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${selectedVersionData.alignment}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strong Matches */}
                  {strongMatches.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Strong Matches:</h3>
                      <ul className="space-y-1">
                        {strongMatches.map((match, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            {match}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Gaps */}
                  {gaps.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Gaps to Address:</h3>
                      <ul className="space-y-1">
                        {gaps.map((gap, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-600">⚠</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Preview:</h3>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedVersionData.content}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleDownload(selectedVersionData)} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download {selectedVersionData.type} CV
                    </Button>
                    <Button variant="outline" onClick={() => {
                      versions.forEach(v => handleDownload(v));
                    }}>
                      Download All
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
