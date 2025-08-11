// app/routes/extension-success.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router";

export default function ExtensionSuccess() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionStr = searchParams.get("session");

    if (sessionStr && document.body.getAttribute("data-from-extension")) {
      try {
        const session = JSON.parse(decodeURIComponent(sessionStr));

        // Content script로 메시지 전송
        window.postMessage(
          {
            type: "NOTIONARY_AUTH_SUCCESS",
            session: session,
          },
          window.location.origin
        );

        // 2초 후 창 닫기
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (e) {
        console.error("Session 파싱 에러:", e);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 text-center bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">로그인 성공!</h1>
        <p className="text-gray-600">잠시 후 자동으로 창이 닫힙니다...</p>
        <div className="mt-4">
          <div className="w-8 h-8 mx-auto border-b-2 border-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
