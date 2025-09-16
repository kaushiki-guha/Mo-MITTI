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
import { mockNotifications } from "@/lib/mock-data";
import { Bell, Bot, ChevronRight, Map, Stethoscope, Wind } from "lucide-react";
import Image from 'next/image';

const iconMap = {
  bell: Bell,
  wind: Wind,
};

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to Mo' Mitti</h1>
        <p className="text-muted-foreground">Your AI-powered partner in agriculture.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
            {mockNotifications.map((notification) => {
              const Icon = iconMap[notification.icon as keyof typeof iconMap] || Bell;
              return (
                <Alert key={notification.id} variant={notification.type === 'alert' ? 'destructive' : 'default'}>
                  <Icon className="w-4 h-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription>{notification.description}</AlertDescription>
                </Alert>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="hover:border-primary transition-colors">
            <Link href="/chat" className="block">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
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
           <Card className="hover:border-primary transition-colors">
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
