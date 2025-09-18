
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from './logo';
import Link from 'next/link';

export function SiteHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 transition-all duration-300 md:px-6 data-[scrolled=true]:shadow-md">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link href="/" className="flex items-center gap-2 group">
          <Logo className="text-[hsl(var(--primary))] transition-all duration-300 group-hover:[filter:drop-shadow(0_0_4px_hsl(var(--primary)/0.7))]" />
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.email?.[0].toUpperCase() ?? <User />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
