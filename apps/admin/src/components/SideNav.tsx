"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
} from 'lucide-react';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const navGroups = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Ministry',
    items: [
      { name: 'Content', href: '/content', icon: FileText },
      { name: 'Lessons', href: '/lessons', icon: BookOpen },
      { name: 'Events', href: '/events', icon: Calendar },
    ]
  },
  {
    label: 'Community',
    items: [
      { name: 'People', href: '/people', icon: UserSearch },
      { name: 'Communications', href: '/communications', icon: Megaphone },
      { name: 'Members', href: '/users', icon: Users },
    ]
  },
  {
    label: 'Foundation',
    items: [
      { name: 'Finance', href: '/finance', icon: DollarSign },
      { name: 'Branches', href: '/branches', icon: MapPin },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
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
    <div className="group/sidebar flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar-bg text-sidebar-foreground shadow-2xl transition-all">
      {/* Premium Logo Section */}
      <div className="relative flex h-20 items-center px-6 overflow-hidden">
        <Link href="/dashboard" className="z-10 flex items-center gap-4">
          <div className="relative flex h-11 w-11 items-center justify-center transition-transform hover:scale-105 active:scale-95 overflow-hidden">
             <img 
                src="/images/jesus-light.png" 
                alt="Logo" 
                className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-none tracking-tight text-white uppercase">APOSTOLIC FAITH MISSION</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary/80">Southern & Eastern Africa Region</span>
          </div>
        </Link>
        {/* Subtle background glow */}
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-auto custom-scrollbar px-4 py-6 space-y-8">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/30">
              {group.label}
            </h4>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 ${
                      isActive
                        ? 'text-white'
                        : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 z-0 rounded-xl bg-primary shadow-lg shadow-primary/40"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={`relative z-10 h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                    <span className="relative z-10 font-medium tracking-tight">{item.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative z-10 ml-auto"
                      >
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Premium Footer actions */}
      <div className="mt-auto border-t border-sidebar-border/30 bg-sidebar-bg/50 p-4 backdrop-blur-md">
        <div className="rounded-2xl bg-white/5 p-2 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all hover:bg-white/5 hover:text-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-white/10">
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </div>
            <span className="flex-1 text-left">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all hover:bg-white/5 hover:text-destructive-foreground focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors group-hover:bg-destructive/20">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left tracking-tight">Sign Out</span>
          </button>
        </div>
        
        <div className="mt-4 px-4">
          <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">System Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
