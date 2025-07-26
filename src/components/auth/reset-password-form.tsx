"use client";

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { resetPassword, type ResetPasswordState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';

const initialState: ResetPasswordState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
        </Button>
    );
}

export function ResetPasswordForm({ token }: { token: string }) {
    const [state, formAction] = useFormState(resetPassword, initialState);

    useEffect(() => {
        if (token.length === 0 && !state.message) {
             state.message = "No reset token provided. Please request a new link.";
        }
    }, [token, state]);

    return (
         <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                     <input type="hidden" name="token" value={token} />
                    <CardContent className="space-y-4">
                        {state.success ? (
                             <Alert variant="default" className="bg-primary/5 border-primary/20">
                                <AlertTitle className="text-primary">Success!</AlertTitle>
                                <AlertDescription>
                                    {state.message}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="sr-only">New Password</Label>
                                <Input id="password" name="password" type="password" placeholder="New Password" required />
                                {state.fieldErrors?.password && <p className="text-xs text-destructive">{state.fieldErrors.password}</p>}
                                {state.message && !state.fieldErrors && <p className="text-xs text-destructive">{state.message}</p>}
                            </div>
                        )}
                       
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                         {state.success ? (
                             <Button asChild className="w-full">
                                <Link href="/login">Proceed to Login</Link>
                            </Button>
                         ) : (
                            <>
                                <SubmitButton />
                                <Button variant="link" asChild>
                                    <Link href="/login">Back to Login</Link>
                                </Button>
                            </>
                         )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
