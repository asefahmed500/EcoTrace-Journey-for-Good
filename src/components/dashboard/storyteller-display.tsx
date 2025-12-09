
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedHtml, setParsedHtml] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchStory = async () => {
    if (isLoading || hasLoaded) return; // Prevent multiple requests
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/eco-summary');
      const result = await response.json();
      
      if (response.ok) {
        setStory(result);
        // Handle both 'narrative' and 'content' fields for backward compatibility
        const storyText = result.narrative || result.content || 'No story content available.';
        const html = await marked.parse(storyText);
        setParsedHtml(html);
        setHasLoaded(true);
      } else {
        console.error('API Error:', result);
        setError(result.error || 'An unexpected error occurred while generating your story.');
      }
    } catch (e) {
      console.error('Fetch Error:', e);
      setError('An unexpected error occurred while fetching your story. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't auto-load, only load when user clicks the tab or button
  const handleLoadStory = () => {
    if (!hasLoaded) {
      fetchStory();
    }
  };

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
                <div className="mt-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            setError(null);
                            setHasLoaded(false);
                            fetchStory();
                        }}
                    >
                        Try again
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    )
  }

  if (!story && !hasLoaded) {
    return (
      <Card className="flex flex-col items-center justify-center text-center py-20">
        <CardHeader>
            <div className="mx-auto bg-muted/50 p-4 rounded-full mb-4">
                <BotMessageSquare className="size-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Generate Your AI Story</CardTitle>
            <CardDescription className="max-w-md mx-auto mb-4">
                Get a personalized AI-generated summary of your environmental impact and journey progress.
            </CardDescription>
            <Button onClick={handleLoadStory} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate AI Story'}
            </Button>
        </CardHeader>
      </Card>
    )
  }

  if (!story && hasLoaded) {
    return (
      <Card className="flex flex-col items-center justify-center text-center py-20">
        <CardHeader>
            <div className="mx-auto bg-muted/50 p-4 rounded-full mb-4">
                <BotMessageSquare className="size-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Story Available</CardTitle>
            <CardDescription className="max-w-md mx-auto mb-4">
                Log some journeys first to generate your personalized AI story.
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
            <CardTitle className="text-3xl">{story?.title || 'Your EcoTrace Story'}</CardTitle>
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
