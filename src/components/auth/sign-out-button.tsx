'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SignOut({ children, className }: { children: React.ReactNode, className?: string }) {
    const router = useRouter();
    
    const handleSignOut = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <button onClick={handleSignOut} className={cn("w-full text-left flex items-center", className)}>
            {children}
        </button>
    );
}
