import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, Trash2, Pin } from "lucide-react";
import { format } from "date-fns";

// Stores
import { usePetStore } from "../stores/usePetStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import { useFamilyBoardStore } from "../stores/useFamilyBoardStore";

// Components
import { Button, BottomSheet, Input, TextArea, Badge } from "../components/common";
import {
  PetSelector,
  WalkHeroWidget,
  WalkMapModal,
  InfoWidgetRow,
  QuickActionGridSimple,
  DailyLogFeed,
} from "../components/home";
import type { QuickActionType } from "../components/home";

// Types
import type {
  MealType,
  FoodType,
  BowelType,
  BowelCondition,
  ExpenseCategory,
} from "../types/dailyLog";
import {
  cuteMealTypeLabels,
  cuteFoodTypeLabels,
  cuteBowelTypeLabels,
  cuteBowelConditionLabels,
  cuteExpenseCategoryLabels,
} from "../types/dailyLog";
import { noteColors, defaultNoteColor } from "../types/familyBoard";

// ============================================
// Main Component
// ============================================
export default function HomePage() {
  const navigate = useNavigate();

  // Stores
  const pets = usePetStore((state) => state.pets);
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId),
    [pets, selectedPetId]
  );

  // Daily Log Actions
  const addMealLog = useDailyLogStore((state) => state.addMealLog);
  const addBowelLog = useDailyLogStore((state) => state.addBowelLog);
  const addWeightLog = useDailyLogStore((state) => state.addWeightLog);
  const addExpenseLog = useDailyLogStore((state) => state.addExpenseLog);

  // Family Board
  const todos = useFamilyBoardStore((state) => state.todos);
  const notes = useFamilyBoardStore((state) => state.notes);
  const addTodo = useFamilyBoardStore((state) => state.addTodo);
  const toggleTodo = useFamilyBoardStore((state) => state.toggleTodo);
  const deleteTodo = useFamilyBoardStore((state) => state.deleteTodo);
  const addNote = useFamilyBoardStore((state) => state.addNote);
  const deleteNote = useFamilyBoardStore((state) => state.deleteNote);

  // State
  const [activeSheet, setActiveSheet] = useState<QuickActionType | null>(null);
  const [isWalkModalOpen, setIsWalkModalOpen] = useState(false);

  // Today's date
  const today = format(new Date(), "yyyy-MM-dd");

  // ============================================
  // Form States
  // ============================================
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

  const [weightForm, setWeightForm] = useState({ weight: "", notes: "" });

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "food" as ExpenseCategory,
    description: "",
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
  // Submit Handlers
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

    setActiveSheet(null);
    resetMealForm();
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

    setActiveSheet(null);
    resetBowelForm();
  };

  const handleWeightSubmit = () => {
    if (!selectedPet || !weightForm.weight) return;

    addWeightLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      weight: parseFloat(weightForm.weight),
      notes: weightForm.notes || undefined,
    });

    setActiveSheet(null);
    setWeightForm({ weight: "", notes: "" });
  };

  const handleExpenseSubmit = () => {
    if (!selectedPet || !expenseForm.amount || !expenseForm.description) return;

    addExpenseLog({
      petId: selectedPet.id,
      petName: selectedPet.name,
      date: today,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      notes: expenseForm.notes || undefined,
    });

    setActiveSheet(null);
    setExpenseForm({ amount: "", category: "food", description: "", notes: "" });
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
    setNoteForm({ title: "", content: "", color: defaultNoteColor, createdBy: "나" });
  };

  // Reset Helpers
  const resetMealForm = () => {
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

  const resetBowelForm = () => {
    setBowelForm({
      time: format(new Date(), "HH:mm"),
      bowelType: "both",
      condition: "good",
      notes: "",
    });
  };

  // ============================================
  // Empty State (No Pets)
  // ============================================
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 dark:bg-slate-900">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-6xl">🐕</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          반려견을 등록해주세요!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
          우리 아이와 함께하는
          <br />
          행복한 일상을 기록해보세요 💕
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/home/pets")}
          className="rounded-full px-8"
        >
          <Plus size={18} className="mr-1" />
          우리 아이 등록하기
        </Button>
      </div>
    );
  }

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="pb-4 min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Section 1: Pet Selector */}
      <PetSelector />

      {/* Section 2: Walk Hero Widget */}
      <WalkHeroWidget onStartWalk={() => setIsWalkModalOpen(true)} />

      {/* Section 3: Info Widget Row */}
      <InfoWidgetRow />

      {/* Section 4: Quick Actions */}
      <QuickActionGridSimple onActionClick={setActiveSheet} />

      {/* Section 5: Daily Log Feed */}
      <DailyLogFeed />

      {/* ============================================ */}
      {/* Walk Map Modal (Nike Style) */}
      {/* ============================================ */}
      <WalkMapModal
        isOpen={isWalkModalOpen}
        onClose={() => setIsWalkModalOpen(false)}
      />

      {/* ============================================ */}
      {/* Bottom Sheets */}
      {/* ============================================ */}

      {/* Meal Sheet */}
      <BottomSheet
        isOpen={activeSheet === "meal"}
        onClose={() => setActiveSheet(null)}
        title={`🍽️ ${selectedPet?.name}의 밥 시간`}
      >
        <div className="space-y-4">
          <Input
            label="시간"
            type="time"
            value={mealForm.time}
            onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              식사 종류
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteMealTypeLabels) as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealForm({ ...mealForm, mealType: type })}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
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
              사료 타입
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(cuteFoodTypeLabels) as FoodType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealForm({ ...mealForm, foodType: type })}
                  className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
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
            label="급여량 (g)"
            type="number"
            placeholder="100"
            value={mealForm.amount}
            onChange={(e) => setMealForm({ ...mealForm, amount: e.target.value })}
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleMealSubmit}
          >
            🍽️ 기록 완료!
          </Button>
        </div>
      </BottomSheet>

      {/* Bowel Sheet */}
      <BottomSheet
        isOpen={activeSheet === "bowel"}
        onClose={() => setActiveSheet(null)}
        title={`💩 ${selectedPet?.name}의 응가 체크`}
      >
        <div className="space-y-4">
          <Input
            label="시간"
            type="time"
            value={bowelForm.time}
            onChange={(e) => setBowelForm({ ...bowelForm, time: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              뭘 했어요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteBowelTypeLabels) as BowelType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setBowelForm({ ...bowelForm, bowelType: type })}
                  className={`py-3 px-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    bowelForm.bowelType === type
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cuteBowelTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              상태는요?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(cuteBowelConditionLabels) as BowelCondition[]).map(
                (cond) => (
                  <button
                    key={cond}
                    onClick={() => setBowelForm({ ...bowelForm, condition: cond })}
                    className={`py-2 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                      bowelForm.condition === cond
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
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
            label="특이사항 📝"
            placeholder="건강해 보여요!"
            rows={2}
            value={bowelForm.notes}
            onChange={(e) => setBowelForm({ ...bowelForm, notes: e.target.value })}
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleBowelSubmit}
          >
            ✨ 응가 완료!
          </Button>
        </div>
      </BottomSheet>

      {/* Weight Sheet */}
      <BottomSheet
        isOpen={activeSheet === "weight"}
        onClose={() => setActiveSheet(null)}
        title={`⚖️ ${selectedPet?.name}의 몸무게`}
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <span className="text-6xl">🐕</span>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              오늘의 몸무게를 기록해요!
            </p>
          </div>
          <Input
            label="몸무게 (kg)"
            type="number"
            step="0.1"
            placeholder="30.5"
            value={weightForm.weight}
            onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
          />
          <TextArea
            label="메모 📝"
            placeholder="다이어트 중이에요!"
            rows={2}
            value={weightForm.notes}
            onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleWeightSubmit}
          >
            📊 기록 완료!
          </Button>
        </div>
      </BottomSheet>

      {/* Expense Sheet */}
      <BottomSheet
        isOpen={activeSheet === "expense"}
        onClose={() => setActiveSheet(null)}
        title={`💰 ${selectedPet?.name}의 품위유지비`}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <span className="text-5xl">💸</span>
          </div>
          <Input
            label="얼마 썼어요? (원)"
            type="number"
            placeholder="45000"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              어디에 썼어요?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(cuteExpenseCategoryLabels) as ExpenseCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setExpenseForm({ ...expenseForm, category: cat })}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      expenseForm.category === cat
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {cuteExpenseCategoryLabels[cat]}
                  </button>
                )
              )}
            </div>
          </div>
          <Input
            label="뭘 샀어요?"
            placeholder="로얄캐닌 사료 3kg"
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full rounded-2xl py-3"
            onClick={handleExpenseSubmit}
          >
            💰 지출 기록!
          </Button>
        </div>
      </BottomSheet>

      {/* Family Board Sheet */}
      <BottomSheet
        isOpen={activeSheet === "board"}
        onClose={() => setActiveSheet(null)}
        title="👨‍👩‍👧 우리 가족 보드"
      >
        <div className="space-y-6">
          {/* To-Do */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Check size={18} /> 할 일 목록
            </h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="새 할일 입력..."
                value={todoForm.text}
                onChange={(e) => setTodoForm({ ...todoForm, text: e.target.value })}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleTodoSubmit}>
                <Plus size={18} />
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    todo.isCompleted
                      ? "bg-gray-100 dark:bg-slate-700"
                      : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id, "나")}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      todo.isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 dark:border-slate-500"
                    }`}
                  >
                    {todo.isCompleted && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      todo.isCompleted
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {todo.text}
                  </span>
                  {todo.petName && <Badge variant="info">{todo.petName}</Badge>}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Pin size={18} /> 메모
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
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                  <p className="font-medium text-sm mb-1">{note.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-3">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
        }
        .animate-wave { animation: wave 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
