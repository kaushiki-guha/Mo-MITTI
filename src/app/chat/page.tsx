
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askCropQuestion, AskCropQuestionOutput } from '@/ai/flows/ai-chat-for-crop-guidance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Mascot } from '@/components/mascot';

const chatSchema = z.object({
  query: z.string().min(1, 'Please enter a question.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;

export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskCropQuestionOutput | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      query: '',
    },
  });

  async function onSubmit(data: ChatFormValues) {
    setLoading(true);
    setResult(null);
    setLastQuery(data.query);
    try {
      const response = await askCropQuestion(data);
      setResult(response);
    } catch (error) {
      console.error('Error asking crop question:', error);
      // You could show a toast notification here
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI Crop Guidance</h1>
        <p className="text-muted-foreground">Ask our AI assistant for advice on crop cultivation, soil health, and more.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>Enter your question below and our AI will provide guidance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Question</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., What are the best crops to grow in a high-alkaline soil?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ask AI
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {lastQuery && (
          <div className="flex items-start gap-4">
              <Avatar>
                  <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div className="bg-muted p-4 rounded-lg w-full">
                  <p className="font-semibold">You</p>
                  <p>{lastQuery}</p>
              </div>
          </div>
      )}

      {(loading || result) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Avatar>
                    <AvatarFallback><Mascot className="w-6 h-6" /></AvatarFallback>
                </Avatar>
              <span>AI Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{result.answer}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
