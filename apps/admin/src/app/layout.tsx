import type { Metadata } from "next";
import "./globals.css";

import { SideNav } from "@/components/SideNav";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "AFC Admin Portal",
  description: "Apostolic Faith Church Platform Administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex h-full overflow-hidden bg-background text-foreground">
        <ThemeProvider>
          <SideNav />
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
