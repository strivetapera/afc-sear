import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { PublicSiteFooter, PublicSiteHeader } from "@/components/PublicSiteChrome";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APOSTOLIC FAITH MISSION Southern & Eastern Africa",
  description: "Official platform of the Apostolic Faith Mission Southern & Eastern Africa for worship, public updates, regional events, and live ministry access.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AFM SEA",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#8f1d2f" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2738" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground selection:bg-primary/20">
        <ThemeProvider>
          <PublicSiteHeader />
          <div className="flex-1">{children}</div>
          <PublicSiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
