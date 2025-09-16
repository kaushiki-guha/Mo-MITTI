'use client';

import {SidebarTrigger} from '@/components/ui/sidebar';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-semibold text-lg md:text-xl">Dashboard</h1>
      </div>
    </header>
  );
}
