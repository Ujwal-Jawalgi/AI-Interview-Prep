"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return toast.error("Please fill in all fields.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // Store name in user metadata so the profile trigger can use it
      }
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Create profile record
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: authData.user.id,
          name, 
          target_role: "Software Engineer", 
          experience_level: "fresher",
          skills: []
        }
      ]);

      if (profileError) {
        // Profile may already exist (e.g. re-signup), not a fatal error
        console.warn("Profile insert warning:", profileError.message);
      }

      // Check if email confirmation is needed
      if (authData.session) {
        // Email confirmation disabled — user is logged in immediately
        toast.success("Account created! Welcome aboard 🎉");
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation required
        setEmailSent(true);
        toast.success("Check your email to confirm your account!");
      }
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-8 text-center"
      >
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-muted-foreground mb-6">
          We sent a confirmation link to <span className="text-indigo-400 font-medium">{email}</span>.<br />
          Click the link to activate your account, then come back to log in.
        </p>
        <Link href="/login">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            Go to Login
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-8"
    >
      <h2 className="text-2xl font-bold mb-2">Create an account</h2>
      <p className="text-muted-foreground mb-6">Start your interview preparation journey today.</p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="At least 6 characters" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4" 
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Log in
        </Link>
      </div>
    </motion.div>
  );
}
