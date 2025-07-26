import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, BookOpen, LifeBuoy, Terminal, Newspaper, User, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SignOut } from "@/components/auth/sign-out-button";

export async function SiteHeader() {
  const session = await auth();

  const navigationItems = [
    { title: 'Features', href: '/features' },
    { title: 'How It Works', href: '/how-it-works' },
    { title: 'Community', href: '/community' },
    { title: 'Pricing', href: '/pricing' },
    {
      title: 'Resources',
      subItems: [
        { title: 'Learn', href: '/learn', icon: <BookOpen className="size-4" /> },
        { title: 'Support', href: '/support', icon: <LifeBuoy className="size-4" /> },
        { title: 'API Docs', href: '/docs', icon: <Terminal className="size-4" /> },
        { title: 'Blog', href: '/blog', icon: <Newspaper className="size-4" /> },
      ]
    },
  ];

  const mobileNavLinks = [
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Community", href: "/community" },
    { label: "Pricing", href: "/pricing" },
    { label: "Learn", href: "/learn" },
    { label: "Support", href: "/support" },
    { label: "API Docs", href: "/docs" },
    { label: "Blog", href: "/blog" },
  ];

  const renderAuthButtons = () => {
    if (session?.user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/profile/${session.user.id}`}><User className="mr-2 h-4 w-4"/>My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <SignOut>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </SignOut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/login">Sign Up</Link>
        </Button>
      </>
    );
  };

  const renderMobileAuthButtons = () => {
    if (session?.user) {
      return (
        <div className="border-t pt-4">
             <div className="flex items-center gap-3 px-6 mb-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                    <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
            </div>
            <Link href="/dashboard" className="block w-full text-left p-4 px-6 text-lg font-medium text-foreground/80 hover:text-foreground">Dashboard</Link>
            <Link href={`/profile/${session.user.id}`} className="block w-full text-left p-4 px-6 text-lg font-medium text-foreground/80 hover:text-foreground">My Profile</Link>
            <div className="p-4 px-6">
                <Button className="w-full" asChild>
                    <SignOut>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </SignOut>
                </Button>
            </div>
        </div>
      )
    }
    return (
        <div className="flex flex-col gap-2 border-t pt-4 px-6">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign Up</Link>
            </Button>
        </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">EcoTrace</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navigationItems.map((item) => (
            item.subItems ? (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="group flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground/80 focus-visible:ring-0">
                    {item.title}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.href && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={item.href} className="font-semibold">Overview</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {item.subItems.map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link href={subItem.href} className="flex items-center gap-2">
                        {subItem.icon}
                        {subItem.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground/60 transition-colors hover:text-foreground/80 px-3 py-2"
              >
                {item.title}
              </Link>
            )
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {renderAuthButtons()}
          </div>
        
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle>
                     <Link href="/" className="flex items-center space-x-2">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="font-bold">EcoTrace</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex h-full flex-col justify-between mt-8">
                  <div className="flex flex-col gap-4 px-6">
                    {mobileNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-auto">
                    {renderMobileAuthButtons()}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
