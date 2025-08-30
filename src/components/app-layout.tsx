
'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  FileDown,
  LayoutDashboard,
  User,
  Store,
  List,
  Users,
  Settings,
  BookText,
  Instagram,
  Facebook,
  Calendar,
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
  useSidebar,
} from '@/components/ui/sidebar';
import { currentUser } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/volunteers', icon: Users, label: 'Volunteers' },
  { href: '/reports', icon: FileDown, label: 'Reports' },
  { href: '/summary', icon: BrainCircuit, label: 'AI Summary' },
  { href: '/store', icon: Store, label: 'Store' },
  { href: '/transactions', icon: List, label: 'Transactions' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: 'https://www.offthechainak.org/wordpress/sample-page/hours/#:~:text=info%20see%20the-,Volunteer%20Handbook,-Proudly%20powered%20by', icon: BookText, label: 'Handbook', external: true },
];

const OffTheChainLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-6 text-primary"
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        opacity="0.3"
      />
      <path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm4.62 10.38l-1.41-1.41L12 11.35l-3.21 2.12 1.41-1.41-2.12-2.12 1.41-1.41 2.12 2.12 3.21-2.12-1.41 1.41 2.12 2.12z" />
      <path d="M12,9c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S13.1,9,12,9z" />
      <path d="M15.5 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      <path d="M12 14.5c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z" />
    </svg>
  );

function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
              <OffTheChainLogo />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline tracking-tight uppercase">
                Off the Chain
              </h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href} onClick={() => setOpenMobile(false)}>
                <Link href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
                  <SidebarMenuButton
                    isActive={pathname === item.href && !item.external}
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
          <div className="flex items-center justify-center gap-2 mt-4">
            <a href="https://www.instagram.com/offthechainak/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                    <Instagram className="h-5 w-5" />
                </Button>
            </a>
            <a href="https://www.facebook.com/offthechainak" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                    <Facebook className="h-5 w-5" />
                </Button>
            </a>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card/50 px-6 md:hidden">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold font-headline">Off the Chain</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}


export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
