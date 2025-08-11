import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), // 홈페이지 (/)
  route("auth/callback", "routes/auth.callback.tsx"), // OAuth 콜백 (/auth/callback)
  route("auth/error", "routes/auth.error.tsx"), // 에러 페이지 (/auth/error)
  route("main", "routes/main.tsx"),
  route("logout", "routes/logout.tsx"),
  route("extension-success", "routes/extension-success.tsx"),
] satisfies RouteConfig;
