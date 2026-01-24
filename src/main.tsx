import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./index.css";

// 개발 모드 설정
if (import.meta.env.DEV) {
  // 매번 인증 정보만 초기화
  console.log("🔧 개발 모드: 인증 정보 초기화");
  localStorage.removeItem("auth-storage");

  // Ctrl+Shift+D로 전체 초기화
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      console.log("🧹 전체 localStorage 초기화!");
      localStorage.clear();
      window.location.reload();
    }
  });

  console.log(
    "💡 Tip: Ctrl+Shift+D를 눌러 전체 데이터를 초기화할 수 있습니다.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
