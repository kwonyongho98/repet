import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole, AuthState } from "../types/auth";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // 로그인 (더미 데이터)
      login: async (email: string, password: string, role: UserRole) => {
        // 실제로는 API 호출
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (password === "1234") {
          const user: User = {
            id: role === "family" ? "user-1" : "provider-1",
            email,
            name: role === "family" ? "김철수" : "행복 애견 호텔",
            role,
            providerId: role === "provider" ? "1" : undefined,
          };

          set({ user, isAuthenticated: true });
          return true;
        }

        return false;
      },

      // 로그아웃
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
