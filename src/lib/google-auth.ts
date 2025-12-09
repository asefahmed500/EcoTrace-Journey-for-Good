export function signInWithGoogle(callbackUrl?: string) {
  const url = `/api/auth/google${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
  window.location.href = url;
}

export function getGoogleAuthUrl(callbackUrl?: string): string {
  return `/api/auth/google${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
}