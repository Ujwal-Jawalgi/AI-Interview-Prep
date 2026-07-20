import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerkAppearance";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrepMind — Ace Every Interview with AI",
  description:
    "AI- mock interviews, resume analysis, coding rounds, and personalized feedback. Prepare smarter for Google, Amazon, Microsoft, TCS, Infosys, and more.",
  keywords: [
    "interview preparation",
    "AI mock interview",
    "resume analysis",
    "coding interview",
    "placement preparation",
  ],
  openGraph: {
    title: "PrepMind — Ace Every Interview with AI",
    description: "AI-powered interview preparation platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

