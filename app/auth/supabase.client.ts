import { ENV } from "./../lib/env";
//auth/supabase.client.ts

import { createBrowserClient } from "@supabase/ssr";

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createClient() {
  // console.log("Creating Supabase client with URL:", ENV.SUPABASE_URL);

  return createBrowserClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
}

export { createClient };
