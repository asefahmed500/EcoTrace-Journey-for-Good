import { getCurrentUser } from '@/lib/simple-auth';
import { AuthStatus } from '@/components/debug/auth-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function AuthDebugPage() {
  const user = await getCurrentUser();
  
  // Only allow access in development
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is only available in development mode to help debug authentication issues.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server-Side Session</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>User ID:</strong> {user.id || 'Not available'}</p>
                <p><strong>Name:</strong> {user.name || 'Not available'}</p>
                <p><strong>Email:</strong> {user.email || 'Not available'}</p>
                <p><strong>Image:</strong> {user.image ? 'Available' : 'Not available'}</p>
              </div>
            ) : (
              <p>No server-side session found</p>
            )}
          </CardContent>
        </Card>

        <AuthStatus />
      </div>
    </div>
  );
}