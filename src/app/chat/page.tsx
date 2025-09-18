
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askCropQuestion, AskCropQuestionOutput } from '@/ai/flows/ai-chat-for-crop-guidance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, CheckCircle2, History, Trash2, Droplets, Leaf, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Mascot } from '@/components/mascot';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const chatSchema = z.object({
  query: z.string().min(1, 'Please enter a question.'),
});

type ChatFormValues = z.infer<typeof chatSchema>;
type ChatHistoryItem = {
    query: string;
    result: AskCropQuestionOutput;
    timestamp: string;
};

const renderResult = (result: AskCropQuestionOutput) => (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <p className="lead text-lg">{result.introduction}</p>

        <Separator />
        
        <div>
            <h3 className="text-xl font-semibold">Cultivation Steps</h3>
            <Accordion type="single" collapsible className="w-full" defaultValue="step-0">
                 {result.cultivationSteps && result.cultivationSteps.map((step, index) => (
                    <AccordionItem value={`step-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-medium">{step.step}</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-3 list-none p-0">
                                {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{detail.point}</p>
                                            <p className="text-muted-foreground">{detail.explanation}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                 ))}
            </Accordion>
        </div>

        <Separator />

        <div className="grid md:grid-cols-3 gap-6">
            {result.irrigation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Droplets className="text-primary"/> Irrigation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Frequency:</strong> {result.irrigation.frequency}</p>
                        <p><strong>Method:</strong> {result.irrigation.method}</p>
                        <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {result.irrigation.notes}</p>
                    </CardContent>
                </Card>
            )}
             {result.fertilizers && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Leaf className="text-primary"/> Fertilizers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Recommendation:</strong> {result.fertilizers.recommendation}</p>
                        <p><strong>Schedule:</strong> {result.fertilizers.schedule}</p>
                        <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {result.fertilizers.notes}</p>
                    </CardContent>
                </Card>
            )}
             {result.pesticides && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Shield className="text-primary"/> Pesticides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Recommendation:</strong> {result.pesticides.recommendation}</p>
                        <p><strong>Schedule:</strong> {result.pesticides.schedule}</p>
                        <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {result.pesticides.notes}</p>
                    </CardContent>
                </Card>
             )}
        </div>
    </div>
);


export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskCropQuestionOutput | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('crop_guidance_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

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
      const newHistoryItem = { query: data.query, result: response, timestamp: new Date().toISOString() };
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('crop_guidance_history', JSON.stringify(updatedHistory));

    } catch (error) {
      console.error('Error asking crop question:', error);
      // You could show a toast notification here
    } finally {
      setLoading(false);
      form.reset();
    }
  }

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('crop_guidance_history');
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI Crop Guidance</h1>
        <p className="text-muted-foreground">Ask our AI assistant for advice on crop cultivation, soil health, and more.</p>
      </div>

      <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
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

      {lastQuery && !loading && (
          <div className="flex items-start gap-4 animate-fade-in-up">
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
        <Card className="animate-fade-in-up">
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
              <div className="space-y-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Separator className="my-2" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : result ? (
              renderResult(result)
            ) : null}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Conversation History
              </span>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="mr-2" /> Clear History
              </Button>
            </CardTitle>
            <CardDescription>Review your past conversations with the AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex flex-col text-left">
                       <span>{item.query}</span>
                       <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4">
                      {renderResult(item.result)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
