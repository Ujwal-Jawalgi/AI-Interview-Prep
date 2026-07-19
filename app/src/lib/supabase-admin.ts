import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_to_bypass_build_errors_if_missing";

// We use the service role key to bypass RLS for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
