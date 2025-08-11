import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Form, redirect, useFetcher, useSearchParams } from "react-router";
import { createClient } from "~/auth/supabase.server";
import { createClient as createBrowserClient } from "~/auth/supabase.client";
import { documentationContent, completion } from "~/docs/docs";
import type { Route } from "./+types/main";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = await createClient(request);

  // 서버에서 사용자 인증 상태 확인
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // 로그인되지 않은 사용자는 홈페이지로 리다이렉트
  if (!user || error) {
    return redirect("/", { headers });
  }

  // 로그인된 사용자의 추가 데이터를 불러올 수 있습니다
  const { data: notion } = await supabase
    .from("notion") // 예시: 사용자 프로필 테이블
    .select("api_key, page_id")
    .eq("user_id", user.id)
    .single();

  // 세션 정보 가져오기 (getUser 후에는 안전)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    user,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
        }
      : null,
    notion,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = await createClient(request);

  // 1. 먼저 사용자 인증 상태 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // 2. 로그인되지 않은 사용자는 리다이렉트
  if (!user || authError) {
    return redirect("/", { headers });
  }

  const formData = await request.formData();
  const notionApiKey = formData.get("guide-2-notion-api");
  const notionLink = formData.get("guide-3-notion-link");

  const { data, error } = await supabase
    .from("notion")
    .insert({
      api_key: notionApiKey,
      page_id: notionLink,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving data to Supabase:", error);
    return {
      error: "데이터 저장에 실패했습니다. 다시 시도해주세요.",
      success: false,
    };
  }

  console.log("Form Data:", {
    notionApiKey,
    notionLink,
  });
  // 성공적으로 저장된 경우
  return {
    success: true,
    message: "데이터가 성공적으로 저장되었습니다.",
    notionSetupComplete: true, // 추가
    // post: data,
  };
}

// export async function clientAction({ request }: Route.ClientActionArgs) {
//   const supabase = createBrowserClient();
//   const formData = await request.formData();
// }

const Main = ({ loaderData }: Route.ComponentProps) => {
  const { user, session, notion } = loaderData;

  // 🔒 보안 개선: 민감한 정보(API 키, 토큰 등) 로깅 제거
  // 이전 코드: notion.api_key를 그대로 출력해서 보안 위험
  console.log("[MAIN] 데이터 로딩 완료:", {
    hasUser: !!user,
    hasSession: !!session,
    hasNotion: !!notion,
    notionApiKeyExists: !!notion?.api_key, // API 키 존재 여부만 확인
  });

  // API 키는 보안상 로그에 출력하지 않음
  // Extension 세션 전달을 위한 단일 useEffect
  useEffect(() => {
    // localStorage에서 extension 플래그 확인
    const fromExtension = localStorage.getItem("from_extension");
    console.log("[MAIN] Extension 체크:", {
      fromExtension,
      hasSession: !!session,
      hasNotionApiKey: !!notion?.api_key,
    });

    if (fromExtension === "true" && session) {
      console.log("[MAIN] Extension으로 세션 및 Notion 상태 전달");
      setTimeout(() => {
        const messageData = {
          // messageData 정의 추가
          type: "NOTIONARY_AUTH_SUCCESS",
          session: session,
          hasNotionSetup: !!notion?.api_key,
        };

        // 🔒 보안 개선: 세션 정보는 토큰을 포함하고 있어서 로그에 출력하지 않음
        console.log("[MAIN] Extension으로 인증 성공 메시지 전송");
        window.postMessage(messageData, window.location.origin);
      }, 100);

      // 플래그 제거
      localStorage.removeItem("from_extension");
    }

    // Notion 설정이 이미 있는 경우 Extension에 알림
    if (notion?.api_key && fromExtension === "true") {
      window.postMessage(
        {
          type: "NOTIONARY_NOTION_SETUP_COMPLETE",
        },
        window.location.origin
      );
    }
  }, [session, notion]);
  // --- 상태 및 참조 ---
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [taskInputValue, setTaskInputValue] = useState("");
  const [completedTasks, setCompletedTasks] = useState<{
    [key: string]: string;
  }>({});
  const articleRefs = useRef<(HTMLElement | null)[]>([]);
  const isScrollingProgrammatically = useRef(false);

  // --- 파생 데이터 ---
  const activeDoc = documentationContent[activeDocIndex];
  const prevDoc = documentationContent[activeDocIndex - 1];
  const nextDoc = documentationContent[activeDocIndex + 1];

  const isTaskCompleted = useMemo(() => {
    if (!activeDoc?.task) {
      // task가 없는 페이지에서는 이전 단계들의 완료 여부를 확인
      if (activeDoc?.id === "guide-4-finish") {
        // Guide4에서는 Guide2(API키)와 Guide3(링크) 모두 완료되어야 함
        return !!(
          completedTasks["guide-2-notion-api"] &&
          completedTasks["guide-3-notion-link"]
        );
      }
      return true;
    }
    const isValid = activeDoc.task.validate(taskInputValue);
    return isValid;
  }, [activeDoc, taskInputValue, completedTasks]);

  // --- 스크롤 및 상태 관리 로직 ---
  // 입력 완료 시 저장
  useEffect(() => {
    if (activeDoc?.task && isTaskCompleted) {
      setCompletedTasks((prev) => ({
        ...prev,
        [activeDoc.id]: taskInputValue,
      }));
    }
  }, [activeDoc, isTaskCompleted, taskInputValue]);

  // 페이지 변경 시 해당 페이지의 저장된 값으로 초기화
  useEffect(() => {
    if (activeDoc?.task) {
      setTaskInputValue(completedTasks[activeDoc.id] || "");
    } else {
      setTaskInputValue(""); // task가 없는 페이지에서는 입력값 초기화
    }
  }, [activeDocIndex, completedTasks]);

  // --- 이벤트 핸들러 (useCallback 적용) ---
  const scrollToArticle = useCallback((index: number) => {
    const articleRef = articleRefs.current[index];
    if (articleRef) {
      isScrollingProgrammatically.current = true;
      articleRef.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveDocIndex(index);
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 1000);
    }
  }, []);

  const handleNext = useCallback(() => {
    // 현재 단계의 작업이 완료되어야만 이동
    if (!isTaskCompleted) {
      alert("현재 단계를 완료해주세요.");
      return;
    }

    if (nextDoc) {
      scrollToArticle(activeDocIndex + 1);
    }
  }, [isTaskCompleted, nextDoc, activeDocIndex, scrollToArticle]);

  const handlePrevious = useCallback(() => {
    if (prevDoc) {
      scrollToArticle(activeDocIndex - 1);
    }
  }, [prevDoc, activeDocIndex, scrollToArticle]);

  // 마지막 페이지에서 '완료' 버튼을 눌렀을 때의 동작
  const handleFinish = () => {
    const apiKey = completedTasks["guide-2-notion-api"];
    const notionUrl = completedTasks["guide-3-notion-link"];

    console.log("Setup Finished!");
    console.log("API Key:", apiKey);
    console.log("Notion URL:", notionUrl);

    alert(
      `설정이 완료되었습니다!\n\nAPI Key: ${apiKey?.substring(
        0,
        8
      )}...\nNotion URL: ${notionUrl}`
    );
  };

  // 페이지별 폼 제목을 반환하는 함수
  const getFormTitle = (article) => {
    switch (article.id) {
      case "guide-2-notion-api":
        return "🔑 Notion API 키 입력";
      case "guide-3-notion-link":
        return "🔗 Notion 페이지 연결하기";
      default:
        return "📝 정보 입력";
    }
  };

  // 페이지별 에러 메시지를 반환하는 함수
  const getErrorMessage = (article) => {
    switch (article.id) {
      case "guide-2-notion-api":
        return "올바른 Notion API 키를 입력해주세요. (ntn_로 시작해야 합니다)";
      case "guide-3-notion-link":
        return "올바른 Notion 페이지 URL을 입력해주세요. (https://www.notion.so/user-name/Integration-로 시작해야 합니다)";
      default:
        return "올바른 값을 입력해주세요.";
    }
  };

  const fetcher = useFetcher();
  // fetcher 상태를 확인하여 로딩이나 에러 표시
  const isSubmitting = fetcher.state === "submitting";
  const isCompleted = fetcher.data?.success;
  const actionData = fetcher.data;
  const hasNotionSetup = notion?.api_key || isCompleted;

  // Main 컴포넌트에 추가
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.notionSetupComplete) {
      // Extension에 Notion 설정 완료 메시지 전송
      window.postMessage(
        {
          type: "NOTIONARY_NOTION_SETUP_COMPLETE",
        },
        window.location.origin
      );
    }
  }, [fetcher.data]);

  // // 제출 성공/실패 메시지 표시
  // useEffect(() => {
  //   if (actionData?.success) {
  //     alert("설정이 성공적으로 저장되었습니다!");
  //     // 또는 다음 페이지로 이동
  //   } else if (actionData?.error) {
  //     alert(actionData.error);
  //   }
  // }, [actionData]);

  const [searchParams] = useSearchParams();
  // app/routes/main.tsx
  useEffect(() => {
    console.log("[MAIN] 페이지 로드");
    console.log("[MAIN] URL:", window.location.href);
    console.log(
      "[MAIN] data-from-extension:",
      document.body.getAttribute("data-from-extension")
    );

    const extensionSession = searchParams.get("extension_session");

    if (extensionSession) {
      console.log("[MAIN] extension_session 있음");

      // 약간의 딜레이 후 메시지 전송
      setTimeout(() => {
        const session = JSON.parse(decodeURIComponent(extensionSession));
        // 🔒 보안 개선: 세션 토큰 정보는 로그에 출력하지 않음
        console.log("[MAIN] Extension 세션 정보 파싱 완료 및 메시지 전송");

        window.postMessage(
          {
            type: "NOTIONARY_AUTH_SUCCESS",
            session: session,
          },
          window.location.origin
        );
      }, 1000);

      // URL 정리
      window.history.replaceState({}, "", "/main");
    }

    const fromParam = searchParams.get("from");
    if (fromParam === "extension") {
      console.log("[MAIN] Extension에서 접속 - 플래그 설정");
      localStorage.setItem("from_extension", "true");
    }
  }, [searchParams]);

  return (
    <div className="relative flex flex-col w-full h-screen font-sans bg-notionary-gray-light">
      <header className="absolute top-0 left-0 right-0 z-50 shadow-sm bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-notionary-orange">
            Notionary
          </h1>
          {!hasNotionSetup && (
            <div className="text-sm text-notionary-text-light">
              Step {activeDocIndex + 1} / {documentationContent.length}
            </div>
          )}
          <Form action="/logout" method="post">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer bg-notionary-orange hover:bg-notionary-orange-dark"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>

      {hasNotionSetup && !isCompleted ? (
        <main
          className="flex-grow h-full min-w-0 overflow-y-auto no-scroll hide-scrollbar"
          style={{ scrollSnapType: "y mandatory" }}
        >
          <section className="flex items-center justify-center flex-shrink-0 min-h-full p-4 pt-20">
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl sm:p-10 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <article className="prose-sm prose sm:prose-base lg:prose-lg max-w-none">
                <h3>You already have a Notion set up!🎉</h3>
              </article>
            </div>
          </section>
        </main>
      ) : (
        <fetcher.Form method="post" className="flex flex-col flex-grow h-full">
          {/* --- 메인 컨테이너 --- */}
          <main
            className="flex-grow h-full min-w-0 overflow-y-auto no-scroll hide-scrollbar"
            style={{ scrollSnapType: "y mandatory" }}
          >
            {!isCompleted ? (
              documentationContent.map((article, index) => {
                return (
                  <section
                    key={article.id}
                    ref={(el) => (articleRefs.current[index] = el)}
                    data-index={index}
                    className="flex items-center justify-center flex-shrink-0 min-h-full p-4 pt-20"
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl sm:p-10 max-h-[calc(100vh-12rem)] overflow-y-auto">
                      <article className="prose-sm prose sm:prose-base lg:prose-lg max-w-none">
                        {React.createElement(article.component)}
                      </article>

                      {/* 해당 페이지에 task가 있을 때만 폼 표시 */}
                      {article.task && (
                        <div className="pt-8 mt-8 border-t border-notionary-gray-medium">
                          <div className="not-prose">
                            <h3 className="mb-4 text-lg font-semibold text-notionary-text-primary">
                              {getFormTitle(article)}
                            </h3>
                            <input
                              type={
                                article.id === "guide-2-notion-api"
                                  ? "api"
                                  : "url"
                              }
                              name={article.id}
                              value={
                                article.id === activeDoc.id
                                  ? taskInputValue
                                  : completedTasks[article.id] || ""
                              }
                              onChange={(e) => {
                                // 현재 활성화된 페이지의 입력만 업데이트
                                if (article.id === activeDoc.id) {
                                  setTaskInputValue(e.target.value);
                                }
                              }}
                              placeholder={article.task.placeholder}
                              readOnly={article.id !== activeDoc.id}
                              className={`w-full p-4 text-center bg-notionary-gray-light border-2 rounded-lg transition-all focus:border-notionary-orange focus:ring-2 focus:ring-orange-200
                        ${
                          (article.id === activeDoc.id
                            ? taskInputValue
                            : completedTasks[article.id]) &&
                          !article.task.validate(
                            article.id === activeDoc.id
                              ? taskInputValue
                              : completedTasks[article.id] || ""
                          )
                            ? "border-red-400"
                            : "border-notionary-gray-medium"
                        }
                        ${
                          article.id !== activeDoc.id
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }
                      `}
                            />
                            {(article.id === activeDoc.id
                              ? taskInputValue
                              : completedTasks[article.id]) &&
                              !article.task.validate(
                                article.id === activeDoc.id
                                  ? taskInputValue
                                  : completedTasks[article.id] || ""
                              ) && (
                                <p className="mt-2 text-sm text-red-500">
                                  {getErrorMessage(article)}
                                </p>
                              )}

                            {/* 완료된 작업에는 체크 표시 */}
                            {article.id !== activeDoc.id &&
                              completedTasks[article.id] && (
                                <div className="flex items-center mt-2 text-sm text-green-600">
                                  <span className="mr-2">✅</span>
                                  완료됨
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })
            ) : (
              <section className="flex items-center justify-center flex-shrink-0 min-h-full p-4 pt-20">
                <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl sm:p-10 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <article className="prose-sm prose sm:prose-base lg:prose-lg max-w-none">
                    {(() => {
                      const Component = completion.component;
                      return <Component />;
                    })()}
                  </article>
                </div>
              </section>
            )}
          </main>

          <footer className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/10 to-transparent">
            <div className="container flex items-center justify-between max-w-xs mx-auto">
              {!isCompleted ? (
                <>
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!prevDoc}
                    className="px-8 py-3 font-semibold rounded-full shadow-lg bg-white/80 backdrop-blur-sm text-notionary-text-primary hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {nextDoc ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNext();
                      }}
                      disabled={!isTaskCompleted}
                      className="px-8 py-3 font-semibold text-white rounded-full shadow-lg bg-notionary-orange hover:bg-notionary-orange-dark disabled:bg-notionary-gray-medium disabled:text-notionary-text-light disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isTaskCompleted}
                      className="px-8 py-3 font-semibold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 disabled:bg-notionary-gray-medium disabled:text-notionary-text-light disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "저장 중..." : "완료"}
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="flex-grow px-8 py-3 font-semibold shadow-lg cursor-pointer rounded-2xl bg-white/80 backdrop-blur-sm text-notionary-text-primary hover:bg-white disabled:opacity-50"
                >
                  설정이 완료되었습니다! 🎉
                </button>
              )}
            </div>
          </footer>

          {/* 디버깅 패널 (필요시 주석 해제) */}
          {/* 
      <div className="fixed z-50 p-4 font-mono text-sm bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg bottom-4 left-4">
        <h4 className="font-bold text-yellow-800">Debug Info</h4>
        <div className="mt-2">
          <p>
            <span className="font-semibold">Active Page:</span> {activeDoc.id}
          </p>
          <p>
            <span className="font-semibold">Input Value:</span> "{taskInputValue}"
          </p>
          <p>
            <span className="font-semibold">Task Completed:</span> {isTaskCompleted.toString()}
          </p>
          <p>
            <span className="font-semibold">API Key:</span> {completedTasks["guide-2-notion-api"] ? "✅" : "❌"}
          </p>
          <p>
            <span className="font-semibold">Notion Link:</span> {completedTasks["guide-3-notion-link"] ? "✅" : "❌"}
          </p>
        </div>
      </div>
      */}
        </fetcher.Form>
      )}
    </div>
  );
};

export default Main;
