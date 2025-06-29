// routes/auth-error.tsx
import { Link } from "react-router";

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Authentication Error
        </h1>
        <p className="mb-6 text-gray-600">
          There was a problem signing you in. Please try again.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 text-gray-600 transition-colors border border-gray-600 rounded-lg cursor-pointer"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
