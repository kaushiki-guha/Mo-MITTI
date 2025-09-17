
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Bot, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeCropGrowth, AnalyzeCropGrowthOutput } from '@/ai/flows/analyze-crop-growth';
import { Separator } from '@/components/ui/separator';

const cropSchema = z.object({
  name: z.string().min(1, 'Crop name is required.'),
  growthImage: z.any().refine((files) => files?.length === 1, 'Please upload an image.'),
  preview: z.string().optional(),
  analysisResult: z.custom<AnalyzeCropGrowthOutput>().optional(),
});

const farmDetailsSchema = z.object({
  landSize: z.string().min(1, 'Please enter the land size.'),
  landShapeImage: z.any().optional(),
  crops: z.array(cropSchema).min(1, 'Please add at least one crop.'),
  irrigationSystem: z.string().min(1, 'Please describe the irrigation system.'),
});

type FarmDetailsFormValues = z.infer<typeof farmDetailsSchema>;

export default function FarmDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [landShapePreview, setLandShapePreview] = useState<string | null>(null);

  const form = useForm<FarmDetailsFormValues>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      crops: [{ name: '', growthImage: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'crops',
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (files: FileList | null) => void,
    onPreviewChange: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        onPreviewChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLandShapeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(file){
        form.setValue('landShapeImage', event.target.files);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLandShapePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  }

  const clearLandShapePreview = () => {
    setLandShapePreview(null);
    form.setValue('landShapeImage', null);
  }

  async function onSubmit(data: FarmDetailsFormValues) {
    setLoading(true);
    
    const analysisPromises = data.crops.map(async (crop, index) => {
      const file = crop.growthImage[0];
      if (!file) return null;

      return new Promise<AnalyzeCropGrowthOutput | null>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const response = await analyzeCropGrowth({ photoDataUri: base64data });
            form.setValue(`crops.${index}.analysisResult`, response);
            resolve(response);
          } catch (error) {
            console.error('Error analyzing crop growth:', error);
            resolve(null);
          }
        };
      });
    });

    await Promise.all(analysisPromises);
    setLoading(false);
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
          
           <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                    <span>Farm Land Shape</span>
                     {landShapePreview && <Button variant="ghost" size="icon" onClick={clearLandShapePreview}><X className="h-4 w-4" /></Button>}
                    </CardTitle>
                    <CardDescription>Upload a satellite or drone image of your farm land.</CardDescription>
                </CardHeader>
                <CardContent>
                <FormField
                    control={form.control}
                    name="landShapeImage"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLandShapeFileChange}
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
              <CardTitle>Current Crops</CardTitle>
              <CardDescription>Add the crops currently growing in your field and an image for analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`crops.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crop Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Corn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Controller
                        control={form.control}
                        name={`crops.${index}.growthImage`}
                        render={({ field: { onChange, value, ...field }, fieldState }) => (
                            <FormItem>
                                <FormLabel>Crop Growth Image</FormLabel>
                                <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        handleFileChange(e, (files) => onChange(files), (preview) => form.setValue(`crops.${index}.preview`, preview));
                                    }}
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                  </div>

                  {form.watch(`crops.${index}.preview`) && (
                     <div className="flex justify-center">
                        <Image src={form.watch(`crops.${index}.preview`)!} alt="Crop preview" width={200} height={200} className="rounded-md object-contain" />
                    </div>
                  )}

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {(loading || form.watch(`crops.${index}.analysisResult`)) && (
                    <div className="pt-4">
                        <Separator />
                         <h4 className="text-lg font-semibold mt-4">Growth Stage Analysis</h4>
                         {loading && !form.watch(`crops.${index}.analysisResult`) ? (
                              <div className="space-y-4 mt-2">
                                <Skeleton className="h-6 w-[200px]" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                         ) : form.watch(`crops.${index}.analysisResult`) ? (
                            <div className="space-y-2 mt-2">
                                <h3 className="text-xl font-semibold text-primary">{form.watch(`crops.${index}.analysisResult`)?.growthStage}</h3>
                                <div>
                                    <h4 className="font-semibold">Analysis:</h4>
                                    <p className="text-muted-foreground">{form.watch(`crops.${index}.analysisResult`)?.analysis}</p>
                                </div>
                            </div>
                         ) : null}
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', growthImage: null })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Crop
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing All Crops...</>
            ) : (
              <> <Bot className="mr-2" /> Analyze All Crops</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
