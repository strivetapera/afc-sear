import Link from "next/link";
import { Bell, Building2, DollarSign, Radio, ShieldCheck, Users } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@afc-sear/ui";

const settingSections = [
  {
    title: "Identity & Access",
    description: "Review administrator roles, member access, and authentication-related tools.",
    href: "/users",
    icon: ShieldCheck,
    cta: "Open Members",
  },
  {
    title: "Branch Directory",
    description: "Keep locations and branch contact details aligned across the platform.",
    href: "/branches",
    icon: Building2,
    cta: "Open Branches",
  },
  {
    title: "Communications",
    description: "Manage announcements, campaigns, and message delivery from one place.",
    href: "/communications",
    icon: Bell,
    cta: "Open Communications",
  },
  {
    title: "Live Webcast Operations",
    description: "Update church livestream and webcast-related public content from the content manager.",
    href: "/content",
    icon: Radio,
    cta: "Open Content",
  },
  {
    title: "People & Membership",
    description: "Review people records and member-facing directory information.",
    href: "/people",
    icon: Users,
    cta: "Open People",
  },
  {
    title: "Finance Controls",
    description: "View funds, payments, and giving activity in the finance workspace.",
    href: "/finance",
    icon: DollarSign,
    cta: "Open Finance",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Use this page as the operations hub for platform configuration. Each area below links to the existing
          administrative surface where that capability is currently managed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {settingSections.map((section) => (
          <Card key={section.title} className="h-full">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <Link href={section.href}>
                <Button variant="outline" className="w-full">
                  {section.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
