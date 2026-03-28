"use client";

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Button,
  GradientText,
  Badge,
  GlassCard
} from '@afc-sear/ui';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowUpRight, 
  Calendar,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';

interface DashboardStats {
  totalMembers: number;
  contentItems: number;
  upcomingEvents: number;
  systemHealth: number;
}

interface RecentActivity {
  id: string;
  action: string;
  domain: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actorUser?: { email: string };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    contentItems: 0,
    upcomingEvents: 0,
    systemHealth: 99.9,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [people, content, events] = await Promise.allSettled([
          fetchApi('/admin/people'),
          fetchApi('/admin/content-items'),
          fetchApi('/admin/events'),
        ]);

        const memberCount = people.status === 'fulfilled' ? (people.value.meta?.count ?? 0) : 0;
        const contentCount = content.status === 'fulfilled' ? (content.value.meta?.count ?? 0) : 0;
        const eventCount = events.status === 'fulfilled' ? (events.value.data?.length ?? 0) : 0;

        setStats({
          totalMembers: memberCount,
          contentItems: contentCount,
          upcomingEvents: eventCount,
          systemHealth: 99.9,
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const dashboardStats = [
    { 
      title: 'Total Members', 
      value: loading ? '...' : stats.totalMembers.toLocaleString(), 
      change: '+12%', 
      icon: Users, 
      variant: 'default' as const 
    },
    { 
      title: 'Content Items', 
      value: loading ? '...' : stats.contentItems.toLocaleString(), 
      change: '+5%', 
      icon: FileText, 
      variant: 'gold' as const 
    },
    { 
      title: 'Events', 
      value: loading ? '...' : stats.upcomingEvents.toString(), 
      change: 'Active', 
      icon: Calendar, 
      variant: 'success' as const 
    },
    { 
      title: 'System Health', 
      value: `${stats.systemHealth}%`, 
      change: 'Optimal', 
      icon: Zap, 
      variant: 'premium' as const 
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">System Overview</h4>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight heading-premium">
            <GradientText>Welcome Back,</GradientText> Admin
          </h1>
          <p className="text-muted-foreground max-w-md">
            Manage your ministry&apos;s digital footprint with premium administrative tools and data insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shadow-sm">
            Generate Report
          </Button>
          <Link href="/events/new">
            <Button variant="primary" className="shadow-lg">
              <PlusCircle className="h-4.5 w-4.5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hoverable className="p-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="p-2 rounded-lg bg-primary/5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant={stat.variant}>{stat.change}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</div>
                  <div className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </h3>
            <Link href="/events" className="text-sm text-primary font-bold hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Manage Events', desc: 'View & edit events', icon: Calendar, href: '/events' },
              { label: 'People Directory', desc: 'Member management', icon: Users, href: '/people' },
              { label: 'Content Manager', desc: 'Pages & news', icon: FileText, href: '/content' },
              { label: 'Communications', desc: 'Announcements', icon: CheckCircle, href: '/communications' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <GlassCard className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <action.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.desc}</div>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-2">
            <ArrowUpRight className="h-5 w-5 text-accent" />
            Quick Links
          </h3>
          <Card className="p-6 space-y-4 shadow-xl">
            <div className="space-y-3">
              {[
                { label: 'Update Webcast Link', desc: 'Sync live stream URL', href: '/communications' },
                { label: 'Push Notification', desc: 'Notify via mobile app', href: '/communications?tab=announcements' },
                { label: 'Verify Registrations', desc: 'Process pending events', href: '/events' },
              ].map((action) => (
                <Link 
                  key={action.label}
                  href={action.href}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-muted transition-all group text-left"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold tracking-tight">{action.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{action.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-primary p-6 text-primary-foreground relative overflow-hidden group shadow-2xl">
            <div className="relative z-10 space-y-4">
              <h4 className="text-lg font-bold">Ministry Insights</h4>
              <p className="text-sm opacity-80">Unlock advanced analytics, member forecasting, and automated communications.</p>
              <Button variant="glass" className="w-full font-bold">
                Coming Soon
              </Button>
            </div>
            <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>
      </div>
    </div>
  );
}
