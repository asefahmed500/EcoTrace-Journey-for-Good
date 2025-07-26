
import { auth } from '@/auth';
import { getAuthenticatedUserData } from '@/app/actions';
import { Header } from '@/components/layout/header';
import { Logo } from '@/components/icons/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignOut } from '@/components/auth/sign-out-button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, Users, Home, LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // This should be handled by middleware, but as a fallback.
    redirect('/login');
  }
  const { team } = await getAuthenticatedUserData();

  return (
    <div className="dark">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo className="size-8 text-primary" />
              <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">EcoTrace</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
             {/* Navigation items can be added here if the app grows */}
          </SidebarContent>
          <SidebarFooter className="p-4 flex flex-col gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto">
                  <Avatar className="size-8">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                    <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">{session.user.name ?? 'Guest User'}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user.id}`}><User className="mr-2 h-4 w-4" />View Profile</Link>
                </DropdownMenuItem>
                {team && (
                  <DropdownMenuItem asChild>
                    <Link href={`/team/${team.id}`}><Users className="mr-2 h-4 w-4" />Team Dashboard</Link>
                  </DropdownMenuItem>
                )}
                 <DropdownMenuItem asChild>
                    <Link href="/"><Home className="mr-2 h-4 w-4" />Homepage</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <SignOut>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </SignOut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
