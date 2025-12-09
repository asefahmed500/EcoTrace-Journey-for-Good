import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

function ResetPasswordContent({ token }: { token: string }) {
    return <ResetPasswordForm token={token} />;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent token={token} />
    </Suspense>
  );
}
