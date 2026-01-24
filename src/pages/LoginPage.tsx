import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import type { UserRole } from "../types/auth";
import { PawPrint, Store, ArrowRight } from "lucide-react";
import { Button, Input } from "../components/common";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("역할을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await login(email, password, selectedRole);

    if (success) {
      if (selectedRole === "family") {
        navigate("/");
      } else {
        navigate("/provider/dashboard");
      }
    } else {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lineart-to-br from-orange-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            R
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            Repet에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600 mt-2">가족 공유 펫 기록 관리 시스템</p>
        </div>

        {/* 역할 선택 */}
        {!selectedRole ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-4">
            <h2
              className="text-xl font-bold text-center mb-6"
              style={{ color: "var(--color-secondary-900)" }}
            >
              어떤 역할로 로그인하시겠어요?
            </h2>

            <button
              onClick={() => handleRoleSelect("family")}
              className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <PawPrint
                      size={24}
                      className="text-orange-500 group-hover:text-white"
                    />
                  </div>
                  <div className="text-left">
                    <h3
                      className="font-bold text-lg"
                      style={{ color: "var(--color-secondary-900)" }}
                    >
                      가족 구성원
                    </h3>
                    <p className="text-sm text-gray-600">
                      반려견 기록 관리 및 서비스 예약
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={24}
                  className="text-gray-400 group-hover:text-orange-500"
                />
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("provider")}
              className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-900 transition-colors">
                    <Store
                      size={24}
                      className="text-blue-900 group-hover:text-white"
                    />
                  </div>
                  <div className="text-left">
                    <h3
                      className="font-bold text-lg"
                      style={{ color: "var(--color-secondary-900)" }}
                    >
                      업체 사장님
                    </h3>
                    <p className="text-sm text-gray-600">
                      예약 관리 및 코멘트 작성
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={24}
                  className="text-gray-400 group-hover:text-blue-900"
                />
              </div>
            </button>
          </div>
        ) : (
          /* 로그인 폼 */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← 뒤로 가기
            </button>

            <div className="text-center mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white mx-auto mb-3 ${
                  selectedRole === "family" ? "bg-orange-500" : "bg-blue-900"
                }`}
              >
                {selectedRole === "family" ? (
                  <PawPrint size={24} />
                ) : (
                  <Store size={24} />
                )}
              </div>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--color-secondary-900)" }}
              >
                {selectedRole === "family"
                  ? "가족 구성원 로그인"
                  : "업체 사장님 로그인"}
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="이메일"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--color-primary-50)",
                  color: "var(--color-text-secondary)",
                }}
              >
                💡 <strong>테스트 계정:</strong> 비밀번호는{" "}
                <code className="bg-white px-2 py-1 rounded">1234</code>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                로그인
              </Button>

              <div className="text-center">
                <a
                  href="#"
                  className="text-sm"
                  style={{ color: "var(--color-primary)" }}
                >
                  비밀번호를 잊으셨나요?
                </a>
              </div>
            </form>
          </div>
        )}

        {/* 하단 링크 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <a
            href="#"
            className="font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}
