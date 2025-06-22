import React from "react";
import GoogleIcon from "./icons/GoogleIcon";

interface GoogleLoginButtonProps {
  onClick: () => void;
}

const GoogleLoginButton = ({ onClick }: GoogleLoginButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center bg-white border border-notionary-gray-medium text-notionary-text-secondary font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 active:scale-95"
    >
      <GoogleIcon className="w-5 h-5 mr-3" />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;
