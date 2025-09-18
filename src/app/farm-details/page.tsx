
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Plus, Trash2, Info } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeVegetation, AnalyzeVegetationOutput } from '@/ai/flows/vegetation-analysis';
import { Separator } from '@/components/ui/separator';
import { Mascot } from '@/components/mascot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const cropSchema = z.object({
  name: z.string().min(1, 'Crop name is required.'),
  growthImage: z.any().refine((files) => files?.length === 1, 'Please upload an image.'),
  preview: z.string().optional(),
  analysisResult: z.custom<AnalyzeVegetationOutput>().optional(),
});

const farmDetailsSchema = z.object({
  landSize: z.string().min(1, 'Please enter the land size.'),
  landShapeImage: z.any().optional(),
  crops: z.array(cropSchema),
  irrigationSystem: z.string().min(1, 'Please describe the irrigation system.'),
});

type FarmDetailsFormValues = z.infer<typeof farmDetailsSchema>;

export default function FarmDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [landShapePreview, setLandShapePreview] = useState<string | null>(null);

  const form = useForm<FarmDetailsFormValues>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      crops: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
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
    if (data.crops.length === 0) {
      // Don't submit if there are no crops
      return;
    }
    setLoading(true);
    
    const analysisPromises = data.crops.map(async (crop, index) => {
      // Clear previous results before new analysis
      update(index, { ...crop, analysisResult: undefined });

      const file = crop.growthImage[0];
      if (!file) return null;

      return new Promise<AnalyzeVegetationOutput | null>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          try {
            const response = await analyzeVegetation({ photoDataUri: base64data });
            form.setValue(`crops.${index}.analysisResult`, response);
            resolve(response);
          } catch (error) {
            console.error('Error analyzing vegetation:', error);
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
                    <FormDescription>
                      Use a tool like USGS EarthExplorer or Google Maps to find the area of your land.
                    </FormDescription>
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
                    <CardDescription>Upload a satellite or drone image of your farm land. You can get this from a service like USGS EarthExplorer or by taking a screenshot from Google Maps.</CardDescription>
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
              {fields.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Crops Added</AlertTitle>
                  <AlertDescription>
                    Click the "Add Crop" button to start analyzing your crops. You can add as many as you need.
                  </AlertDescription>
                </Alert>
              )}
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

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  {(loading || form.watch(`crops.${index}.analysisResult`)) && (
                    <div className="pt-4 space-y-6">
                        <Separator />
                         <h4 className="text-lg font-semibold -mb-2">Spectral Analysis</h4>
                         {loading && !form.watch(`crops.${index}.analysisResult`) ? (
                              <div className="space-y-4">
                                <Skeleton className="h-6 w-[200px]" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[300px]" />
                            </div>
                         ) : form.watch(`crops.${index}.analysisResult`) ? (
                            (result => result && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-primary mb-2">Vegetation Indices</h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">NDVI</p>
                                                <p className="text-2xl font-bold">{result.vegetationIndices.ndvi.toFixed(3)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">SAVI</p>
                                                <p className="text-2xl font-bold">{result.vegetationIndices.savi.toFixed(3)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Chlorophyll</p>
                                                <p className="text-2xl font-bold">{result.vegetationIndices.chlorophyllContent.toFixed(2)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Moisture</p>
                                                <p className="text-2xl font-bold">{result.vegetationIndices.moistureLevel.toFixed(2)}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-primary mb-2">Soil Indices</h3>
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Brightness Index (BI)</p>
                                                <p className="text-2xl font-bold">{result.soilIndices.bi.toFixed(3)}</p>
                                            </div>
                                            <div className="p-4 bg-muted rounded-lg">
                                                <p className="text-sm text-muted-foreground">Color Index (CI)</p>
                                                <p className="text-2xl font-bold">{result.soilIndices.ci.toFixed(3)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                        <h4 className="font-semibold text-lg">Overall Analysis</h4>
                                        <p className="text-muted-foreground">{result.analysis}</p>
                                    </div>
                                </div>
                            ))(form.watch(`crops.${index}.analysisResult`))
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
                Add Crop
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || fields.length === 0} size="lg">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing All Crops...</>
            ) : (
              <> <Mascot className="mr-2 h-6 w-6" /> Analyze All Crops</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

    