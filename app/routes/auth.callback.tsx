// // app/routes/auth.callback.tsx
// import { redirect, type LoaderFunctionArgs } from "react-router";
// import { createClient } from "~/auth/supabase.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const requestUrl = new URL(request.url);
//   const code = requestUrl.searchParams.get("code");
//   const next = requestUrl.searchParams.get("next") || "/main"; // 로그인 후 이동할 페이지

//   const { supabase, headers } = createClient(request);

//   if (code) {
//     const { error } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error) {
//       // 로그인 성공시 대시보드나 메인 페이지로 리다이렉트
//       return redirect(next, { headers });
//     }
//   }

//   // 실패시 에러 페이지로 리다이렉트
//   return redirect("/auth/error", { headers });
// }

// app/routes/auth.callback.tsx
import { redirect, type LoaderFunctionArgs } from "react-router";
import { createClient } from "~/auth/supabase.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // 🔒 보안 개선: 민감한 정보 로깅 제거
  // 이전 코드: URL과 state를 그대로 출력해서 보안 위험
  console.log("[CALLBACK] 인증 콜백 처리 시작");
  // state는 보안상 로그에 출력하지 않음

  const { supabase, headers } = createClient(request);

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // state 파라미터 디버깅
      let fromExtension = false;

      if (state) {
        try {
          const decodedState = atob(state);
          // 🔒 보안 개선: state 내용을 로그에 출력하지 않음 (민감한 정보 포함 가능)
          console.log("[CALLBACK] State 디코딩 성공");
          const stateData = JSON.parse(decodedState);
          fromExtension = stateData.from === "extension";
        } catch (e) {
          console.error("[CALLBACK] State 파싱 에러 - 상세 내용은 보안상 출력하지 않음");
        }
      }

      console.log("[CALLBACK] fromExtension:", fromExtension);

      if (fromExtension) {
        const sessionData = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: data.session.user,
        };

        const redirectUrl = `/main?extension_session=${encodeURIComponent(
          JSON.stringify(sessionData)
        )}`;
        // 🔒 보안 개선: 실제 URL 내용은 토큰이 포함되어 있어서 로그에 출력하지 않음
        console.log("[CALLBACK] Extension으로 세션 정보와 함께 리다이렉트");

        return redirect(redirectUrl, { headers });
      }

      return redirect("/main", { headers });
    }
  }

  return redirect("/", { headers });
}
