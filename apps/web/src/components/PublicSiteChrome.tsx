'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Grid2x2Plus, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

const coreNavItems = [
  { href: '/', label: 'Home' },
  { href: '/live-webcast', label: 'Live Webcast' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
];

const additionalNavItems = [
  { href: '/library/this-weeks-lessons', label: "This Week's Lessons" },
  { href: '/bible-study-materials', label: 'Bible Study Materials' },
  { href: '/testimonies', label: 'Testimonies' },
  { href: '/music', label: 'Music' },
  { href: '/sermons-archive', label: 'Sermons Archive' },
];

const footerNavItems = [...coreNavItems, ...additionalNavItems];

function isActive(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicSiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { mounted, theme, toggleTheme } = useTheme();
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-5" onClick={() => setIsOpen(false)}>
          <div className="relative -my-5 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-transparent shadow-[0_18px_42px_-24px_rgba(130,22,39,0.7)] md:-my-7 md:h-24 md:w-24">
            <div className="absolute inset-[6px] rounded-full border border-accent/35" />
            <Image
              src="/images/jesus-light.png"
              alt="Apostolic Faith Mission logo"
              width={72}
              height={72}
              className="relative h-16 w-16 object-contain drop-shadow-[0_10px_20px_rgba(15,23,42,0.18)] md:h-20 md:w-20"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-black uppercase tracking-[0.28em] text-primary md:text-xs">
              APOSTOLIC FAITH MISSION
            </div>
            <div className="truncate text-xs font-semibold text-foreground md:text-sm">
              Southern &amp; Eastern Africa
            </div>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
          <nav className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-2 py-2 shadow-[0_14px_32px_-24px_rgba(17,24,39,0.55)]">
          {coreNavItems.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                aria-expanded={isMoreOpen}
                aria-label="Open more website sections"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  additionalNavItems.some((item) => isActive(pathname, item.href))
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                onClick={() => setIsMoreOpen((value) => !value)}
              >
                <Grid2x2Plus className="h-4 w-4" />
                More
                <ChevronDown className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-3xl border border-border/80 bg-card/95 p-3 shadow-[0_28px_60px_-30px_rgba(17,24,39,0.55)] backdrop-blur-xl">
                  <div className="mb-2 px-3 pb-2 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-primary">
                      More Sections
                    </p>
                  </div>
                  <div className="space-y-1">
                    {additionalNavItems.map((item) => {
                      const active = isActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-secondary'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/30 hover:bg-primary hover:text-primary-foreground"
            aria-label={mounted && theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
          >
            {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/30 hover:bg-primary hover:text-primary-foreground"
            aria-label={mounted && theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
          >
            {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-border/70 bg-card/70 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {coreNavItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/80 text-foreground hover:bg-secondary'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              className="mt-2 flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground"
              aria-expanded={isMoreOpen}
              aria-label="Toggle more website sections"
              onClick={() => setIsMoreOpen((value) => !value)}
            >
              <span className="inline-flex items-center gap-2">
                <Grid2x2Plus className="h-4 w-4 text-primary" />
                More Sections
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen ? (
              <div className="mt-1 flex flex-col gap-2 rounded-3xl border border-border/70 bg-background/60 p-2">
                {additionalNavItems.map((item) => {
                  const active = isActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/80 text-foreground hover:bg-secondary'
                      }`}
                      onClick={() => {
                        setIsOpen(false);
                        setIsMoreOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function PublicSiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/10 bg-card shadow-[0_12px_30px_-18px_rgba(130,22,39,0.8)]">
              <Image src="/images/jesus-light.png" alt="Apostolic Faith Mission logo" width={56} height={56} className="h-12 w-12 object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">APOSTOLIC FAITH MISSION</p>
              <p className="text-xs font-semibold text-foreground">Southern &amp; Eastern Africa</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Public website for worship, updates, and regional events.
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Explore church information, published updates, live webcast access, and public events
            from the Apostolic Faith Mission Southern &amp; Eastern Africa.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {footerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
