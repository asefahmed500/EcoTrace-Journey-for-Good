import { FileText } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="size-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Cookie Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
            </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>This Cookie Policy explains what cookies are and how we use them on EcoTrace. You should read this policy to understand what types of cookies we use, the information we collect using cookies, and how that information is used.</p>

            <h2 className="text-2xl font-semibold text-foreground">What Are Cookies?</h2>
            <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work or work more efficiently, as well as to provide information to the owners of the site.</p>

            <h2 className="text-2xl font-semibold text-foreground">How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. For example, we use a cookie to maintain your session when you are logged in.</li>
                <li><strong>Functionality Cookies:</strong> We use a cookie to remember the state of your dashboard sidebar (whether it's open or closed) to enhance your user experience on return visits.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">Your Choices Regarding Cookies</h2>
            <p>Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.</p>
            <p>Please note that if you choose to block essential cookies, it may impair or prevent your ability to use our services.</p>
        </div>
      </div>
    </div>
  );
}
