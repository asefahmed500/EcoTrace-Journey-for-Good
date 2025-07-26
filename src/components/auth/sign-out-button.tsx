'use client';

import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export function SignOut({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <button onClick={() => signOut({ callbackUrl: '/' })} className={cn("w-full text-left flex items-center", className)}>
            {children}
        </button>
    );
}
