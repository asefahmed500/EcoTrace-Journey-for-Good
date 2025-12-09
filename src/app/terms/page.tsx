import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="size-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Terms of Service
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
            </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using the EcoTrace application (the &ldquo;Service&rdquo;) operated by us.</p>

            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

            <h2 className="text-2xl font-semibold text-foreground">2. Use of Service</h2>
            <p>EcoTrace provides a platform for tracking and reducing your carbon footprint. You agree to use the Service only for lawful purposes and in accordance with these Terms.</p>
            <ul>
                <li>You are responsible for safeguarding your account information.</li>
                <li>You must not use the Service to upload or share any content that is illegal, defamatory, or infringes on the rights of others.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">3. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of EcoTrace and its licensors. Our trademarks may not be used in connection with any product or service without our prior written consent.</p>

            <h2 className="text-2xl font-semibold text-foreground">4. Disclaimers</h2>
            <p>The carbon footprint calculations provided by the Service are estimates and should be used for informational purposes only. We rely on third-party data sources and cannot guarantee their absolute accuracy.</p>

            <h2 className="text-2xl font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>In no event shall EcoTrace, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the Service.</p>

            <h2 className="text-2xl font-semibold text-foreground">6. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>
        </div>
      </div>
    </div>
  );
}
