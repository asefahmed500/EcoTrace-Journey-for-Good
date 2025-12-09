
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Trash2, Users, Plus, LogIn } from 'lucide-react';
import type { UserPreferences } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';

interface AccountSettingsFormProps {
    preferences: UserPreferences;
    team?: { id: string; name: string; inviteCode: string; } | null
}

export function AccountSettingsForm({ preferences: initialPreferences, team: initialTeam }: AccountSettingsFormProps) {
    const { toast } = useToast()
    const router = useRouter();
    const [preferences, setPreferences] = useState(initialPreferences);
    const [team, setTeam] = useState(initialTeam);
    const [prefsIsSubmitting, setPrefsIsSubmitting] = useState(false);
    const [teamIsSubmitting, setTeamIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update local state if initial props change
    useEffect(() => {
        setPreferences(initialPreferences);
        setTeam(initialTeam);
    }, [initialPreferences, initialTeam])

    const handlePreferencesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPrefsIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                toast({ title: "Preferences Saved", description: result.message });
                router.refresh();
            } else {
                toast({ variant: "destructive", title: "Update Failed", description: result.error });
            }
        } catch (error) {
             toast({ variant: "destructive", title: "Update Failed", description: "An unexpected network error occurred." });
        } finally {
            setPrefsIsSubmitting(false);
        }
    };
    
    const handleTeamAction = async (action: 'create' | 'join', e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTeamIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/team?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                toast({ title: `Success!`, description: result.message });
                router.refresh();
            } else {
                toast({ variant: 'destructive', title: 'Action Failed', description: result.error });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Action Failed', description: 'An unexpected network error occurred.' });
        } finally {
            setTeamIsSubmitting(false);
        }
    }


    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
             const response = await fetch('/api/user/delete', { method: 'DELETE' });
             const result = await response.json();
             if(response.ok) {
                toast({ title: "Account Deleted", description: result.message });
                // Sign out and redirect
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
                router.refresh();
             } else {
                toast({ variant: 'destructive', title: 'Deletion Failed', description: result.message });
             }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'An unexpected network error occurred.' });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your preferences and account data.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePreferencesSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="favoriteRoutes">Favorite Routes</Label>
                        <Input id="favoriteRoutes" name="favoriteRoutes" defaultValue={preferences.favoriteRoutes} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="transportModes">Preferred Transport Modes</Label>
                        <Input id="transportModes" name="transportModes" defaultValue={preferences.transportModes} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="environmentalPriorities">Environmental Priorities</Label>
                        <Textarea id="environmentalPriorities" name="environmentalPriorities" defaultValue={preferences.environmentalPriorities} rows={3} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full sm:w-auto" disabled={prefsIsSubmitting}>
                        {prefsIsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Preferences
                    </Button>
                </CardFooter>
            </form>
            
            <Separator className="my-4" />

            <CardHeader className="pt-0">
                <CardTitle className="text-lg flex items-center gap-2"><Users className="size-5" /> Team Management</CardTitle>
                 <CardDescription>
                    Create or join a team to collaborate on challenges and compare stats.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {team ? (
                    <div>
                        <p className="font-semibold text-lg">You are on team: {team.name}</p>
                        <p className="text-muted-foreground mt-2">Share this code to invite others to your team:</p>
                        <div className="mt-2 flex items-center gap-2">
                           <Input value={team.inviteCode} readOnly className="font-mono text-lg tracking-widest w-auto" />
                           <Button variant="outline" onClick={() => {
                               navigator.clipboard.writeText(team.inviteCode);
                               toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
                            }}>Copy</Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        <form onSubmit={(e) => handleTeamAction('create', e)} className="space-y-4">
                            <h3 className="font-semibold">Create a new team</h3>
                             <div className="space-y-2">
                                <Label htmlFor="teamName">Team Name</Label>
                                <Input id="teamName" name="teamName" placeholder="The Eco-Warriors" />
                            </div>
                            <Button type="submit" disabled={teamIsSubmitting}>
                                {teamIsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Create Team
                            </Button>
                        </form>
                         <form onSubmit={(e) => handleTeamAction('join', e)} className="space-y-4">
                            <h3 className="font-semibold">Join an existing team</h3>
                             <div className="space-y-2">
                                <Label htmlFor="inviteCode">Invite Code</Label>
                                <Input 
                                    id="inviteCode" 
                                    name="inviteCode" 
                                    placeholder="ABC123DE"
                                    maxLength={8}
                                    onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                                />
                            </div>
                            <Button type="submit" disabled={teamIsSubmitting}>
                                {teamIsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                                Join Team
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>


            <Separator className="my-4" />

            <CardHeader className="pt-0">
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                 <CardDescription>
                    These actions are permanent and cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all of your data from our servers, including
                            all your saved journeys.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, delete my account
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
