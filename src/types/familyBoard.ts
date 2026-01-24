// ============================================
// Family Board Types - 가족 공유 보드 (냉장고 스타일)
// ============================================

// To-Do 아이템
export interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
  completedBy?: string; // 완료한 사람 이름
  completedAt?: string; // 완료 시간
  createdBy: string; // 생성한 사람
  createdAt: string;
  dueDate?: string; // 마감일 (선택)
  petId?: string; // 특정 반려견과 연관 (선택)
  petName?: string;
}

// 고정 메모 (Pinned Note)
export interface PinnedNote {
  id: string;
  title: string;
  content: string;
  color: string; // 메모 색상 (포스트잇 느낌)
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  petId?: string; // 특정 반려견과 연관 (선택)
  petName?: string;
}

// 가족 보드 전체
export interface FamilyBoard {
  todos: TodoItem[];
  notes: PinnedNote[];
}

// 메모 색상 옵션
export const noteColors = [
  { id: "yellow", color: "#fef3c7", label: "노랑" },
  { id: "pink", color: "#fce7f3", label: "분홍" },
  { id: "blue", color: "#dbeafe", label: "파랑" },
  { id: "green", color: "#d1fae5", label: "초록" },
  { id: "purple", color: "#ede9fe", label: "보라" },
  { id: "orange", color: "#ffedd5", label: "주황" },
];

// 기본 색상
export const defaultNoteColor = "#fef3c7"; // 노랑
