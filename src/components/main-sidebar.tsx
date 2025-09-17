
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
import {Home, Stethoscope, User, ClipboardList} from 'lucide-react';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import { Logo } from './logo';
import { Mascot } from './mascot';

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
      icon: Mascot,
    },
    {
      href: '/disease-detection',
      label: 'Disease Detection',
      icon: Stethoscope,
    },
    {
        href: '/farm-details',
        label: 'Farm Details',
        icon: ClipboardList,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        {/* The logo is now in the site header */}
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
            &copy; 2024 Mo'MITTI
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
