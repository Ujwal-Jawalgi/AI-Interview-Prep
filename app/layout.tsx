import "@/app/globals.css";
import { Toaster } from "sonner";
import { ReactNode } from "react";

export const metadata = {
  title: "PrepMind — AI Interview Preparation",
  description: "Practice Interviews with AI, resume analysis and question banks",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[#0a0a14] text-slate-100">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
