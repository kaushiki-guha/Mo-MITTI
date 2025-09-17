
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { detectDisease, DetectDiseaseOutput } from '@/ai/flows/image-based-disease-detection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const diseaseSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Please upload an image.')
    .refine((files) => files?.[0]?.type.startsWith('image/'), 'Please upload a valid image file.')
});

type DiseaseFormValues = z.infer<typeof diseaseSchema>;

export default function DiseaseDetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectDiseaseOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      {preview && (
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
              <div className="space-y-4">
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
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
