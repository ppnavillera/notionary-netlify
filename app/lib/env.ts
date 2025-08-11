// lib/env.ts
export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// 환경변수 검증
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variables");
}
