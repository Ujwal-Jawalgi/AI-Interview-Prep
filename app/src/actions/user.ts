"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  if (!user) throw new Error("User not found in Clerk");

  const college = formData.get("college") as string;
  const branch = formData.get("branch") as string;

  const email = user.emailAddresses[0]?.emailAddress;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const { error } = await supabaseAdmin.from("users").insert({
    clerk_id: userId,
    email: email,
    name: name,
    college: college,
    branch: branch,
  });

  if (error) {
    console.error("Error inserting user into Supabase:", error);
    throw new Error("Failed to create user profile");
  }

  // Redirect to dashboard after successful onboarding
  redirect("/dashboard");
}
