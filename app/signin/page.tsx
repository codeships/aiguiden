import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInScreen } from "@/components/SignInScreen";

export const metadata: Metadata = {
  title: "Sign in — Wiseyarn",
  description: "Sign in to Wiseyarn with your Google account.",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <SignInScreen />
    </Suspense>
  );
}
