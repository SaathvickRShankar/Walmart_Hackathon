// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The '!' tells TypeScript that we are sure these values are not null.
// In a real production app, you might add checks to ensure they exist.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
