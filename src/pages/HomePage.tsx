import { useState } from "react";
import {
  Card,
  Button,
  Badge,
  BottomSheet,
  Input,
  Select,
  TextArea,
} from "../components/common";
import {
  Dog,
  PawPrint,
  Utensils,
  Circle,
  ClipboardList,
  Scale,
  Wallet,
  Plus,
  Check,
  Trash2,
  Pin,
} from "lucide-react";
import { usePetStore } from "../stores/usePetStore";
import { useCalendarStore } from "../stores/useCalendarStore";
import { useServiceStore } from "../stores/useServiceStore";
import { useDailyLogStore } from "../stores/useDailyLogStore";
import { useFamilyBoardStore } from "../stores/useFamilyBoardStore";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import type {
  Satisfaction,
  MealType,
  FoodType,
  BowelType,
  BowelCondition,
  ExpenseCategory,
} from "../types/dailyLog";
import {
  satisfactionLabels,
  mealTypeLabels,
  foodTypeLabels,
  bowelTypeLabels,
  bowelConditionLabels,
  expenseCategoryLabels,
} from "../types/dailyLog";
import { noteColors, defaultNoteColor } from "../types/familyBoard";

type QuickActionType =
  | "walk"
  | "meal"
  | "bowel"
  | "board"
  | "weight"
  | "expense"
  | null;

const serviceTypeLabels: Record<string, string> = {
  hotel: "호텔",
  training: "훈련",
  grooming: "미용",
  hospital: "병원",
};

export default function HomePage() {
  const navigate = useNavigate();
  const pets = usePetStore((state) => state.pets);
  const events = useCalendarStore((state) => state.events);

  // Daily Log Store
  const addWalkLog = useDailyLogStore((state) => state.addWalkLog);
  const addMealLog = useDailyLogStore((state) => state.addMealLog);
  const addBowelLog = useDailyLogStore((state) => state.addBowelLog);
  const addWeightLog = useDailyLogStore((state) => state.addWeightLog);
  const addExpenseLog = useDailyLogStore((state) => state.addExpenseLog);
  const getLogsByDate = useDailyLogStore((state) => state.getLogsByDate);

  // Family Board Store
  const todos = useFamilyBoardStore((state) => state.todos);
  const notes = useFamilyBoardStore((state) => state.notes);
  const addTodo = useFamilyBoardStore((state) => state.addTodo);
  const toggleTodo = useFamilyBoardStore((state) => state.toggleTodo);
  const deleteTodo = useFamilyBoardStore((state) => state.deleteTodo);
  const addNote = useFamilyBoardStore((state) => state.addNote);
  const deleteNote = useFamilyBoardStore((state) => state.deleteNote);

  // Service Store - 최근 리포트
  const getRecentComments = useServiceStore((state) => state.getRecentComments);
  const recentReports = getRecentComments(3);

  // Quick Action 상태
  const [activeSheet, setActiveSheet] = useState<QuickActionType>(null);

  // 오늘 날짜
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLogs = getLogsByDate(today);

  // 폼 상태들
  const [walkForm, setWalkForm] = useState({
    petId: pets[0]?.id || "",
    startTime: format(new Date(), "HH:mm"),
    endTime: "",
    distance: "",
    distanceUnit: "km" as "km" | "m",
    satisfaction: "good" as Satisfaction,
    notes: "",
  });

  const [mealForm, setMealForm] = useState({
    petId: pets[0]?.id || "",
    time: format(new Date(), "HH:mm"),
    mealType: "breakfast" as MealType,
    foodType: "dry" as FoodType,
    foodName: "",
    amount: "",
    medsTaken: false,
    medsName: "",
  });

  const [bowelForm, setBowelForm] = useState({
    petId: pets[0]?.id || "",
    time: format(new Date(), "HH:mm"),
    bowelType: "both" as BowelType,
    condition: "good" as BowelCondition,
    notes: "",
  });

  const [weightForm, setWeightForm] = useState({
    petId: pets[0]?.id || "",
    weight: "",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    petId: pets[0]?.id || "",
    amount: "",
    category: "food" as ExpenseCategory,
    description: "",
    notes: "",
  });

  const [todoForm, setTodoForm] = useState({
    text: "",
    petId: "",
    createdBy: "나",
  });

  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    color: defaultNoteColor,
    petId: "",
    createdBy: "나",
  });

  // 다가오는 일정 (7일 이내)
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.start);
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= sevenDaysLater;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  // Quick Action 아이콘 데이터
  const quickActions = [
    {
      type: "walk" as const,
      icon: PawPrint,
      label: "산책",
      color: "#22c55e",
      bgColor: "#dcfce7",
    },
    {
      type: "meal" as const,
      icon: Utensils,
      label: "식사",
      color: "#f97316",
      bgColor: "#ffedd5",
    },
    {
      type: "bowel" as const,
      icon: Circle,
      label: "배변",
      color: "#a16207",
      bgColor: "#fef3c7",
    },
    {
      type: "board" as const,
      icon: ClipboardList,
      label: "가족보드",
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      type: "weight" as const,
      icon: Scale,
      label: "체중",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
    {
      type: "expense" as const,
      icon: Wallet,
      label: "지출",
      color: "#ec4899",
      bgColor: "#fce7f3",
    },
  ];

  // 폼 제출 핸들러들
  const handleWalkSubmit = () => {
    const pet = pets.find((p) => p.id === walkForm.petId);
    if (!pet || !walkForm.endTime) return;

    const start = new Date(`${today}T${walkForm.startTime}`);
    const end = new Date(`${today}T${walkForm.endTime}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    addWalkLog({
      petId: pet.id,
      petName: pet.name,
      date: today,
      startTime: walkForm.startTime,
      endTime: walkForm.endTime,
      duration,
      distance: walkForm.distance ? parseFloat(walkForm.distance) : undefined,
      distanceUnit: walkForm.distanceUnit,
      satisfaction: walkForm.satisfaction,
      notes: walkForm.notes || undefined,
    });

    setActiveSheet(null);
    resetWalkForm();
  };

  const handleMealSubmit = () => {
    const pet = pets.find((p) => p.id === mealForm.petId);
    if (!pet || !mealForm.amount) return;

    addMealLog({
      petId: pet.id,
      petName: pet.name,
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
    const pet = pets.find((p) => p.id === bowelForm.petId);
    if (!pet) return;

    addBowelLog({
      petId: pet.id,
      petName: pet.name,
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
    const pet = pets.find((p) => p.id === weightForm.petId);
    if (!pet || !weightForm.weight) return;

    addWeightLog({
      petId: pet.id,
      petName: pet.name,
      date: today,
      weight: parseFloat(weightForm.weight),
      notes: weightForm.notes || undefined,
    });

    setActiveSheet(null);
    resetWeightForm();
  };

  const handleExpenseSubmit = () => {
    const pet = pets.find((p) => p.id === expenseForm.petId);
    if (!pet || !expenseForm.amount || !expenseForm.description) return;

    addExpenseLog({
      petId: pet.id,
      petName: pet.name,
      date: today,
      amount: parseInt(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      notes: expenseForm.notes || undefined,
    });

    setActiveSheet(null);
    resetExpenseForm();
  };

  const handleTodoSubmit = () => {
    if (!todoForm.text) return;

    const pet = pets.find((p) => p.id === todoForm.petId);

    addTodo({
      text: todoForm.text,
      createdBy: todoForm.createdBy,
      petId: todoForm.petId || undefined,
      petName: pet?.name,
    });

    setTodoForm({ text: "", petId: "", createdBy: "나" });
  };

  const handleNoteSubmit = () => {
    if (!noteForm.title || !noteForm.content) return;

    const pet = pets.find((p) => p.id === noteForm.petId);

    addNote({
      title: noteForm.title,
      content: noteForm.content,
      color: noteForm.color,
      createdBy: noteForm.createdBy,
      petId: noteForm.petId || undefined,
      petName: pet?.name,
    });

    setNoteForm({
      title: "",
      content: "",
      color: defaultNoteColor,
      petId: "",
      createdBy: "나",
    });
  };

  // 폼 리셋 함수들
  const resetWalkForm = () => {
    setWalkForm({
      petId: pets[0]?.id || "",
      startTime: format(new Date(), "HH:mm"),
      endTime: "",
      distance: "",
      distanceUnit: "km",
      satisfaction: "good",
      notes: "",
    });
  };

  const resetMealForm = () => {
    setMealForm({
      petId: pets[0]?.id || "",
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
      petId: pets[0]?.id || "",
      time: format(new Date(), "HH:mm"),
      bowelType: "both",
      condition: "good",
      notes: "",
    });
  };

  const resetWeightForm = () => {
    setWeightForm({
      petId: pets[0]?.id || "",
      weight: "",
      notes: "",
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      petId: pets[0]?.id || "",
      amount: "",
      category: "food",
      description: "",
      notes: "",
    });
  };

  const incompleteTodos = todos.filter((t) => !t.isCompleted);

  return (
    <div className="space-y-6 pb-6">
      {/* 헤더 */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-secondary-900)" }}
        >
          안녕하세요! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {format(new Date(), "M월 d일 EEEE", { locale: ko })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-3">오늘 기록하기</p>
        <div className="grid grid-cols-6 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.type}
              onClick={() => setActiveSheet(action.type)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:scale-105 transition-transform"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: action.bgColor }}
              >
                <action.icon size={24} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 오늘의 기록 요약 */}
      {(todayLogs.walks.length > 0 ||
        todayLogs.meals.length > 0 ||
        todayLogs.bowels.length > 0) && (
        <Card title="📊 오늘의 기록">
          <div className="space-y-3">
            {todayLogs.walks.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                <PawPrint size={18} className="text-green-600" />
                <span className="text-sm">
                  산책 {todayLogs.walks.length}회 · 총{" "}
                  {todayLogs.walks.reduce((sum, w) => sum + w.duration, 0)}분
                </span>
              </div>
            )}
            {todayLogs.meals.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                <Utensils size={18} className="text-orange-600" />
                <span className="text-sm">
                  식사 {todayLogs.meals.length}회 · 총{" "}
                  {todayLogs.meals.reduce((sum, m) => sum + m.amount, 0)}g
                  {todayLogs.meals.some((m) => m.medsTaken) && " · 💊 약 복용"}
                </span>
              </div>
            )}
            {todayLogs.bowels.length > 0 && (
              <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                <Circle size={18} className="text-amber-700" />
                <span className="text-sm">
                  배변 {todayLogs.bowels.length}회
                  {todayLogs.bowels.some((b) => b.condition !== "good") &&
                    " · ⚠️ 상태 확인"}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 반려견 목록 */}
      {pets.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="flex-shrink-0 flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/pets")}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: pet.color }}
              >
                {pet.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{pet.name}</p>
                <p className="text-xs text-gray-500">{pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 가족 보드 미리보기 */}
      {(incompleteTodos.length > 0 || notes.length > 0) && (
        <Card title="📋 가족 보드">
          <div className="space-y-3">
            {/* To-Do 미리보기 */}
            {incompleteTodos.slice(0, 3).map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => toggleTodo(todo.id, "나")}
                  className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center hover:border-orange-500"
                >
                  {todo.isCompleted && (
                    <Check size={12} className="text-orange-500" />
                  )}
                </button>
                <span className="text-sm flex-1">{todo.text}</span>
                {todo.petName && <Badge variant="info">{todo.petName}</Badge>}
              </div>
            ))}
            {incompleteTodos.length > 3 && (
              <p className="text-xs text-gray-400 text-center">
                +{incompleteTodos.length - 3}개 더...
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setActiveSheet("board")}
            >
              가족 보드 열기
            </Button>
          </div>
        </Card>
      )}

      {/* 오늘의 리포트 */}
      {recentReports.length > 0 && (
        <Card title="📝 최근 리포트">
          <div className="space-y-3">
            {recentReports.map((report) => {
              const pet = pets.find((p) => p.id === report.petId);
              return (
                <div
                  key={report.id}
                  className="p-3 bg-gradient-to-r from-orange-50 to-white rounded-xl border border-orange-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: pet?.color || "#f97316" }}
                    >
                      {report.petName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.petName}</p>
                      <p className="text-xs text-gray-500">
                        {report.providerName} ·{" "}
                        {serviceTypeLabels[report.serviceType]}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {report.comment}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 다가오는 일정 */}
      {upcomingEvents.length > 0 && (
        <Card title="📅 다가오는 일정">
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const pet = pets.find((p) => p.id === event.petId);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/calendar")}
                >
                  <div
                    className="w-1 h-10 rounded"
                    style={{ backgroundColor: pet?.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.start), "M/d (E) HH:mm", {
                        locale: ko,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 반려견이 없을 때 */}
      {pets.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <Dog className="w-16 h-16 mx-auto mb-4 text-orange-200" />
            <h3 className="text-lg font-bold mb-2 text-gray-800">
              아직 등록된 반려견이 없습니다
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              첫 반려견을 등록하고 시작해보세요!
            </p>
            <Button variant="primary" onClick={() => navigate("/pets")}>
              반려견 등록하기
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================ */}
      {/* Bottom Sheets */}
      {/* ============================================ */}

      {/* 산책 기록 */}
      <BottomSheet
        isOpen={activeSheet === "walk"}
        onClose={() => setActiveSheet(null)}
        title="🐕 산책 기록"
      >
        <div className="space-y-4">
          <Select
            label="반려견"
            value={walkForm.petId}
            onChange={(e) =>
              setWalkForm({ ...walkForm, petId: e.target.value })
            }
            options={pets.map((p) => ({ value: p.id, label: p.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="시작 시간"
              type="time"
              value={walkForm.startTime}
              onChange={(e) =>
                setWalkForm({ ...walkForm, startTime: e.target.value })
              }
            />
            <Input
              label="종료 시간"
              type="time"
              value={walkForm.endTime}
              onChange={(e) =>
                setWalkForm({ ...walkForm, endTime: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="거리"
              type="number"
              step="0.1"
              placeholder="1.5"
              value={walkForm.distance}
              onChange={(e) =>
                setWalkForm({ ...walkForm, distance: e.target.value })
              }
            />
            <Select
              label="단위"
              value={walkForm.distanceUnit}
              onChange={(e) =>
                setWalkForm({
                  ...walkForm,
                  distanceUnit: e.target.value as "km" | "m",
                })
              }
              options={[
                { value: "km", label: "km" },
                { value: "m", label: "m" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              만족도
            </label>
            <div className="flex gap-2">
              {(["good", "normal", "bad"] as Satisfaction[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setWalkForm({ ...walkForm, satisfaction: s })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    walkForm.satisfaction === s
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {satisfactionLabels[s]}
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label="메모"
            placeholder="산책 중 특이사항..."
            rows={2}
            value={walkForm.notes}
            onChange={(e) =>
              setWalkForm({ ...walkForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleWalkSubmit}
          >
            기록 저장
          </Button>
        </div>
      </BottomSheet>

      {/* 식사 기록 */}
      <BottomSheet
        isOpen={activeSheet === "meal"}
        onClose={() => setActiveSheet(null)}
        title="🍖 식사 기록"
      >
        <div className="space-y-4">
          <Select
            label="반려견"
            value={mealForm.petId}
            onChange={(e) =>
              setMealForm({ ...mealForm, petId: e.target.value })
            }
            options={pets.map((p) => ({ value: p.id, label: p.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="시간"
              type="time"
              value={mealForm.time}
              onChange={(e) =>
                setMealForm({ ...mealForm, time: e.target.value })
              }
            />
            <Select
              label="식사 종류"
              value={mealForm.mealType}
              onChange={(e) =>
                setMealForm({
                  ...mealForm,
                  mealType: e.target.value as MealType,
                })
              }
              options={Object.entries(mealTypeLabels).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="사료 종류"
              value={mealForm.foodType}
              onChange={(e) =>
                setMealForm({
                  ...mealForm,
                  foodType: e.target.value as FoodType,
                })
              }
              options={Object.entries(foodTypeLabels).map(([v, l]) => ({
                value: v,
                label: l,
              }))}
            />
            <Input
              label="양 (g)"
              type="number"
              placeholder="150"
              value={mealForm.amount}
              onChange={(e) =>
                setMealForm({ ...mealForm, amount: e.target.value })
              }
            />
          </div>
          <Input
            label="사료명 (선택)"
            placeholder="로얄캐닌 미디엄"
            value={mealForm.foodName}
            onChange={(e) =>
              setMealForm({ ...mealForm, foodName: e.target.value })
            }
          />
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              id="medsTaken"
              checked={mealForm.medsTaken}
              onChange={(e) =>
                setMealForm({ ...mealForm, medsTaken: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label
              htmlFor="medsTaken"
              className="text-sm font-medium text-gray-700"
            >
              💊 약 복용함
            </label>
          </div>
          {mealForm.medsTaken && (
            <Input
              label="약 이름"
              placeholder="심장사상충약"
              value={mealForm.medsName}
              onChange={(e) =>
                setMealForm({ ...mealForm, medsName: e.target.value })
              }
            />
          )}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleMealSubmit}
          >
            기록 저장
          </Button>
        </div>
      </BottomSheet>

      {/* 배변 기록 */}
      <BottomSheet
        isOpen={activeSheet === "bowel"}
        onClose={() => setActiveSheet(null)}
        title="💩 배변 기록"
      >
        <div className="space-y-4">
          <Select
            label="반려견"
            value={bowelForm.petId}
            onChange={(e) =>
              setBowelForm({ ...bowelForm, petId: e.target.value })
            }
            options={pets.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="시간"
            type="time"
            value={bowelForm.time}
            onChange={(e) =>
              setBowelForm({ ...bowelForm, time: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종류
            </label>
            <div className="flex gap-2">
              {(["urine", "feces", "both"] as BowelType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBowelForm({ ...bowelForm, bowelType: t })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    bowelForm.bowelType === t
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {bowelTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <div className="flex gap-2">
              {(["good", "loose", "hard"] as BowelCondition[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setBowelForm({ ...bowelForm, condition: c })}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    bowelForm.condition === c
                      ? c === "good"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {bowelConditionLabels[c]}
                </button>
              ))}
            </div>
          </div>
          <TextArea
            label="메모"
            placeholder="특이사항..."
            rows={2}
            value={bowelForm.notes}
            onChange={(e) =>
              setBowelForm({ ...bowelForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleBowelSubmit}
          >
            기록 저장
          </Button>
        </div>
      </BottomSheet>

      {/* 체중 기록 */}
      <BottomSheet
        isOpen={activeSheet === "weight"}
        onClose={() => setActiveSheet(null)}
        title="⚖️ 체중 기록"
      >
        <div className="space-y-4">
          <Select
            label="반려견"
            value={weightForm.petId}
            onChange={(e) =>
              setWeightForm({ ...weightForm, petId: e.target.value })
            }
            options={pets.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="체중 (kg)"
            type="number"
            step="0.1"
            placeholder="30.5"
            value={weightForm.weight}
            onChange={(e) =>
              setWeightForm({ ...weightForm, weight: e.target.value })
            }
          />
          <TextArea
            label="메모"
            placeholder="특이사항..."
            rows={2}
            value={weightForm.notes}
            onChange={(e) =>
              setWeightForm({ ...weightForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleWeightSubmit}
          >
            기록 저장
          </Button>
        </div>
      </BottomSheet>

      {/* 지출 기록 */}
      <BottomSheet
        isOpen={activeSheet === "expense"}
        onClose={() => setActiveSheet(null)}
        title="💸 지출 기록"
      >
        <div className="space-y-4">
          <Select
            label="반려견"
            value={expenseForm.petId}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, petId: e.target.value })
            }
            options={pets.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Input
            label="금액 (원)"
            type="number"
            placeholder="45000"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
          />
          <Select
            label="카테고리"
            value={expenseForm.category}
            onChange={(e) =>
              setExpenseForm({
                ...expenseForm,
                category: e.target.value as ExpenseCategory,
              })
            }
            options={Object.entries(expenseCategoryLabels).map(([v, l]) => ({
              value: v,
              label: l,
            }))}
          />
          <Input
            label="설명"
            placeholder="로얄캐닌 사료 3kg"
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
          />
          <TextArea
            label="메모"
            placeholder="추가 메모..."
            rows={2}
            value={expenseForm.notes}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, notes: e.target.value })
            }
          />
          <Button
            variant="primary"
            className="w-full"
            onClick={handleExpenseSubmit}
          >
            기록 저장
          </Button>
        </div>
      </BottomSheet>

      {/* 가족 보드 */}
      <BottomSheet
        isOpen={activeSheet === "board"}
        onClose={() => setActiveSheet(null)}
        title="📋 가족 보드"
      >
        <div className="space-y-6">
          {/* To-Do 섹션 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Check size={18} /> 할 일 목록
            </h3>

            {/* 새 할일 추가 */}
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

            {/* 할일 목록 */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    todo.isCompleted
                      ? "bg-gray-100"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id, "나")}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      todo.isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-orange-500"
                    }`}
                  >
                    {todo.isCompleted && (
                      <Check size={12} className="text-white" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      todo.isCompleted ? "line-through text-gray-400" : ""
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

          {/* 메모 섹션 */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Pin size={18} /> 고정 메모
            </h3>

            {/* 새 메모 추가 */}
            <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
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
                <span className="text-xs text-gray-500">색상:</span>
                {noteColors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setNoteForm({ ...noteForm, color: c.color })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      noteForm.color === c.color
                        ? "border-gray-800"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
                <Button
                  variant="primary"
                  size="sm"
                  className="ml-auto"
                  onClick={handleNoteSubmit}
                >
                  추가
                </Button>
              </div>
            </div>

            {/* 메모 목록 */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg relative"
                  style={{ backgroundColor: note.color }}
                >
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500"
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
    </div>
  );
}
