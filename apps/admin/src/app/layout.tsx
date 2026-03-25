import type { Metadata } from "next";
import "./globals.css";

import { SideNav } from "@/components/SideNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DynamicContainer } from "@afc-sear/ui";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./providers";

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
    <html lang="en" className="h-full antialiased">
      <body className="flex h-full overflow-hidden bg-background text-foreground transition-colors duration-500">
        <AuthProvider>
          <ThemeProvider>
            <div className="flex h-full w-full">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
