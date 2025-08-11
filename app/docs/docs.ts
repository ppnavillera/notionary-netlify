// ~/docs/docs.ts

import React from "react";
import Guide1 from "~/docs/notionary/Guide1.mdx";
import Guide2 from "~/docs/notionary/Guide2.mdx";
import Guide3 from "~/docs/notionary/Guide3.mdx";
import Guide4 from "~/docs/notionary/Guide4.mdx";

export const documentationContent = [
  {
    id: "guide-1-intro",
    title: "Notionary 시작하기",
    component: Guide1,
    task: null,
  },
  {
    id: "guide-2-notion-api",
    title: "Notion api 키 입력",
    component: Guide2,
    task: {
      // ===> 이 부분의 validate 함수와 placeholder를 수정합니다. <===
      validate: (input: string) => {
        if (!input) return false;
        const trimmedInput = input.trim();
        // API 키는 'ntn_'으로 시작하고, 최소한 그보다 길어야 합니다.
        return trimmedInput.startsWith("ntn_") && trimmedInput.length > 4;
      },
      placeholder: "ntn_로 시작하는 API 키를 붙여넣어 주세요",
    },
  },
  {
    id: "guide-3-notion-link",
    title: "Notion 페이지 링크 입력",
    component: Guide3,
    task: {
      validate: (input: string) => {
        if (!input || !input.trim()) return false;
        const trimmedInput = input.trim();

        // 정규식으로 패턴 검증
        // https://www.notion.so/[임의의문자들]/Integration-[임의의문자들]
        const notionIntegrationPattern =
          /^https:\/\/www\.notion\.so\/[^\/]+\/Integration-.+$/;

        return notionIntegrationPattern.test(trimmedInput);
      },
      placeholder: "https://www.notion.so/your-username/Integration-...",
    },
  },
];

export const completion = {
  id: "guide-4-completion",
  title: "Notionary 설정 완료",
  component: Guide4,
  task: null,
};
