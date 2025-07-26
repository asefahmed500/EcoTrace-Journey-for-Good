
"use client";

import { useEffect, useState } from 'react';
import type { AiStory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BotMessageSquare, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { marked } from 'marked';

export function StorytellerDisplay() {
  const [story, setStory] = useState<AiStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedHtml, setParsedHtml] = useState<string>('');

  const fetchStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/eco-summary');
      const result = await response.json();
      
      if (response.ok) {
        setStory(result);
        const html = await marked.parse(result.narrative);
        setParsedHtml(html);
      } else {
        setError(result.error || 'An unexpected error occurred.');
      }
    } catch (e) {
      setError('An unexpected error occurred while fetching your story.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStory();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <BotMessageSquare className="h-4 w-4" />
            <AlertTitle>Could not generate AI summary</AlertTitle>
            <AlertDescription>
                {error}
                <Button variant="link" onClick={fetchStory} className="p-0 h-auto ml-2">Try again</Button>
            </AlertDescription>
        </Alert>
    )
  }

  if (!story) {
    return (
      <Card className="flex flex-col items-center justify-center text-center py-20">
        <CardHeader>
            <div className="mx-auto bg-muted/50 p-4 rounded-full mb-4">
                <BotMessageSquare className="size-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Your AI Story Will Appear Here</CardTitle>
            <CardDescription className="max-w-md mx-auto">
                Once you log some journeys, our AI Eco-Coach will generate a personalized summary of your progress right here.
            </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="size-6 text-primary" />
            <CardTitle className="text-3xl">{story.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-lg dark:prose-invert max-w-none" 
          dangerouslySetInnerHTML={{ __html: parsedHtml }} 
        />
      </CardContent>
    </Card>
  );
}
