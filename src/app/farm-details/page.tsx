
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, X, Plus, Trash2, Info, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { analyzeVegetation, AnalyzeVegetationOutput } from '@/ai/flows/vegetation-analysis';
import { suggestCropsForLand, SuggestCropsForLandOutput } from '@/ai/flows/suggest-crops-for-land';
import { Separator } from '@/components/ui/separator';
import { Mascot } from '@/components/mascot';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const cropSchema = z.object({
  name: z.string().min(1, 'Crop name is required.'),
  growthImage: z.any().refine((files) => files?.length > 0, 'Please upload an image.'),
  preview: z.string().optional(),
  analysisResult: z.custom<AnalyzeVegetationOutput>().optional(),
});

const farmDetailsSchema = z.object({
  landSize: z.string().min(1, 'Please enter the land size.'),
  landShapeImage: z.any().optional(),
  landShapePreview: z.string().optional(),
  crops: z.array(cropSchema),
  irrigationSystem: z.string().min(1, 'Please describe the irrigation system.'),
});

type FarmDetailsFormValues = z.infer<typeof farmDetailsSchema>;

const LOCAL_STORAGE_KEY = 'farm_details';

const exampleAnalysis: AnalyzeVegetationOutput = {
    vegetationIndices: {
        ndvi: 0.82,
        savi: 0.65,
        chlorophyllContent: 55.3,
        moistureLevel: 68.5,
    },
    soilIndices: {
        bi: 0.34,
        ci: 0.12,
    },
    analysis: "The crop appears healthy and vigorous, with high NDVI and chlorophyll values indicating dense, thriving vegetation. Soil moisture is adequate.",
    noiseRemoval: "Noise removal would typically involve atmospheric correction algorithms to account for haze and lighting variations.",
    segmentation: "Segmentation would be performed using a color-based thresholding method to separate the green vegetation from the brown soil background."
};

export default function FarmDetailsPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [suggestingCrops, setSuggestingCrops] = useState(false);
  const [cropSuggestions, setCropSuggestions] = useState<SuggestCropsForLandOutput | null>(null);


  const form = useForm<FarmDetailsFormValues>({
    resolver: zodResolver(farmDetailsSchema),
    defaultValues: {
      landSize: '',
      irrigationSystem: '',
      crops: [],
      landShapeImage: null,
      landShapePreview: ''
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Reset form with saved data, but clear file inputs
      form.reset({
        ...parsedData,
        landShapeImage: null, 
        crops: parsedData.crops.map((crop: any) => ({...crop, growthImage: null})) 
      });
      if (parsedData.cropSuggestions) {
          setCropSuggestions(parsedData.cropSuggestions);
      }
    }
  }, [form]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'crops',
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    onChange: (files: FileList | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        update(index, { ...form.getValues(`crops.${index}`), preview: reader.result as string, analysisResult: undefined });
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
            form.setValue('landShapePreview', reader.result as string);
            setCropSuggestions(null); // Clear old suggestions
        };
        reader.readAsDataURL(file);
    }
  }

  const clearLandShapePreview = () => {
    form.setValue('landShapeImage', null);
    form.setValue('landShapePreview', '');
    setCropSuggestions(null);
  }

  async function analyzeCrop(index: number) {
    setLoading(index);
    
    const crop = form.getValues(`crops.${index}`);
    const file = crop.growthImage?.[0];
    
    if (!file) {
        setLoading(null);
        return;
    };

    update(index, { ...crop, analysisResult: undefined });

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
            const response = await analyzeVegetation({ photoDataUri: base64data });
            form.setValue(`crops.${index}.analysisResult`, response);
        } catch (error) {
            console.error('Error analyzing vegetation:', error);
        } finally {
            setLoading(null);
        }
    };
  }

  const handleSuggestCrops = async () => {
    const { landShapePreview, landSize, irrigationSystem } = form.getValues();
    if (!landShapePreview || !landSize || !irrigationSystem) {
        // Maybe show a toast message to fill out the form
        return;
    }
    setSuggestingCrops(true);
    setCropSuggestions(null);
    try {
        const response = await suggestCropsForLand({
            photoDataUri: landShapePreview,
            landSize,
            irrigationSystem
        });
        setCropSuggestions(response);
    } catch (error) {
        console.error("Error suggesting crops:", error);
    } finally {
        setSuggestingCrops(false);
    }
  }

  const saveData = () => {
    const data = form.getValues();
    const dataToSave = {
        ...data,
        crops: data.crops.map(crop => {
            const { growthImage, ...rest } = crop; // exclude FileList
            return rest;
        }),
        cropSuggestions,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }

  // Auto-save on change
  useEffect(() => {
    const subscription = form.watch(() => saveData());
    return () => subscription.unsubscribe();
  }, [form, cropSuggestions]);


  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Farm Details</h1>
        <p className="text-muted-foreground">Enter details about your farm. All data is saved automatically.</p>
      </div>

      <Form {...form}>
        <form className="space-y-8">
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
                     {form.watch('landShapePreview') && <Button variant="ghost" size="icon" onClick={clearLandShapePreview}><X className="h-4 w-4" /></Button>}
                    </CardTitle>
                    <CardDescription>Upload a satellite or drone image of your farm land. You can get this from a service like USGS EarthExplorer or by taking a screenshot from Google Maps.</CardDescription>
                </CardHeader>
                <CardContent>
                <Controller
                    control={form.control}
                    name="landShapeImage"
                    render={({ field: { onChange, value, ...field }, fieldState }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLandShapeFileChange}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.watch('landShapePreview') && (
                    <div className="mt-4 flex flex-col items-center gap-4">
                        <Image src={form.watch('landShapePreview')!} alt="Land shape preview" width={300} height={300} className="rounded-md object-contain w-full" />
                         <Button type="button" onClick={handleSuggestCrops} disabled={suggestingCrops || !form.watch('landSize') || !form.watch('irrigationSystem')}>
                            {suggestingCrops ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                            Suggest Crops
                        </Button>
                    </div>
                )}
                </CardContent>
            </Card>
            
            {(suggestingCrops || cropSuggestions) && (
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Crop Suggestions</CardTitle>
                        <CardDescription>Based on your land data, here are some recommended crops.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {suggestingCrops ? (
                             <div className="space-y-4">
                                <Skeleton className="h-6 w-[200px]" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[300px]" />
                            </div>
                        ) : cropSuggestions ? (
                            <div className="space-y-6">
                                {cropSuggestions.suggestions.map((suggestion, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <h4 className="text-lg font-semibold text-primary">{suggestion.cropName}</h4>
                                        <p className="text-sm text-muted-foreground mt-1"><strong>Estimated Yield:</strong> {suggestion.estimatedYield}</p>
                                        <p className="mt-2 text-sm">{suggestion.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </CardContent>
                 </Card>
            )}

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
                    Click the "Add Crop" button to start analyzing your crops. You can add as many as you need. See an example below.
                  </AlertDescription>
                </Alert>
              )}
              {fields.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid gap-4 md:grid-cols-2 items-start">
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
                                    onChange={(e) => handleFileChange(e, index, onChange)}
                                />
                                </FormControl>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                  </div>

                  {form.watch(`crops.${index}.preview`) && (
                     <div className="flex flex-col items-center gap-4">
                        <Image src={form.watch(`crops.${index}.preview`)!} alt="Crop preview" width={200} height={200} className="rounded-md object-contain" />
                        <Button type="button" onClick={() => analyzeCrop(index)} disabled={loading === index || !form.watch(`crops.${index}.growthImage`)}>
                            {loading === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mascot className="mr-2 h-5 w-5" />}
                            Analyze Crop
                        </Button>
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
                  
                  {(loading === index || form.watch(`crops.${index}.analysisResult`)) && (
                    <div className="pt-4 space-y-6">
                        <Separator />
                         <h4 className="text-lg font-semibold -mb-2">Spectral Analysis</h4>
                         {loading === index && !form.watch(`crops.${index}.analysisResult`) ? (
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
                onClick={() => append({ name: '', growthImage: null, preview: '' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Crop
              </Button>
            </CardContent>
          </Card>

           {fields.length === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Example Analysis</CardTitle>
                        <CardDescription>This is an example of the analysis you'll receive for each crop image you upload.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <Image src="https://picsum.photos/seed/corn/200/200" alt="Example crop" width={200} height={200} className="rounded-md object-cover" data-ai-hint="corn field" />
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-xl font-semibold text-primary mb-2">Vegetation Indices</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">NDVI</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.vegetationIndices.ndvi.toFixed(3)}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">SAVI</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.vegetationIndices.savi.toFixed(3)}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Chlorophyll</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.vegetationIndices.chlorophyllContent.toFixed(2)}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Moisture</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.vegetationIndices.moistureLevel.toFixed(2)}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-primary mb-2">Soil Indices</h3>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Brightness Index (BI)</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.soilIndices.bi.toFixed(3)}</p>
                                        </div>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <p className="text-sm text-muted-foreground">Color Index (CI)</p>
                                            <p className="text-2xl font-bold">{exampleAnalysis.soilIndices.ci.toFixed(3)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </form>
      </Form>
    </div>
  );
}

    

    
