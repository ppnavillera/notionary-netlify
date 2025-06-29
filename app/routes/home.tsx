// import type { Route } from "./+types/home";
// import { Welcome } from "../welcome/welcome";

// // export function meta({}: Route.MetaArgs) {
// //   return [
// //     { title: "New React Router App" },
// //     { name: "description", content: "Welcome to React Router!" },
// //   ];
// // }

// // export function loader({ context }: Route.LoaderArgs) {
// //   return { message: context.VALUE_FROM_NETLIFY };
// // }

// // export default function Home({ loaderData }: Route.ComponentProps) {
// //   return <Welcome message={loaderData.message} />;
// // }

// routes/home.tsx - 이 파일 하나에 모든 것을 포함시켜야 합니다
import { Form, redirect, useActionData } from "react-router";
import { createClient } from "~/auth/supabase.server";
import GoogleIcon from "~/components/icons/GoogleIcon";

// action 함수를 home.tsx에 추가
export async function action({ request }: { request: Request }) {
  const { supabase, headers } = createClient(request);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error signing in:", error);
    return { error: "Failed to sign in with Google." };
  }

  if (data.url) {
    return redirect(data.url, { headers });
  }

  return { error: "Unexpected response from OAuth provider" };
}

// 메인 Home 컴포넌트 - 단순화
export default function Home() {
  const actionData = useActionData<typeof action>();
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
