import type { Metadata } from "next";
import "./globals.css";

import { SideNav } from "@/components/SideNav";

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
      <body className="flex h-full overflow-hidden bg-white">
        <SideNav />
        <main className="flex-1 overflow-auto bg-gray-50/10 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
