'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, Bot } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeCropGrowth, AnalyzeCropGrowthOutput } from '@/ai/flows/analyze-crop-growth';

const farmDetailsSchema = z.object({
  landSize: z.string().min(1, 'Please enter the land size.'),
  landShapeImage: z.any().refine((files) => files?.length === 1, 'Please upload an image of the farm land.'),
  currentCrops: z.string().min(1, 'Please list the current crops.'),
  cropGrowthImage: z.any().refine((files) => files?.length === 1, 'Please upload an image for growth stage analysis.'),
  irrigationSystem: z.string().min(1, 'Please describe the irrigation system.'),
});

type FarmDetailsFormValues = z.infer<typeof farmDetailsSchema>;

export default function FarmDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeCropGrowthOutput | null>(null);
  const [landShapePreview, setLandShapePreview] = useState<string | null>(null);
  const [cropGrowthPreview, setCropGrowthPreview] = useState<string | null>(null);
  
  const landShapeInputRef = useRef<HTMLInputElement>(null);
  const cropGrowthInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FarmDetailsFormValues>({
    resolver: zodResolver(farmDetailsSchema),
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'landShapeImage' | 'cropGrowthImage',
    setPreview: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue(fieldName, event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (fieldName === 'cropGrowthImage') {
        setResult(null);
      }
    }
  };

  const clearPreview = (
    fieldName: 'landShapeImage' | 'cropGrowthImage',
    setPreview: (value: string | null) => void,
    ref: React.RefObject<HTMLInputElement>
  ) => {
    setPreview(null);
    form.setValue(fieldName, null);
    if (ref.current) {
      ref.current.value = '';
    }
    if (fieldName === 'cropGrowthImage') {
      setResult(null);
    }
  };

  async function onSubmit(data: FarmDetailsFormValues) {
    const file = data.cropGrowthImage[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const response = await analyzeCropGrowth({ photoDataUri: base64data });
        setResult(response);
      } catch (error) {
        console.error('Error analyzing crop growth:', error);
      } finally {
        setLoading(false);
      }
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Farm Details</h1>
        <p className="text-muted-foreground">Enter details about your farm for analysis and recommendations.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Farm Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="landSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Land Size (in acres)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentCrops"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Crops Growing</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Corn, Soybeans, Wheat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="irrigationSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Irrigation System</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Drip irrigation, Sprinklers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                    <span>Farm Land Shape</span>
                     {landShapePreview && <Button variant="ghost" size="icon" onClick={() => clearPreview('landShapeImage', setLandShapePreview, landShapeInputRef)}><X className="h-4 w-4" /></Button>}
                    </CardTitle>
                    <CardDescription>Upload a satellite or drone image.</CardDescription>
                </CardHeader>
                <CardContent>
                <FormField
                    control={form.control}
                    name="landShapeImage"
                    render={() => (
                    <FormItem>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'landShapeImage', setLandShapePreview)}
                                ref={landShapeInputRef}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {landShapePreview && (
                    <div className="mt-4">
                        <Image src={landShapePreview} alt="Land shape preview" width={300} height={300} className="rounded-md object-contain w-full" />
                    </div>
                )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                    <span>Crop Growth Stage</span>
                     {cropGrowthPreview && <Button variant="ghost" size="icon" onClick={() => clearPreview('cropGrowthImage', setCropGrowthPreview, cropGrowthInputRef)}><X className="h-4 w-4" /></Button>}
                    </CardTitle>
                    <CardDescription>Upload an image for AI analysis.</CardDescription>
                </CardHeader>
                 <CardContent>
                 <FormField
                    control={form.control}
                    name="cropGrowthImage"
                    render={() => (
                    <FormItem>
                        <FormControl>
                             <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'cropGrowthImage', setCropGrowthPreview)}
                                ref={cropGrowthInputRef}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                {cropGrowthPreview && (
                    <div className="mt-4">
                        <Image src={cropGrowthPreview} alt="Crop growth preview" width={300} height={300} className="rounded-md object-contain w-full" />
                    </div>
                )}
                 </CardContent>
            </Card>
          </div>

          <Button type="submit" disabled={loading || !cropGrowthPreview}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Growth Stage...</>
            ) : (
              <> <Bot className="mr-2" /> Analyze Growth Stage</>
            )}
          </Button>
        </form>
      </Form>
      
      {(loading || result) && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Stage Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                 <Skeleton className="h-6 w-[200px]" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">{result.growthStage}</h3>
                <div>
                    <h4 className="font-semibold">Analysis:</h4>
                    <p className="text-muted-foreground">{result.analysis}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
