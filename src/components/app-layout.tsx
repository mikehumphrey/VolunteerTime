'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  FileDown,
  LayoutDashboard,
  User,
  Handshake,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { currentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/reports', icon: FileDown, label: 'Reports' },
  { href: '/summary', icon: BrainCircuit, label: 'AI Summary' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
              <Handshake className="size-6" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline tracking-tight">
                VolunteerTime
              </h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
             <Avatar>
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{currentUser.name}</span>
              <span className="text-xs text-muted-foreground">{currentUser.email}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card/50 px-6 md:hidden">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold font-headline">VolunteerTime</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
