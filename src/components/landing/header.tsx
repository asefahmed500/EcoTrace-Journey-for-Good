"use client";

import { useSession } from "@/lib/auth-context";
import { HeaderClient } from "./header-client";

export function SiteHeader() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-muted animate-pulse rounded" />
            <div className="hidden sm:block h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </header>
    );
  }

  return <HeaderClient session={session} />;
}
