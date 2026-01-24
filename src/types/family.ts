export type FamilyRole = "owner" | "admin" | "member";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: FamilyRole;
  avatar?: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface FamilyInvite {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
  usedAt?: string;
}
