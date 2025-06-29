import React from "react";
import GoogleIcon from "./icons/GoogleIcon";

interface GoogleLoginButtonProps {
  onClick: () => void;
}

const GoogleLoginButton = ({ onClick }: GoogleLoginButtonProps) => {
  const handleClick = () => {
    console.log("GoogleLoginButton이 클릭되었습니다!"); // 이 메시지가 나오는지 확인
    onClick();
  };
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center bg-white border border-notionary-gray-medium text-notionary-text-secondary font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
    >
      <GoogleIcon className="w-5 h-5 mr-3" />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
