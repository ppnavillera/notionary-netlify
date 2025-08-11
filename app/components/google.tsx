import { useEffect } from "react";
import { createClient } from "~/auth/supabase.server"; // 브라우저용 Supabase 클라이언트

// LandingPage로부터 onLogin 함수를 props로 받습니다.
const GoogleLoginButton = ({ onLogin, request }) => {
  // Supabase 클라이언트를 초기화합니다.
  const supabase = createClient(request);

  useEffect(() => {
    // Google 로그인 성공 시 호출될 콜백 함수를 정의합니다.
    // 이 함수는 Google 스크립트가 찾을 수 있도록 window 객체에 할당해야 합니다.
    const handleSignInWithGoogle = async (response) => {
      console.log("Google Sign-In Response:", response);

      // Google로부터 받은 ID 토큰을 Supabase에 전달하여 로그인합니다.
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        console.error("Error signing in with Google:", error);
        // 여기서 사용자에게 오류를 표시하는 로직을 추가할 수 있습니다.
      } else {
        console.log("Successfully signed in with Supabase:", data);
        // 로그인이 성공적으로 완료되었으므로, 부모 컴포넌트가 전달한 onLogin 함수를 호출합니다.
        onLogin();
      }
    };

    // 전역 스코프(window)에 콜백 함수를 할당합니다.
    window.handleSignInWithGoogle = handleSignInWithGoogle;

    // 컴포넌트가 언마운트될 때 전역 스코프에서 함수를 정리(clean up)합니다.
    return () => {
      delete window.handleSignInWithGoogle;
    };
  }, [onLogin, supabase]); // 의존성 배열에 onLogin과 supabase를 추가합니다.

  return (
    <>
      {/* 1. One Tap 또는 자동 로그인을 위한 설정 div */}
      <div
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} // 실제 Client ID로 교체해야 합니다.
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleSignInWithGoogle" // 위에서 정의한 콜백 함수 이름
        data-auto_select="true"
        data-itp_support="true"
        data-use_fedcm_for_prompt="true"
      ></div>

      {/* 2. "Sign in with Google" 버튼을 렌더링하는 div */}
      <div
        className="g_id_signin" // class -> className 으로 변경
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </>
  );
};

export default GoogleLoginButton;
