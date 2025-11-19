import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { JobCard } from './components/JobCard';
import { CVOptimizer } from './components/CVOptimizer';
import { PromptInput } from './components/PromptInput';
import { mcpClient } from './api/mcp-client';
import type { Job, ApplicationStats } from './types';
import { Briefcase, TrendingUp, Search, Loader2, AlertCircle } from 'lucide-react';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedJobForCV, setSelectedJobForCV] = useState<Job | null>(null);

  // Load initial data
  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mcpClient.getJobs();
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs. Make sure the API server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await mcpClient.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handlePromptSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Parse simple commands from the prompt
      const lowerPrompt = prompt.toLowerCase();

      if (lowerPrompt.includes('find') || lowerPrompt.includes('search') || lowerPrompt.includes('new jobs')) {
        // Search for new jobs
        const companyMatch = lowerPrompt.match(/at (\w+)/);
        const companies = companyMatch ? [companyMatch[1]] : undefined;

        // First, search for any new jobs (this scrapes the career pages)
        const newJobs = await mcpClient.searchJobs(companies);

        // Then, get all existing jobs for that company/filter
        const allJobs = await mcpClient.getJobs();

        // Filter by company if specified
        let displayJobs = allJobs;
        if (companies && companies.length > 0) {
          const companyName = companies[0].toLowerCase();
          displayJobs = allJobs.filter(job =>
            job.company.toLowerCase().includes(companyName)
          );
        }

        // Show message about new jobs found
        if (newJobs.length > 0) {
          setError(`✓ Found ${newJobs.length} new jobs! Showing all ${displayJobs.length} jobs.`);
        } else if (displayJobs.length > 0) {
          setError(`No new jobs found, but showing ${displayJobs.length} existing jobs. All jobs are already in your database.`);
        } else {
          setError(`No jobs found${companies ? ` at ${companies[0]}` : ''}. Try searching for a different company.`);
        }

        setJobs(displayJobs);
      } else if (lowerPrompt.includes('high priority') || lowerPrompt.includes('high-priority')) {
        const filtered = await mcpClient.getJobs({ priority: 'high' });
        setJobs(filtered);
      } else if (lowerPrompt.includes('need attention') || lowerPrompt.includes('attention')) {
        const attention = await mcpClient.getJobsNeedingAttention();
        setJobs(attention.new_jobs || []);
      } else if (lowerPrompt.includes('applied')) {
        const applied = await mcpClient.getJobs({ status: 'applied' });
        setJobs(applied);
      } else {
        // Default: reload all jobs
        await loadJobs();
      }

      await loadStats();
    } catch (err) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (jobId: string) => {
    setIsLoading(true);
    try {
      await mcpClient.analyzeJob(jobId);
      await loadJobs();
      await loadStats();
    } catch (err) {
      setError('Failed to analyze job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkApplied = async (jobId: string) => {
    try {
      await mcpClient.markApplied(jobId, 'Applied via UI');
      await loadJobs();
      await loadStats();
    } catch (err) {
      setError('Failed to mark job as applied');
    }
  };

  const handleArchive = async (jobId: string) => {
    try {
      await mcpClient.archiveJob(jobId, 'Archived via UI');
      await loadJobs();
      await loadStats();
    } catch (err) {
      setError('Failed to archive job');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === 'all') return true;
    return job.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-primary" />
                AI Job Research System
              </h1>
              <p className="text-muted-foreground mt-1">
                Find, analyze, and track your perfect AI role
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Jobs</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Applied</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {stats.by_status?.applied || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>High Priority</CardDescription>
                <CardTitle className="text-3xl text-orange-600">
                  {stats.high_priority}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Alignment</CardDescription>
                <CardTitle className="text-3xl flex items-center gap-1">
                  {stats.avg_alignment ? `${stats.avg_alignment.toFixed(0)}%` : 'N/A'}
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Prompt Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Command
            </CardTitle>
            <CardDescription>
              Use natural language to search jobs, analyze roles, or invoke AI agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Status/Error Display */}
        {error && (
          <Card className={`mb-6 ${error.startsWith('✓') ? 'border-green-500' : error.startsWith('No new jobs') ? 'border-yellow-500' : 'border-destructive'}`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-2 ${error.startsWith('✓') ? 'text-green-600' : error.startsWith('No new jobs') ? 'text-yellow-600' : 'text-destructive'}`}>
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'new', 'reviewed', 'applied', 'interview'].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No jobs found. Try searching for new opportunities!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAnalyze={handleAnalyze}
                onApply={handleMarkApplied}
                onArchive={handleArchive}
                onOptimizeCV={setSelectedJobForCV}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by MCP Server • Built with React + Tailwind + shadcn/ui
          </p>
          <p className="mt-1">
            <Badge variant="outline" className="text-xs">
              API: http://localhost:3001
            </Badge>
          </p>
        </div>
      </footer>

      {/* CV Optimizer Modal */}
      {selectedJobForCV && (
        <CVOptimizer
          job={selectedJobForCV}
          onClose={() => setSelectedJobForCV(null)}
        />
      )}
    </div>
  );
}

export default App;
