// 이 코드를 DocsPage 컴포넌트 파일 상단이나 별도의 파일에 추가하세요.

import React, { useState } from "react";

// 🔧 타입 안전성 개선: TypeScript 타입 정의 추가
// 이전 코드: 타입이 없어서 실수 가능성 높음
// 새 코드: 명확한 타입으로 오류 방지
type RatingType = "yes" | "no" | null;

const FeedbackForm = () => {
  const [rating, setRating] = useState<RatingType>(null); // 평점: 예/아니요/미선택
  const [feedback, setFeedback] = useState<string>(""); // 피드백 텍스트
  const [submitted, setSubmitted] = useState<boolean>(false); // 제출 완료 여부

  const handleRating = (value: "yes" | "no") => {
    setRating(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 실제로는 이 데이터를 서버로 보냅니다.
    console.log({
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-8 mt-12 text-center border-t border-notionary-gray">
        <h3 className="text-lg font-semibold text-notionary-text-primary">
          소중한 의견 감사합니다!
        </h3>
        <p className="mt-2 text-notionary-text-light">
          피드백을 바탕으로 더 나은 문서를 만들어가겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pt-8 mt-16 border-t border-notionary-gray-medium"
    >
      <h3 className="mb-4 text-lg font-semibold text-center text-notionary-text-secondary">
        이 문서가 도움이 되었나요?
      </h3>
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => handleRating("yes")}
          className={`px-6 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200
            ${
              rating === "yes"
                ? "bg-notionary-orange border-notionary-orange text-white"
                : "bg-white border-notionary-gray-medium text-notionary-text hover:border-notionary-orange hover:text-notionary-orange"
            }`}
        >
          👍 예
        </button>
        <button
          type="button"
          onClick={() => handleRating("no")}
          className={`px-6 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200
            ${
              rating === "no"
                ? "bg-notionary-text-secondary border-notionary-text-secondary text-white"
                : "bg-white border-notionary-gray-medium text-notionary-text hover:border-notionary-text-secondary hover:text-notionary-text-secondary"
            }`}
        >
          👎 아니요
        </button>
      </div>

      {rating && (
        <div className="mt-6 animate-fade-in">
          <label
            htmlFor="feedback-text"
            className="block mb-2 text-sm font-medium text-notionary-text-secondary"
          >
            {rating === "yes"
              ? "어떤 점이 마음에 드셨나요? (선택 사항)"
              : "어떤 점을 개선하면 좋을까요? (선택 사항)"}
          </label>
          <textarea
            id="feedback-text"
            rows={4} // 🔧 타입 수정: 문자열에서 숫자로 변경
            value={feedback}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)} // 이벤트 타입 명시
            placeholder="자세한 의견을 남겨주시면 큰 도움이 됩니다."
            className="w-full p-3 transition-shadow border rounded-md bg-notionary-gray-light border-notionary-gray-medium focus:ring-2 focus:ring-notionary-orange focus:border-notionary-orange"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 font-semibold text-white transition-colors rounded-md bg-notionary-orange hover:bg-notionary-orange-dark focus:outline-none focus:ring-2 focus:ring-notionary-orange focus:ring-opacity-50 disabled:bg-notionary-gray-medium disabled:cursor-not-allowed"
            >
              피드백 제출
            </button>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
        `}
      </style>
    </form>
  );
};
