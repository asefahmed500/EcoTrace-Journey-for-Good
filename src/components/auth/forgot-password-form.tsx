"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset, type ForgotPasswordState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';

const initialState: ForgotPasswordState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
        </Button>
    );
}

export function ForgotPasswordForm() {
    const [state, formAction] = useActionState(requestPasswordReset, initialState);

    return (
         <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
                    <CardDescription>
                        No problem. Enter your email and we&apos;ll send you a reset link.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        {state.success && state.message ? (
                            <Alert variant="default" className="bg-primary/5 border-primary/20">
                                <AlertTitle className="text-primary">Check Your Email</AlertTitle>
                                <AlertDescription>
                                    {state.message}
                                </AlertDescription>
                            </Alert>
                        ) : (
                             <div className="space-y-2">
                                <Label htmlFor="email" className="sr-only">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                                {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>}
                                {state.message && !state.fieldErrors && <p className="text-xs text-destructive">{state.message}</p>}
                            </div>
                        )}
                    </CardContent>
                    {!state.success && (
                        <CardFooter className="flex-col gap-4">
                            <SubmitButton />
                            <Button variant="link" asChild>
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </CardFooter>
                    )}
                     {state.success && (
                         <CardFooter>
                             <Button variant="link" asChild className="w-full">
                                <Link href="/login">Back to Login</Link>
                            </Button>
                         </CardFooter>
                    )}
                </form>
            </Card>
        </div>
    )
}
