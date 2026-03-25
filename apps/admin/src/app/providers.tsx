"use client";

import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SideNav } from "@/components/SideNav";
import { AnimatePresence } from "framer-motion";
import { DynamicContainer } from "@afc-sear/ui";

const publicPaths = ["/auth/login", "/auth/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isPending && !isPublicPath && !session) {
      router.push("/auth/login");
    }
  }, [isPending, session, isPublicPath, pathname, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <SideNav />
      <main className="relative flex-1 overflow-auto bg-gradient-to-br from-background via-background to-primary/5 p-8 lg:p-12">
        <AnimatePresence mode="wait">
          <DynamicContainer key="admin-content" className="mx-auto max-w-7xl h-full">
            {children}
          </DynamicContainer>
        </AnimatePresence>
      </main>
    </>
  );
}
