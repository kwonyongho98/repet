export type UserRole = "family" | "provider";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  providerId?: string; // 사장님인 경우 업체 ID
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}
