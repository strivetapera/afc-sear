"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

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

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50/40">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-blue-600">
          <span className="h-6 w-6 rounded bg-blue-600" />
          <span>AFC Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600 ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:text-red-600">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
