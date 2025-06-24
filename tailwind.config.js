// tailwind.config.js (최종 완성본)

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // typography 설정을 여기에 추가합니다.
      typography: ({ theme }) => ({
        // .prose 클래스에 대한 기본 설정을 여기에 정의합니다.
        DEFAULT: {
          css: {
            // ==========================================================
            // 👇 여기에 링크(a)와 hover 스타일을 추가했습니다!
            // ==========================================================
            a: {
              // 기본 링크 색상
              color: "var(--color-notionary-blue)",
              textDecoration: "none", // 밑줄 제거 (선택사항)
              // '&:hover'는 CSS의 a:hover 와 동일합니다.
              "&:hover": {
                color: "var(--color-notionary-blue-dark)",
              },
            },

            // h3, h4에도 다른 색상을 적용할 수 있습니다.
            h3: {
              color: "var(--color-notionary-text-secondary)",
            },
            h4: {
              color: "var(--color-notionary-text-secondary)",
            },

            // .prose strong 스타일
            strong: {
              color: "var(--color-notionary-text-primary)",
            },

            // .prose code 요소에 대한 세부 스타일
            code: {
              // @apply text-notionary-orange bg-notionary-gray ... 를
              // CSS-in-JS 형식으로 변환합니다.
              color: "var(--color-notionary-orange)", // @theme의 변수를 사용
              backgroundColor: "var(--color-notionary-gray)",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              fontWeight: "500",
            },
            // `백틱` 문자가 표시되지 않도록 하는 설정
            "code::before": { content: '""' },
            "code::after": { content: '""' },

            // .prose pre 에 대한 스타일
            pre: {
              padding: "1rem",
              overflowX: "auto",
              borderRadius: "0.375rem", // rounded-md
              backgroundColor: "var(--color-notionary-text-primary)",
              // .prose pre code 에 대한 스타일
              code: {
                padding: 0,
                fontWeight: "normal",
                backgroundColor: "transparent",
                color: "var(--color-notionary-gray-light)", // pre 안의 코드 색상
              },
            },
          },
        },
      }),
    },
  },

  // v4에서는 plugins 배열이 필요 없습니다.
  plugins: [require("@tailwindcss/typography")],
};
