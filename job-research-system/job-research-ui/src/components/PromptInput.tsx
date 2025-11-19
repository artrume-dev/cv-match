import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Sparkles } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const EXAMPLE_PROMPTS = [
  "Find new jobs at Anthropic",
  "Show me high-priority jobs",
  "Analyze job fit for Product Operations Manager",
  "Optimize my CV for this role",
  "What jobs need my attention?",
];

export function PromptInput({ onSubmit, isLoading, placeholder = "Ask about jobs, analyze roles, or optimize your CV..." }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={!prompt.trim() || isLoading}>
          {isLoading ? (
            <Sparkles className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((example, i) => (
          <button
            key={i}
            onClick={() => setPrompt(example)}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
