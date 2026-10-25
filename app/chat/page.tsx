import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatApp } from "@/components/ChatApp";

export const metadata: Metadata = {
  title: "Chat — AIGuiden",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <ChatApp />
    </Suspense>
  );
}
