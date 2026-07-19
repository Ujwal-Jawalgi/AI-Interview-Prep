import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth();

  // If not logged in, clerk middleware should catch it, but just in case
  if (!userId) {
    redirect("/sign-in");
  }

  // Check if the user exists in our Supabase database using the Service Role Key to bypass RLS
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  // If the user doesn't exist, redirect them to the onboarding flow
  if (!user || error) {
    redirect("/onboarding");
  }

  return <DashboardSidebar>{children}</DashboardSidebar>;
}
