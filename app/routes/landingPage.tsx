// import React from "react";
// import { Form, redirect } from "react-router";
// import { createClient } from "~/auth/supabase.server";
// import GoogleLoginButton from "~/components/googleLoginButton";

// interface LandingPageProps {
//   onLogin: () => void;
// }

// export async function action({ request }: { request: Request }) {
//   const { supabase, headers } = createClient(request);

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: `${new URL(request.url).origin}/auth/callback`,
//     },
//   });

//   if (error) {
//     console.error("Error signing in:", error);
//     // 에러가 발생하면 JSON 응답과 함께 헤더를 반환합니다
//     return new Response(
//       JSON.stringify({ error: "Failed to sign in with Google." }),
//       {
//         status: 400,
//         headers: {
//           ...headers,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }

//   // OAuth에서는 사용자를 Google 인증 페이지로 리다이렉트해야 합니다
//   if (data.url) {
//     return redirect(data.url, { headers });
//   }

//   // 예상치 못한 상황을 위한 기본 응답
//   return new Response(
//     JSON.stringify({ error: "Unexpected response from OAuth provider" }),
//     {
//       status: 500,
//       headers: {
//         ...headers,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// }

// const LandingPage = ({ onLogin }: LandingPageProps) => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-notionary-gray-light">
//       <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl md:p-12">
//         <header className="mb-10">
//           <h1 className="text-5xl font-extrabold md:text-6xl text-notionary-orange">
//             Notionary
//           </h1>
//           <p className="mt-3 text-lg text-notionary-text-secondary">
//             Your intelligent dictionary, seamlessly integrated.
//           </p>
//         </header>

//         <main>
//           {/* <GoogleLoginButton onClick={onLogin} /> */}
//           {/* Form을 사용해서 서버의 action 함수를 호출합니다 */}
//           <Form method="post">
//             <button
//               type="submit"
//               className="w-full px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//             >
//               Sign in with Google
//             </button>
//           </Form>
//         </main>

//         <footer className="mt-12 text-sm text-notionary-text-light">
//           <p>
//             &copy; {new Date().getFullYear()} Notionary. All rights reserved.
//           </p>
//           <p className="mt-1">
//             <a href="#" className="hover:text-notionary-orange hover:underline">
//               Privacy Policy
//             </a>
//             <span className="mx-2">·</span>
//             <a href="#" className="hover:text-notionary-orange hover:underline">
//               Terms of Service
//             </a>
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;
