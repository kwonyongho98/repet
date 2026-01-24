import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TodoItem, PinnedNote } from "../types/familyBoard";
import { defaultNoteColor } from "../types/familyBoard";

interface FamilyBoardState {
  // 데이터
  todos: TodoItem[];
  notes: PinnedNote[];

  // To-Do 관련
  addTodo: (todo: Omit<TodoItem, "id" | "createdAt" | "isCompleted">) => void;
  toggleTodo: (id: string, completedBy: string) => void;
  updateTodo: (id: string, todo: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;

  // 메모 관련
  addNote: (
    note: Omit<PinnedNote, "id" | "createdAt" | "updatedAt" | "isPinned">,
  ) => void;
  updateNote: (id: string, note: Partial<PinnedNote>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // 조회 함수
  getIncompleteTodos: () => TodoItem[];
  getCompletedTodos: () => TodoItem[];
  getTodosByPet: (petId: string) => TodoItem[];
  getPinnedNotes: () => PinnedNote[];
  getNotesByPet: (petId: string) => PinnedNote[];
}

export const useFamilyBoardStore = create<FamilyBoardState>()(
  persist(
    (set, get) => ({
      // 초기 데이터 (샘플)
      todos: [
        {
          id: "todo-1",
          text: "멍멍이 산책시키기",
          isCompleted: false,
          createdBy: "엄마",
          createdAt: new Date().toISOString(),
          petId: "1",
          petName: "멍멍이",
        },
        {
          id: "todo-2",
          text: "사료 주문하기",
          isCompleted: true,
          completedBy: "아빠",
          completedAt: new Date().toISOString(),
          createdBy: "엄마",
          createdAt: new Date().toISOString(),
        },
        {
          id: "todo-3",
          text: "뭉치 예방접종 예약",
          isCompleted: false,
          createdBy: "아빠",
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          petId: "2",
          petName: "뭉치",
        },
      ],
      notes: [
        {
          id: "note-1",
          title: "🏥 병원 정보",
          content: "해피동물병원\n☎️ 02-1234-5678\n⏰ 평일 9-8, 토 9-5",
          color: "#dbeafe", // 파랑
          createdBy: "엄마",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: true,
        },
        {
          id: "note-2",
          title: "📋 멍멍이 알레르기",
          content: "닭고기, 밀 주의!\n간식 줄 때 확인하기",
          color: "#fce7f3", // 분홍
          createdBy: "아빠",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: true,
          petId: "1",
          petName: "멍멍이",
        },
      ],

      // ============================================
      // To-Do 관련 함수
      // ============================================
      addTodo: (todo) => {
        const newTodo: TodoItem = {
          ...todo,
          id: `todo-${Date.now()}`,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ todos: [...state.todos, newTodo] }));
      },

      toggleTodo: (id, completedBy) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  isCompleted: !todo.isCompleted,
                  completedBy: !todo.isCompleted ? completedBy : undefined,
                  completedAt: !todo.isCompleted
                    ? new Date().toISOString()
                    : undefined,
                }
              : todo,
          ),
        }));
      },

      updateTodo: (id, todoUpdate) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...todoUpdate } : todo,
          ),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      // ============================================
      // 메모 관련 함수
      // ============================================
      addNote: (note) => {
        const newNote: PinnedNote = {
          ...note,
          id: `note-${Date.now()}`,
          color: note.color || defaultNoteColor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: true, // 새 메모는 기본적으로 고정
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
      },

      updateNote: (id, noteUpdate) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...noteUpdate, updatedAt: new Date().toISOString() }
              : note,
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      togglePinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned } : note,
          ),
        }));
      },

      // ============================================
      // 조회 함수
      // ============================================
      getIncompleteTodos: () => {
        return get().todos.filter((todo) => !todo.isCompleted);
      },

      getCompletedTodos: () => {
        return get().todos.filter((todo) => todo.isCompleted);
      },

      getTodosByPet: (petId) => {
        return get().todos.filter((todo) => todo.petId === petId);
      },

      getPinnedNotes: () => {
        return get().notes.filter((note) => note.isPinned);
      },

      getNotesByPet: (petId) => {
        return get().notes.filter((note) => note.petId === petId);
      },
    }),
    {
      name: "family-board-storage",
    },
  ),
);
