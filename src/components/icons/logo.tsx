import React from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6", className)}
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10c.83 0 1.64-.1 2.42-.29" />
      <path d="M13 4a7 7 0 0 1 7 7v2h2a10 10 0 0 0-10-10c-.83 0-1.64.1-2.42.29" />
      <path d="M4 13a4 4 0 0 1 4-4" />
      <path d="M13 4a4 4 0 0 1 4 4" />
    </svg>
  );
}
