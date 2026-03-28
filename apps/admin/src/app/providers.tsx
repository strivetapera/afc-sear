"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SideNav } from "@/components/SideNav";
import { DynamicContainer } from "@afc-sear/ui";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  useEffect(() => {
    if (!isPending && !session && !isAuthRoute) {
      window.location.href = "/auth/login";
    }
  }, [isAuthRoute, isPending, session]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isPending || !session) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SideNav />
      <main className="relative flex-1 min-w-0 overflow-auto bg-gradient-to-br from-background via-background to-primary/5 p-8 lg:p-12">
        <DynamicContainer className="mx-auto max-w-7xl h-full">
          {children}
        </DynamicContainer>
      </main>
    </>
  );
}
