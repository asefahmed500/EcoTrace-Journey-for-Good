'use server';

// In a real application, you would use a library like Nodemailer or an email service provider like SendGrid/Resend.
// For this example, we will just log the email content to the console.

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${domain}/reset-password?token=${token}`;

    console.log("--- SENDING PASSWORD RESET EMAIL (MOCKED) ---");
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your password`);
    console.log(`Body: Click the link to reset your password.`);
    console.log(`\nNOTE: Since this is a demo, you can use this link:`);
    console.log(resetLink);
    console.log("-----------------------------------------------");
    
    // In a real app, you would use an email provider:
    // e.g., await resend.emails.send({ 
    //   from: 'no-reply@ecotrace.com',
    //   to: email,
    //   subject: 'Reset Your EcoTrace Password',
    //   html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    // });
}
