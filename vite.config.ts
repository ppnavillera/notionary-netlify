import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  plugins: [
    mdx({
      remarkPlugins: [
        remarkGfm, // GitHub Flavored Markdown
        remarkMath, // 수학 표현식 지원
      ],
      rehypePlugins: [
        rehypeKatex, // 수학 표현식 렌더링
        rehypeHighlight, // 코드 하이라이팅
      ],
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
}));
