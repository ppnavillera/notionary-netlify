// app/routes/auth.callback.tsx
import { redirect, type LoaderFunctionArgs } from "react-router";
import { createClient } from "~/auth/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/main"; // 로그인 후 이동할 페이지

  const { supabase, headers } = createClient(request);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공시 대시보드나 메인 페이지로 리다이렉트
      return redirect(next, { headers });
    }
  }

  // 실패시 에러 페이지로 리다이렉트
  return redirect("/auth/error", { headers });
}
