import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { createClient } from "~/auth/supabase.server";

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);

  const { error } = await supabase.auth.signOut();

  // 로그아웃 실패 시 에러 처리
  if (error) {
    console.error("Logout error:", error);
    // return { error: "로그아웃 중 오류가 발생했습니다." };
  }

  return redirect("/", { headers });
}

export default function Logout() {
  return null;
}
