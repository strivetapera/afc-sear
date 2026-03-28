"use client";

import {
  Button,
  GradientText,
  GlassCard,
  CardTitle,
  DynamicContainer,
} from "@afc-sear/ui";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  ChevronRight,
  Compass,
  PlayCircle,
  Star,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const MotionDiv = motion.div as any;

const defaultHomeContent = {
  hero: {
    eyebrow: "Welcome",
    title: "APOSTOLIC FAITH MISSION",
    tagline: "Southern & Eastern Africa",
    welcomeMessage: "Welcome home to worship, Word, and fellowship.",
    welcomeLead:
      "This website provides access to church information, live webcast, news, and public events in Southern & Eastern Africa.",
    imageAlt: "Sacred Sanctuary",
  },
  aboutSection: {
    title: "About",
    paragraphs: [
      "The Apostolic Faith Mission Southern & Eastern Africa is a Bible-centered Christian fellowship dedicated to spreading the Gospel of Jesus Christ and fostering true spiritual restoration.",
    ],
    cta: {
      href: "/about",
      label: "Our Mission & Story",
    },
  },
};

export function HomePageClient({ content }: { content?: any }) {
  const adminLoginUrl = `${(process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001").replace(/\/$/, "")}/auth/login`;
  const memberLoginUrl = `${(process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002").replace(/\/$/, "")}/login`;
  const homeContent = content ?? defaultHomeContent;
  const hero = homeContent.hero ?? defaultHomeContent.hero;
  const aboutSection = homeContent.aboutSection ?? defaultHomeContent.aboutSection;
  const heroEyebrow = "Welcome";
  const welcomeMessage =
    hero.welcomeMessage ??
    "Welcome home to worship, Word, and fellowship.";
  const welcomeLead =
    hero.welcomeLead ??
    aboutSection.paragraphs?.[0] ??
    defaultHomeContent.hero.welcomeLead;
  const organizationName = hero.organizationName ?? "APOSTOLIC FAITH MISSION";
  const regionName = hero.regionName ?? "Southern & Eastern Africa";
  const primaryHeroAction = hero.primaryAction ?? {
    label: "Join a Service",
    href: "/live-webcast",
  };
  const secondaryHeroAction = hero.secondaryAction ?? aboutSection.cta ?? {
    label: "About",
    href: "/about",
  };
  const engagementCards = [
    {
      title: "About",
      icon: Compass,
      desc: "Read about the mission, heritage, and foundations of the church.",
      href: "/about",
      cta: "Open About",
    },
    {
      title: "Live Webcast",
      icon: PlayCircle,
      desc: "Access live services and public worship broadcasts online.",
      href: "/live-webcast",
      cta: "Open Webcast",
    },
    {
      title: "Events",
      icon: Calendar,
      desc: "View upcoming public events, conferences, and gatherings.",
      href: "/events",
      cta: "View Events",
    },
  ];
  const quickPulseCards = [
    {
      title: "Live Webcast",
      value: "Live services",
      detail: "Streaming access for services and special gatherings.",
      href: "/live-webcast",
      icon: PlayCircle,
    },
    {
      title: "News",
      value: "Published updates",
      detail: "Published reports, notices, and stories from across the region.",
      href: "/news",
      icon: BellRing,
    },
    {
      title: "Events",
      value: "Upcoming gatherings",
      detail: "Conferences, camp meetings, and other public events.",
      href: "/events",
      icon: Calendar,
    },
  ];

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-28 md:pb-24 md:pt-36">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/church-hero.jpg"
            alt={hero.imageAlt || "Sacred Sanctuary"}
            fill
            className="object-cover scale-110 hero-image-drift"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,221,87,0.28),_transparent_26%),linear-gradient(135deg,rgba(14,20,30,0.92),rgba(31,39,56,0.72)_45%,rgba(143,29,47,0.48)_100%)]" />
          <div className="hero-orb hero-orb-primary" />
          <div className="hero-orb hero-orb-accent" />
          <div className="hero-grid absolute inset-0 opacity-30" />
        </div>

        <DynamicContainer className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center xl:gap-16 xl:grid-cols-[minmax(0,1.05fr)_460px]">
          <div className="max-w-3xl space-y-8">
            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 backdrop-blur-md"
            >
              <Star className="h-3 w-3 text-accent animate-pulse" />
              {heroEyebrow}
            </MotionDiv>

            <div className="space-y-6">
              <MotionDiv
                initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08 }}
              className="space-y-5"
            >
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.38em] text-white/55">
                    {organizationName}
                  </p>
                  <p className="text-sm font-semibold tracking-[0.28em] text-accent/90 uppercase">
                    {regionName}
                  </p>
                </div>
                <h1 className="heading-premium text-balance text-5xl font-black leading-[0.92] tracking-[-0.04em] text-white md:text-6xl xl:text-7xl">
                  <GradientText className="block">{welcomeMessage}</GradientText>
                </h1>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.16 }}
                className="premium-glass inline-flex max-w-2xl rounded-[2rem] p-1"
              >
                <div className="rounded-[calc(2rem-1px)] border border-white/10 bg-black/25 px-6 py-5 backdrop-blur-xl">
                  <p className="text-base font-medium leading-8 text-white/78 md:text-lg">
                    {welcomeLead}
                  </p>
                </div>
              </MotionDiv>
            </div>

            <MotionDiv
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.32 }}
              className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Link href={primaryHeroAction.href || "/live-webcast"}>
                <Button
                  variant="gold"
                  size="lg"
                  className="h-16 w-full rounded-2xl px-10 text-lg font-black tracking-tight shadow-2xl sm:w-auto"
                >
                  {primaryHeroAction.label || "Join a Service"}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href={secondaryHeroAction.href || "/about"}>
                <Button
                  variant="glass"
                  size="lg"
                  className="h-16 w-full rounded-2xl border-white/10 px-10 text-lg font-bold text-white sm:w-auto"
                >
                  {secondaryHeroAction.label || "About"}
                </Button>
              </Link>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="flex flex-col gap-3"
            >
              <p className="text-xs font-black uppercase tracking-[0.32em] text-white/55">
                Portal Login
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={memberLoginUrl}
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-accent/45 hover:bg-white/14"
                >
                  Member Portal Login
                </a>
                <a
                  href={adminLoginUrl}
                  className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-accent/45 hover:bg-white/14"
                >
                  Admin Portal Login
                </a>
              </div>
            </MotionDiv>
          </div>

          <MotionDiv
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="relative mx-auto w-full max-w-xl lg:ml-auto"
          >
            <GlassCard className="overflow-hidden border-white/10 bg-white/6 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.75)]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div>
                    <h2 className="mt-3 text-2xl font-black tracking-tight heading-premium md:text-3xl">
                      Public website sections
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Use these links to access the main public areas of the website.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {quickPulseCards.map((card, index) => (
                    <MotionDiv
                      key={card.title}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.35 + index * 0.1 }}
                    >
                      <Link
                        href={card.href}
                        className="group flex items-start gap-4 rounded-3xl border border-border/70 bg-background/70 px-5 py-5 transition-all hover:-translate-y-1 hover:border-primary/35 hover:bg-background"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <card.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
                            {card.title}
                          </p>
                          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                            {card.value}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {card.detail}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                      </Link>
                    </MotionDiv>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-primary/10 bg-primary/[0.06] px-5 py-4">
                  <p className="mt-2 text-base font-semibold leading-7 text-foreground">
                    {organizationName} serves congregations across {regionName}, connecting people to worship, news, events, and gospel resources from one place.
                  </p>
                </div>
              </div>
            </GlassCard>
          </MotionDiv>
        </DynamicContainer>
      </section>

      <section className="relative bg-background px-6 py-32">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight heading-premium">
              About
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {aboutSection.paragraphs?.[1] || aboutSection.paragraphs?.[0]}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {engagementCards.map((card, i) => (
              <GlassCard
                key={i}
                className="group relative overflow-hidden transition-all hover:scale-[1.02] cursor-default"
              >
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">{card.title}</CardTitle>
                    <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
                  </div>
                  <Link
                    href={card.href}
                    className="inline-flex items-center text-primary font-bold text-sm tracking-tight group-hover:gap-2 transition-all"
                  >
                    {card.cta} <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
