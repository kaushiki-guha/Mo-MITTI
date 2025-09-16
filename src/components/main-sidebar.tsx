'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {Bot, Home, Stethoscope} from 'lucide-react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';

export function MainSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/chat',
      label: 'AI Crop Guidance',
      icon: Bot,
    },
    {
      href: '/disease-detection',
      label: 'Disease Detection',
      icon: Stethoscope,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-sidebar-primary-foreground">Mo&apos; Mitti</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{children: item.label}}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="text-xs text-center text-sidebar-foreground/50 p-4">
            &copy; 2024 Mo&apos; Mitti
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
