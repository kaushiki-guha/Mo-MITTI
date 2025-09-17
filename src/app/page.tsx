
'use client';

import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockNotifications, Notification } from "@/lib/mock-data";
import { Bell, ChevronRight, Stethoscope, Wind } from "lucide-react";
import { useState, useEffect } from "react";
import { Mascot } from "@/components/mascot";

const iconMap = {
  bell: Bell,
  wind: Wind,
};

const mascotMessages = [
    "Did you know? Companion planting can naturally deter pests!",
    "Time to check your soil's moisture levels.",
    "Healthy soil, healthy crops, happy farmer!",
    "Ask me anything about your crops!",
    "Don't forget to rotate your crops to keep the soil healthy.",
    "A little mulch can go a long way in retaining water."
];

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications.slice(0, 1));
  const [mascotMessage, setMascotMessage] = useState(mascotMessages[0]);

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      setNotifications(prevNotifications => {
        const nextIndex = prevNotifications.length % mockNotifications.length;
        const newNotifications = [...prevNotifications, mockNotifications[nextIndex]];
        
        if (prevNotifications.length >= mockNotifications.length) {
             return newNotifications.slice(-mockNotifications.length);
        }
        
        if (!prevNotifications.find(n => n.id === mockNotifications[nextIndex].id)) {
            return newNotifications;
        }

        return prevNotifications;
      });
    }, 5000); 

    const mascotInterval = setInterval(() => {
        setMascotMessage(prevMessage => {
            const currentIndex = mascotMessages.indexOf(prevMessage);
            const nextIndex = (currentIndex + 1) % mascotMessages.length;
            return mascotMessages[nextIndex];
        });
    }, 7000);

    return () => {
        clearInterval(notificationInterval);
        clearInterval(mascotInterval);
    };
  }, []);


  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-start animate-fade-in-up">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to Mo'MITTI</h1>
            <p className="text-muted-foreground">Your AI-powered partner in agriculture.</p>
        </div>
        <div className="hidden md:flex items-center justify-center gap-4 p-4 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg">
            <Mascot className="w-20 h-24 flex-shrink-0" />
            <div className="relative">
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg shadow-inner max-w-xs">{mascotMessage}</p>
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-muted"></div>
            </div>
        </div>
      </div>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>
              Important updates and tasks for your farm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.slice().reverse().map((notification) => {
              const Icon = iconMap[notification.icon as keyof typeof iconMap] || Bell;
              return (
                <Alert key={notification.id} variant={notification.type === 'alert' ? 'destructive' : 'default'} className="animate-fade-in-up">
                  <Icon className="w-4 h-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription>{notification.description}</AlertDescription>
                </Alert>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="hover:border-primary transition-all hover:scale-105 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Link href="/chat" className="block">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Mascot className="w-6 h-6 text-primary" />
                  AI Crop Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask our AI assistant for advice on crop cultivation, soil health, and more.
                </p>
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" size="sm" className="ml-auto">
                    Ask a question
                    <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </CardFooter>
            </Link>
          </Card>
           <Card className="hover:border-primary transition-all hover:scale-105 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <Link href="/disease-detection" className="block">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  Disease Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload an image of a plant to detect diseases and get remedy suggestions.
                </p>
              </CardContent>
               <CardFooter>
                 <Button variant="ghost" size="sm" className="ml-auto">
                    Upload image
                    <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </CardFooter>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
