import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SOCIAL_HANDLE, SOCIALS } from "@/lib/social";

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wiseyarn — an AI guide for Africa and beyond",
  description:
    "Ask about farming, health, money, school, jobs and your rights — in English, Pidgin, Hausa, Yorùbá, Igbo, Swahili, French, Arabic and more.",
  applicationName: "Wiseyarn",
  twitter: { card: "summary", site: `@${SOCIAL_HANDLE}`, creator: `@${SOCIAL_HANDLE}` },
};

// Tells search engines these social profiles belong to Wiseyarn.
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wiseyarn",
  sameAs: SOCIALS.map((s) => s.url),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1029" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
