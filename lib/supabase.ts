import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl) {
  console.warn("Supabase URL is not set. Database calls will fail until configured.");
}

if (!supabaseKey) {
  console.warn("Supabase service role key is not set. Database calls will fail until configured.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});
