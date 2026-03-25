"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutDashboard,
  Users,
  FileText,
  MapPin,
  Settings,
  LogOut,
  Calendar,
  BookOpen,
  Megaphone,
  DollarSign,
  UserSearch,
  Sun,
  Moon,
} from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Content Items', href: '/content', icon: FileText },
  { name: 'Lessons', href: '/lessons', icon: BookOpen },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'People', href: '/people', icon: UserSearch },
  { name: 'Communications', href: '/communications', icon: Megaphone },
  { name: 'Finance', href: '/finance', icon: DollarSign },
  { name: 'Members & Users', href: '/users', icon: Users },
  { name: 'Branches', href: '/branches', icon: MapPin },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/auth/login');
        },
      },
    });
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar-bg">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span className="h-6 w-6 rounded bg-primary" />
          <span className="text-foreground">AFC Admin</span>
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-sidebar-active-bg text-sidebar-active-text font-semibold'
                    : 'text-muted-foreground hover:bg-sidebar-hover hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer actions */}
      <div className="border-t border-sidebar-border p-4 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>

        {/* Sign out */}
        <button 
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-hover hover:text-destructive"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
