import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Check,
  Trash2,
  Pin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// Stores
import { usePetStore } from "../../stores/usePetStore";
import { useDailyLogStore } from "../../stores/useDailyLogStore";
import { useFamilyBoardStore } from "../../stores/useFamilyBoardStore";
import { useAuthStore } from "../../stores/useAuthStore";

// Components
import { Button, Input, TextArea, Badge, BottomSheet } from "../../components/common";
import { DailyTracker } from "../../components/familyBoard/DailyTracker";
import { MealSection } from "../../components/familyBoard/MealSection";
import { BowelSection } from "../../components/familyBoard/BowelSection";
import { WalkSection } from "../../components/familyBoard/WalkSection";

// Types
import type {
  MealType,
  FoodType,
  BowelType,
  BowelCondition,
} from "../../types/dailyLog";
import {
  cuteMealTypeLabels,
  cuteFoodTypeLabels,
  cuteBowelTypeLabels,
  cuteBowelConditionLabels,
} from "../../types/dailyLog";
import { noteColors, defaultNoteColor } from "../../types/familyBoard";

// ============================================
// Main Component
// ============================================
export default function FamilyBoardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Pets
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId),
    [pets, selectedPetId]
  );

  // Daily Log Store
  const mealLogs = useDailyLogStore((state) => state.mealLogs);
  const bowelLogs = useDailyLogStore((state) => state.bowelLogs);
  const walkLogs = useDailyLogStore((state) => state.walkLogs);
  const addMealLog = useDailyLogStore((state) => state.addMealLog);
  const addBowelLog = useDailyLogStore((state) => state.addBowelLog);

  // Family Board Store
  const todos = useFamilyBoardStore((state) => state.todos);
  const notes = useFamilyBoardStore((state) => state.notes);
  const addTodo = useFamilyBoardStore((state) => state.addTodo);
  const toggleTodo = useFamilyBoardStore((state) => state.toggleTodo);
  const deleteTodo = useFamilyBoardStore((state) => state.deleteTodo);
  const addNote = useFamilyBoardStore((state) => state.addNote);
  const deleteNote = useFamilyBoardStore((state) => state.deleteNote);

  // Today
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "M월 d일 (EEEE)", { locale: ko });

  // Today's logs for this pet
  const todayMeals = useMemo(
    () =>
      mealLogs.filter(
        (m) => m.date === today && m.petId === selectedPetId
      ),
    [mealLogs, today, selectedPetId]
  );

  const todayBowels = useMemo(
    () =>
      bowelLogs.filter(
        (b) => b.date === today && b.petId === selectedPetId
      ),
    [bowelLogs, today, selectedPetId]
  );

  const todayWalks = useMemo(
    () =>
      walkLogs.filter(
        (w) => w.date === today && w.petId === selectedPetId
      ),
    [walkLogs, today, selectedPetId]
  );

  // ============================================
  // Bottom Sheet States
  // ============================================
  const [isMealSheetOpen, setIsMealSheetOpen] = useState(false);
  const [isBowelSheetOpen, setIsBowelSheetOpen] = useState(false);

  // Form States
  const [mealForm, setMealForm] = useState({
    time: format(new Date(), "HH:mm"),
    mealType: "breakfast" as MealType,
    foodType: "dry" as FoodType,
    foodName: "",
    amount: "",
    medsTaken: false,
    medsName: "",
  });

  const [bowelForm, setBowelForm] = useState({
    time: format(new Date(), "HH:mm"),
    bowelType: "both" as BowelType,
    condition: "good" as BowelCondition,
    notes: "",
  });

  const [todoForm, setTodoForm] = useState({ text: "", createdBy: "나" });
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    color: defaultNoteColor,
    createdBy: "나",
  });

  // ============================================
  // Handlers
  // ============================================
  const handleMealSubmit = () => {
    if (!selectedPet || !mealForm.amount) return;
    addMealLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      time: mealForm.time,
      mealType: mealForm.mealType,
      foodType: mealForm.foodType,
      foodName: mealForm.foodName || undefined,
      amount: parseFloat(mealForm.amount),
      medsTaken: mealForm.medsTaken,
      medsName: mealForm.medsName || undefined,
    });
    setIsMealSheetOpen(false);
    setMealForm({
      time: format(new Date(), "HH:mm"),
      mealType: "breakfast",
      foodType: "dry",
      foodName: "",
      amount: "",
      medsTaken: false,
      medsName: "",
    });
  };

  const handleBowelSubmit = () => {
    if (!selectedPet) return;
    addBowelLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      time: bowelForm.time,
      bowelType: bowelForm.bowelType,
      condition: bowelForm.condition,
      notes: bowelForm.notes || undefined,
    });
    setIsBowelSheetOpen(false);
    setBowelForm({
      time: format(new Date(), "HH:mm"),
      bowelType: "both",
      condition: "good",
      notes: "",
    });
  };

  const handleTodoSubmit = () => {
    if (!todoForm.text.trim()) return;
    addTodo({
      text: todoForm.text,
      petId: selectedPet?.id,
      petName: selectedPet?.name,
      createdBy: todoForm.createdBy,
    });
    setTodoForm({ text: "", createdBy: "나" });
  };

  const handleNoteSubmit = () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    addNote({
      title: noteForm.title,
      content: noteForm.content,
      color: noteForm.color,
      petId: selectedPet?.id,
      petName: selectedPet?.name,
      createdBy: noteForm.createdBy,
    });
    setNoteForm({
      title: "",
      content: "",
      color: defaultNoteColor,
      createdBy: "나",
    });
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* ============================================ */}
      {/* Header */}
      {/* ============================================ */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={22} className="text-gray-700 dark:text-gray-200" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              👨‍👩‍👧 우리 가족 보드
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {todayLabel} · {selectedPet?.name || "반려견 선택"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-24">
        {/* ============================================ */}
        {/* Daily Tracker Summary */}
        {/* ============================================ */}
        <DailyTracker
          mealCount={todayMeals.length}
          bowelCount={todayBowels.length}
          walkCount={todayWalks.length}
          totalWalkMinutes={todayWalks.reduce((sum, w) => sum + w.duration, 0)}
        />

        {/* ============================================ */}
        {/* Meal Section */}
        {/* ============================================ */}
        <MealSection
          meals={todayMeals}
          onAddClick={() => setIsMealSheetOpen(true)}
        />

        {/* ============================================ */}
        {/* Bowel Section */}
        {/* ============================================ */}
        <BowelSection
          bowels={todayBowels}
          onAddClick={() => setIsBowelSheetOpen(true)}
        />

        {/* ============================================ */}
        {/* Walk Section */}
        {/* ============================================ */}
        <WalkSection walks={todayWalks} />

        {/* ============================================ */}
        {/* To-Do Section */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Check size={18} className="text-green-500" /> 할 일 목록
          </h3>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="새 할일 입력..."
              value={todoForm.text}
              onChange={(e) =>
                setTodoForm({ ...todoForm, text: e.target.value })
              }
              className="flex-1"
            />
            <Button variant="primary" onClick={handleTodoSubmit}>
              <Plus size={18} />
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  todo.isCompleted
                    ? "bg-gray-50 dark:bg-slate-700/50"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id, "나")}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    todo.isCompleted
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 dark:border-slate-500"
                  }`}
                >
                  {todo.isCompleted && (
                    <Check size={14} className="text-white" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm block ${
                      todo.isCompleted
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.completedBy && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ✓ {todo.completedBy}
                    </span>
                  )}
                </div>
                {todo.petName && <Badge variant="info">{todo.petName}</Badge>}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                아직 할 일이 없어요 ✨
              </p>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* Notes Section */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Pin size={18} className="text-orange-500" /> 메모
          </h3>
          <div className="space-y-2 mb-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl">
            <Input
              placeholder="메모 제목"
              value={noteForm.title}
              onChange={(e) =>
                setNoteForm({ ...noteForm, title: e.target.value })
              }
            />
            <TextArea
              placeholder="메모 내용..."
              rows={2}
              value={noteForm.content}
              onChange={(e) =>
                setNoteForm({ ...noteForm, content: e.target.value })
              }
            />
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                색상:
              </span>
              {noteColors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNoteForm({ ...noteForm, color: c.color })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    noteForm.color === c.color
                      ? "border-gray-800 dark:border-white"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
              <Button
                variant="primary"
                size="sm"
                className="ml-auto rounded-xl"
                onClick={handleNoteSubmit}
              >
                추가
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-2xl relative"
                style={{ backgroundColor: note.color }}
              >
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
                <p className="font-medium text-sm mb-1 text-gray-800">
                  {note.title}
                </p>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {note.content}
                </p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 col-span-2">
                메모를 추가해보세요 📝
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* Meal Bottom Sheet */}
      {/* ============================================ */}
      <BottomSheet
        isOpen={isMealSheetOpen}
        onClose={() => setIsMealSheetOpen(false)}
        title={`🍚 ${selectedPet?.name || "반려견"}의 밥 기록`}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <span className="text-5xl">🍽️</span>
          </div>
          <Input
            label="먹은 시간"
            type="time"
            value={mealForm.time}
            onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              어떤 끼니였어요?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(cuteMealTypeLabels) as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealForm({ ...mealForm, mealType: type })}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all ${
                    mealForm.mealType === type
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cuteMealTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              뭘 먹었어요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteFoodTypeLabels) as FoodType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealForm({ ...mealForm, foodType: type })}
                  className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all ${
                    mealForm.foodType === type
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cuteFoodTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="얼마나 먹었어요? (g)"
            type="number"
            placeholder="150"
            value={mealForm.amount}
            onChange={(e) =>
              setMealForm({ ...mealForm, amount: e.target.value })
            }
          />
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <input
              type="checkbox"
              id="medsTakenBoard"
              checked={mealForm.medsTaken}
              onChange={(e) =>
                setMealForm({ ...mealForm, medsTaken: e.target.checked })
              }
              className="w-5 h-5 rounded"
            />
            <label
              htmlFor="medsTakenBoard"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              💊 약도 먹었어요!
            </label>
          </div>
          {mealForm.medsTaken && (
            <Input
              label="무슨 약이에요?"
              placeholder="심장약, 관절영양제..."
              value={mealForm.medsName}
              onChange={(e) =>
                setMealForm({ ...mealForm, medsName: e.target.value })
              }
            />
          )}
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleMealSubmit}
          >
            🍚 냠냠 완료!
          </Button>
        </div>
      </BottomSheet>

      {/* ============================================ */}
      {/* Bowel Bottom Sheet */}
      {/* ============================================ */}
      <BottomSheet
        isOpen={isBowelSheetOpen}
        onClose={() => setIsBowelSheetOpen(false)}
        title={`💩 ${selectedPet?.name || "반려견"}의 배변 기록`}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <span className="text-5xl">🚽</span>
          </div>
          <Input
            label="언제 했어요?"
            type="time"
            value={bowelForm.time}
            onChange={(e) =>
              setBowelForm({ ...bowelForm, time: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              뭘 했어요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteBowelTypeLabels) as BowelType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setBowelForm({ ...bowelForm, bowelType: type })
                    }
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      bowelForm.bowelType === type
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {cuteBowelTypeLabels[type]}
                  </button>
                )
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상태는요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteBowelConditionLabels) as BowelCondition[]).map(
                (cond) => (
                  <button
                    key={cond}
                    onClick={() =>
                      setBowelForm({ ...bowelForm, condition: cond })
                    }
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      bowelForm.condition === cond
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {cuteBowelConditionLabels[cond]}
                  </button>
                )
              )}
            </div>
          </div>
          <TextArea
            label="메모 📝"
            placeholder="특이사항이 있다면..."
            rows={2}
            value={bowelForm.notes}
            onChange={(e) =>
              setBowelForm({ ...bowelForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleBowelSubmit}
          >
            💩 기록 완료!
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
