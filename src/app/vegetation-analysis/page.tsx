
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeVegetation, AnalyzeVegetationOutput } from '@/ai/flows/vegetation-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const vegetationSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Please upload an image.')
    .refine((files) => files?.[0]?.type.startsWith('image/'), 'Please upload a valid image file.')
});

type VegetationFormValues = z.infer<typeof vegetationSchema>;

export default function VegetationAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeVegetationOutput | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<VegetationFormValues>({
    resolver: zodResolver(vegetationSchema),
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

  async function onSubmit(data: VegetationFormValues) {
    const file = data.image[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const response = await analyzeVegetation({ photoDataUri: base64data });
        setResult(response);
      } catch (error) {
        console.error('Error analyzing vegetation:', error);
        // You could show a toast notification here
      } finally {
        setLoading(false);
      }
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Vegetation Analysis</h1>
        <p className="text-muted-foreground">Upload a crop image to analyze vegetation indices and health.</p>
      </div>

      <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <CardHeader>
          <CardTitle>Upload Crop Image</CardTitle>
          <CardDescription>Select an image file of your crop field.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Image</FormLabel>
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
            <Image src={preview} alt="Image preview" width={400} height={400} className="rounded-md object-contain" />
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
              <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Vegetation Indices</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">NDVI</p>
                            <p className="text-2xl font-bold">{result.vegetationIndices.ndvi.toFixed(3)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">SAVI</p>
                            <p className="text-2xl font-bold">{result.vegetationIndices.savi.toFixed(3)}</p>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold text-lg">Overall Analysis</h4>
                    <p className="text-muted-foreground">{result.analysis}</p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-lg">Noise Removal Strategy</h4>
                    <p className="text-muted-foreground">{result.noiseRemoval}</p>
                </div>

                <div>
                    <h4 className="font-semibold text-lg">Segmentation Strategy</h4>
                    <p className="text-muted-foreground">{result.segmentation}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
