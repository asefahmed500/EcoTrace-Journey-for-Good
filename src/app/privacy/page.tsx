import { FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="size-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
            </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>Welcome to EcoTrace. We are committed to protecting your privacy and handling your data in an open and transparent manner. This privacy policy explains how we collect, use, and share your information.</p>

            <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, log journeys, or contact us for support. This includes:</p>
            <ul>
                <li><strong>Account Information:</strong> Your name, email address, and password.</li>
                <li><strong>Journey Data:</strong> Origin, destination, mode of transport, and vehicle type. This data is used to calculate your carbon footprint.</li>
                <li><strong>User Preferences:</strong> Information you provide about your travel habits and environmental priorities to personalize your experience.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>We use your information to operate and improve our services. This includes:</p>
            <ul>
                <li>Calculating and tracking your carbon footprint.</li>
                <li>Providing personalized route suggestions and analytics.</li>
                <li>Operating community features like leaderboards and challenges.</li>
                <li>Communicating with you about your account and our services.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share information in the following circumstances:</p>
            <ul>
                <li>With your consent or at your direction.</li>
                <li>For community features, where your name and total emissions may be visible on leaderboards. You can control this in your profile settings.</li>
                <li>With third-party service providers who perform services on our behalf, such as Google Maps for routing.</li>
                <li>For legal reasons, such as to comply with a subpoena or other legal process.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground">4. Your Rights and Choices</h2>
            <p>You have rights over your personal data. You can access, update, or delete your data at any time from your account settings. You can also request an export of your data.</p>
        </div>
      </div>
    </div>
  );
}
