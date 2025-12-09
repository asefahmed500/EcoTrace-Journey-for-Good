
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed NextAuth signIn import
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { registerUser, type RegisterState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { signInWithGoogle } from '@/lib/google-auth';

const initialRegisterState: RegisterState = { success: false, message: '' };

function CredentialsSubmitButton({ text, ...props }: { text: string } & React.ComponentProps<typeof Button>) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending} {...props}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {text}
        </Button>
    );
}

function RegisterForm({ setFormType }: { setFormType: (type: 'login' | 'register') => void }) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(registerUser, initialRegisterState);

    useEffect(() => {
        if (state.success) {
            toast({
                title: "Registration Successful",
                description: state.message,
            });
            // Switch to login form after successful registration
            setFormType('login');
        } else if (state.message && !state.fieldErrors) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: state.message,
            });
        }
    }, [state, toast, router, setFormType]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
                {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
                {state.fieldErrors?.password && <p className="text-xs text-destructive">{state.fieldErrors.password}</p>}
            </div>
            <CredentialsSubmitButton text="Create Account" />
        </form>
    )
}

function CredentialsLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Show error toast if redirected from a failed login
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'CredentialsSignin') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
        } else if (error === 'OAuthSignin') {
            toast({
                variant: 'destructive',
                title: 'Google Sign-in Failed',
                description: 'There was an error initiating Google sign-in. Please try again.',
            });
        } else if (error === 'OAuthCallback') {
            toast({
                variant: 'destructive',
                title: 'Google Sign-in Failed',
                description: 'There was an error processing Google sign-in. Please try again.',
            });
        } else if (error === 'OAuthCreateAccount') {
            toast({
                variant: 'destructive',
                title: 'Account Creation Failed',
                description: 'Unable to create account with Google. Please try again.',
            });
        }
    }, [searchParams, toast]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
                window.location.href = callbackUrl;
            } else {
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: result.error || "Invalid email or password. Please try again.",
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            toast({
                variant: "destructive",
                title: "Login Error",
                description: "An unexpected error occurred. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" name="email" type="email" placeholder="john.doe@example.com" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="login-password">Password</Label>
                    <Link href="/forgot-password" passHref>
                         <Button variant="link" className="px-0 h-auto text-xs">Forgot password?</Button>
                    </Link>
                </div>
                <Input id="login-password" name="password" type="password" required disabled={isLoading} />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
            </Button>
        </form>
    );
}

export function LoginForm() {
    const [formType, setFormType] = useState<'login' | 'register'>('login');
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const handleSwitch = () => {
        setFormType(prev => prev === 'login' ? 'register' : 'login');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm mx-auto">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">
                        {formType === 'login' ? 'Welcome to EcoTrace' : 'Create an Account'}
                    </CardTitle>
                    <CardDescription>
                        {formType === 'login' ? 'Sign in to continue to your dashboard' : 'Enter your details to get started'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {formType === 'login' ? <CredentialsLoginForm /> : <RegisterForm setFormType={setFormType} />}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
                            signInWithGoogle(callbackUrl);
                        }}
                    >
                       <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.5l-63.6 62.4C325.5 94.6 289.3 80 248 80c-82.6 0-150.2 67.5-150.2 150.5S165.4 406.5 248 406.5c95.2 0 131.3-81.5 133.7-124.2H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                       Sign in with Google
                    </Button>


                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="link" onClick={handleSwitch}>
                        {formType === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
