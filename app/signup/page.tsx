import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInScreen } from "@/components/SignInScreen";

export const metadata: Metadata = {
  title: "Sign up — Wiseyarn",
  description: "Create a free Wiseyarn account with your Google account.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <SignInScreen mode="signup" />
    </Suspense>
  );
}
