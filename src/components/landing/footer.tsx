import Link from "next/link";
import { Logo } from "@/components/icons/logo";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-bold">EcoTrace</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Turn every journey into climate action.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
            <div>
              <h4 className="font-medium">Product</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
                <li><Link href="/support" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link href="/community" className="text-muted-foreground hover:text-foreground">Community</Link></li>
                 <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
                <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookies</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EcoTrace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
