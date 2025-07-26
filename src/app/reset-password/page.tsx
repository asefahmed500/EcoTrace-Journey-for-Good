import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

function ResetPasswordContent({ token }: { token: string }) {
    return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = typeof searchParams.token === 'string' ? searchParams.token : '';
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent token={token} />
    </Suspense>
  );
}
