// routes/home.tsx - 이 파일 하나에 모든 것을 포함시켜야 합니다
import { Form, redirect, useActionData } from "react-router";
import { createClient } from "~/auth/supabase.server";
import GoogleIcon from "~/components/icons/GoogleIcon";
import type { Route } from "./+types/home";
import type { R } from "node_modules/@react-router/dev/dist/routes-DHIOx0R9";
import { useEffect } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  // 이 loader는 현재 인증 상태를 확인하거나 초기 데이터를 로드하는 데 사용될
  const url = new URL(request.url);
  const fromExtension = url.searchParams.get("from") === "extension";

  console.log("[HOME LOADER] URL:", url.toString());
  console.log("[HOME LOADER] from extension:", fromExtension);

  // 브라우저에서 실행될 스크립트 주입
  if (fromExtension) {
    return {
      fromExtension: true,
      script: `localStorage.setItem('from_extension', 'true'); console.log('[INJECTED] Extension 플래그 저장됨');`,
    };
  }
  const { supabase, headers } = createClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    // 이미 로그인된 사용자가 Notion 설정도 되어있는지 확인
    // Extension에서 온 경우 localStorage에 플래그 설정
    if (fromExtension) {
      // 쿠키나 헤더를 통해 Extension 플래그 전달
      headers.append("Set-Cookie", "from_extension=true; Path=/; Max-Age=60");
    }
    const { data: notion } = await supabase
      .from("notion")
      .select("api_key")
      .eq("user_id", user.id)
      .single();
    // 사용자가 이미 로그인되어 있다면, 홈 페이지로 리다이렉트합니다
    return redirect("/main", { headers });
  }

  // // 로그인된 사용자의 추가 데이터를 불러올 수 있습니다
  // const { data: profile } = await supabase
  //   .from("profiles") // 예시: 사용자 프로필 테이블
  //   .select("*")
  //   .eq("id", user.id)
  //   .single();

  // 로그인되지 않은 사용자는 계속 진행
  return null; // 홈 페이지를 렌더링하기 위해 null을 반환합니다
}

// // action 함수를 home.tsx에 추가
// export async function action({ request }: Route.ActionArgs) {
//   const { supabase, headers } = createClient(request);

//   // const { data, error } = await supabase.auth.signInWithOAuth({
//   //   provider: "google",
//   //   options: {
//   //     redirectTo: `${new URL(request.url).origin}/auth/callback`,
//   //   },
//   // });
//   // Extension에서 온 요청인지 확인
//   const url = new URL(request.url);
//   const fromExtension = url.searchParams.get("from") === "extension";

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: `${url.origin}/auth/callback`,
//       scopes: "email profile",
//       // state에 extension 정보 포함
//       ...(fromExtension && {
//         queryParams: {
//           state: "from_extension",
//         },
//       }),
//     },
//   });

//   if (error) {
//     console.error("Error signing in:", error);
//     return { error: "Failed to sign in with Google." };
//   }

//   if (data.url) {
//     return redirect(data.url, { headers });
//   }

//   return { error: "Unexpected response from OAuth provider" };

// }

// home.tsx의 action 함수
export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createClient(request);
  const url = new URL(request.url);

  // Extension에서 온 요청인지 확인
  const fromExtension = url.searchParams.get("from") === "extension";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // callback URL에 직접 파라미터 추가
      redirectTo: `${url.origin}/auth/callback${
        fromExtension ? "?from=extension" : ""
      }`,
    },
  });

  if (error) {
    return { error: "Failed to sign in with Google." };
  }

  if (data.url) {
    return redirect(data.url, { headers });
  }

  return { error: "Unexpected response from OAuth provider" };
}

// 메인 Home 컴포넌트 - 단순화
export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  console.log("[HOME] 컴포넌트 렌더링됨");

  // 💡 공통 함수로 분리 - 중복 코드 제거
  const setExtensionFlag = (source: string) => {
    // 중복 저장 방지: 이미 설정되어 있으면 다시 저장하지 않음
    if (localStorage.getItem("from_extension") !== "true") {
      localStorage.setItem("from_extension", "true");
      console.log(`[HOME] Extension 플래그 저장됨 - 출처: ${source}`);
      return true; // 실제로 저장했음을 반환
    }
    console.log(`[HOME] Extension 플래그 이미 설정됨 - 출처: ${source}`);
    return false; // 이미 설정되어 있음
  };

  // 🔄 통합된 Extension 상태 확인 로직
  useEffect(() => {
    // Extension 여부를 확인하는 모든 방법을 체크하는 함수
    // 확장프로그램에서 왔는지 확인하는 함수
    const checkExtensionSource = () => {
      // 1. URL 파라미터에서 확인 (?from=extension)
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get("from") === "extension";

      // 2. 서버에서 전달된 데이터에서 확인 (loaderData.fromExtension)
      const fromLoader = loaderData?.fromExtension;

      // 우선순위: URL 파라미터 > 서버 데이터
      // 어느 방법으로든 확장프로그램에서 왔다면 그 출처를 반환
      if (fromUrl) return "URL 파라미터";
      if (fromLoader) return "서버 데이터";
      return null; // Extension이 아님
    };

    // Extension 출처를 확인하고, 있으면 플래그 저장
    const extensionSource = checkExtensionSource();
    if (extensionSource) {
      setExtensionFlag(extensionSource);
    }
  }, [loaderData]); // loaderData가 변경될 때마다 다시 실행
  // 현재는 항상 LandingPage를 보여줍니다
  // 나중에 인증 상태에 따라 조건부 렌더링을 추가할 수 있습니다
  return (
    <div className="min-h-screen font-sans">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-notionary-gray-light">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl md:p-12">
          <header className="mb-10">
            <h1 className="text-5xl font-extrabold md:text-6xl text-notionary-orange">
              Notionary
            </h1>
            <p className="mt-3 text-lg text-notionary-text-secondary">
              Your intelligent dictionary, seamlessly integrated.
            </p>
          </header>

          <main>
            <Form method="post">
              <button
                type="submit"
                className="w-full flex items-center justify-center bg-white border border-notionary-gray-medium text-notionary-text-secondary font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <GoogleIcon className="w-5 h-5 mr-3" />
                Sign in with Google
              </button>
            </Form>

            {/* 에러 메시지 표시 */}
            {actionData?.error && (
              <p className="mt-4 text-red-600">{actionData.error}</p>
            )}
          </main>

          <footer className="mt-12 text-sm text-notionary-text-light">
            <p>
              &copy; {new Date().getFullYear()} Notionary. All rights reserved.
            </p>
            <p className="mt-1">
              <a
                href="#"
                className="hover:text-notionary-orange hover:underline"
              >
                Privacy Policy
              </a>
              <span className="mx-2">·</span>
              <a
                href="#"
                className="hover:text-notionary-orange hover:underline"
              >
                Terms of Service
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
