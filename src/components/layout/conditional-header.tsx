"use client";

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/landing/header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show the landing header on dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/team') || pathname.startsWith('/profile')) {
    return null;
  }
  
  return <SiteHeader />;
}