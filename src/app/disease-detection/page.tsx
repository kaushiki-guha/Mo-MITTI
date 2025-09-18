
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { detectDisease, DetectDiseaseOutput } from '@/ai/flows/image-based-disease-detection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, History, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const diseaseSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Please upload an image.')
    .refine((files) => files?.[0]?.type.startsWith('image/'), 'Please upload a valid image file.')
});

type DiseaseFormValues = z.infer<typeof diseaseSchema>;

type HistoryItem = {
    preview: string;
    result: DetectDiseaseOutput;
    timestamp: string;
};

export default function DiseaseDetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectDiseaseOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('disease_detection_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const form = useForm<DiseaseFormValues>({
    resolver: zodResolver(diseaseSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };
  
  const clearPreview = () => {
    setPreview(null);
    setResult(null);
    form.reset();
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const clearHistory = () => {
      setHistory([]);
      localStorage.removeItem('disease_detection_history');
  }

  async function onSubmit(data: DiseaseFormValues) {
    const file = data.image[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const response = await detectDisease({ photoDataUri: base64data });
        setResult(response);
        const newHistoryItem: HistoryItem = { preview: base64data, result: response, timestamp: new Date().toISOString() };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('disease_detection_history', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Error detecting disease:', error);
        // You could show a toast notification here
      } finally {
        setLoading(false);
      }
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Disease Detection</h1>
        <p className="text-muted-foreground">Upload an image of a plant to detect diseases and get remedy suggestions.</p>
      </div>

      <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Select an image file of a plant leaf or stem.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="max-w-xs"
                        />
                        <Button type="submit" disabled={loading || !preview}>
                          {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                          ) : (
                            <> <Upload className="mr-2" /> Analyze Image</>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {preview && !result && (
        <Card className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Image Preview</span>
              <Button variant="ghost" size="icon" onClick={clearPreview}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Image src={preview} alt="Image preview" width={300} height={300} className="rounded-md object-contain" />
          </CardContent>
        </Card>
      )}


      {(loading || result) && (
        <Card className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                 <Skeleton className="h-6 w-[200px]" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-[300px]" />
              </div>
            ) : result ? (
              <div className="flex flex-col md:flex-row gap-6">
                {preview && <Image src={preview} alt="Analyzed image" width={200} height={200} className="rounded-md object-contain" />}
                <div className="space-y-4 flex-1">
                    {result.diseaseIdentification.diseaseDetected ? (
                    <>
                        <h3 className="text-xl font-semibold text-destructive">{result.diseaseIdentification.diseaseName}</h3>
                        {result.diseaseIdentification.confidenceLevel && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Confidence: {Math.round(result.diseaseIdentification.confidenceLevel * 100)}%</p>
                                <Progress value={result.diseaseIdentification.confidenceLevel * 100} className="w-full max-w-sm"/>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold">Suggested Remedies:</h4>
                            <p className="text-muted-foreground">{result.suggestedRemedies}</p>
                        </div>
                    </>
                    ) : (
                    <p className="text-lg text-primary">No disease detected. The plant appears to be healthy.</p>
                    )}
                </div>
              </div>
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
                History
              </span>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 className="mr-2" /> Clear History
              </Button>
            </CardTitle>
            <CardDescription>Review your past analyses.</CardDescription>
          </CardHeader>
          <CardContent>
             <Accordion type="single" collapsible className="w-full">
                {history.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>
                           <div className="flex items-center gap-4">
                                <Image src={item.preview} alt="History item preview" width={40} height={40} className="rounded-md object-cover" />
                                <div className="flex flex-col text-left">
                                    <span>{item.result.diseaseIdentification.diseaseDetected ? item.result.diseaseIdentification.diseaseName : "Healthy"}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="flex flex-col md:flex-row gap-6 p-4">
                                <Image src={item.preview} alt="Analyzed image" width={200} height={200} className="rounded-md object-contain" />
                                <div className="space-y-4 flex-1">
                                    {item.result.diseaseIdentification.diseaseDetected ? (
                                    <>
                                        <h3 className="text-xl font-semibold text-destructive">{item.result.diseaseIdentification.diseaseName}</h3>
                                        {item.result.diseaseIdentification.confidenceLevel && (
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Confidence: {Math.round(item.result.diseaseIdentification.confidenceLevel * 100)}%</p>
                                                <Progress value={item.result.diseaseIdentification.confidenceLevel * 100} className="w-full max-w-sm"/>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold">Suggested Remedies:</h4>
                                            <p className="text-muted-foreground">{item.result.suggestedRemedies}</p>
                                        </div>
                                    </>
                                    ) : (
                                    <p className="text-lg text-primary">No disease detected. The plant appears to be healthy.</p>
                                    )}
                                </div>
                            </div>
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
