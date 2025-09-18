
'use client';

import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, CalendarIcon, Loader2, LocateIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { getAuth, updateProfile } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    contact: z.string().min(1, 'Contact is required.'),
    dob: z.date({
        required_error: "A date of birth is required.",
    }),
    farmingStatus: z.enum(['independent', 'organisation'], {
        required_error: "You need to select a farming status.",
    }),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const LOCAL_STORAGE_KEY = 'profile_data';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(firebaseApp);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
      contact: '',
      farmingStatus: 'independent',
    },
  });

  useEffect(() => {
    if (user) {
        const savedData = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.uid}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Coerce string to Date object
            if(parsed.dob) {
                parsed.dob = new Date(parsed.dob);
            }
            form.reset(parsed);
        } else {
            form.reset({
                name: user.displayName || '',
                contact: '',
                farmingStatus: 'independent',
            });
        }
    }
  }, [user, form]);
  
  // Auto-save on change
  useEffect(() => {
    if (user) {
        const subscription = form.watch((value) => {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.uid}`, JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }
  }, [form, user]);

  const getLocation = () => {
    if (!navigator.geolocation) {
        toast({
            variant: "destructive",
            title: "Geolocation Not Supported",
            description: "Your browser does not support geolocation.",
        });
        return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            form.setValue('location', { latitude, longitude });
            setLocationLoading(false);
            toast({
                title: "Location Captured",
                description: "Your current location has been successfully set.",
            });
        },
        (error) => {
            setLocationLoading(false);
            toast({
                variant: "destructive",
                title: "Location Error",
                description: error.message,
            });
        }
    );
  };

  async function onSubmit(data: ProfileFormValues) {
    setLoading(true);
    try {
        if (auth.currentUser) {
             await updateProfile(auth.currentUser, {
                displayName: data.name
            });
        }
        // Here you would typically save the rest of the data (data.contact, data.dob, etc.)
        // to a database like Firestore or Realtime Database.
        // We'll simulate that with a timeout.
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully saved.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">User Profile</h1>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-[250px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Profile</h1>
        <p className="text-muted-foreground">Manage your account settings. Your data is saved automatically.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {user.displayName?.[0].toUpperCase() || user.email?.[0].toUpperCase() || <User />}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{form.watch('name') || user.email}</CardTitle>
              <CardDescription>Your personal account.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email || ''} disabled />
                    </div>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                            <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <FormControl>
                            <Input placeholder="Your contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown-buttons"
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="farmingStatus"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Choose your Farming Status</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="independent" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Independent
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="organisation" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Under Organisation
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <FormLabel>Location</FormLabel>
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={getLocation} disabled={locationLoading}>
                                {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateIcon className="mr-2 h-4 w-4" />}
                                Get Current Location
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="location.latitude"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Latitude" {...field} disabled value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="location.longitude"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Longitude" {...field} disabled value={field.value ?? ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
