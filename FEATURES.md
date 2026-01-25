# RePet 앱 기능 정리 📱🐕

## 개요
RePet은 반려동물 케어 관리 애플리케이션으로, React + TypeScript + Zustand + Tailwind CSS로 구축되었습니다.

---

## 🏠 홈 화면 (Refactored Modular Structure)

### 컴포넌트 구조
```
src/components/home/
├── PetSelector.tsx      # 펫 선택 바
├── WalkHeroWidget.tsx   # 산책 히어로 위젯
├── WalkMapModal.tsx     # Nike 스타일 산책 추적기 (NEW)
├── InfoWidgetRow.tsx    # 정보 위젯 가로 스크롤
├── QuickActionGrid.tsx  # 빠른 액션 그리드
├── DailyLogFeed.tsx     # 오늘의 기록 피드
└── index.tsx            # Barrel export
```

### 1. PetSelector (Story Style)
- 상단에 수평 스크롤 방식의 펫 아바타 표시
- 선택된 펫에 링 효과 및 하트 아이콘

### 2. WalkHeroWidget (Full Width Hero)
**Idle State:**
- 그라디언트 배경 (emerald → teal → cyan)
- 날씨 아이콘 + 온도 표시
- "산책 가자!" 텍스트
- [시작하기 ▶] 버튼

**Active State (산책 중):**
- 애니메이션 그라디언트 배경 (orange → pink → purple)
- 실시간 타이머 (HH:MM:SS)
- 이동 거리 표시
- "지도 보기" 버튼

### 3. WalkMapModal (Nike Run Club Style) 🆕
**Full-screen 산책 추적기:**
- 어두운 테마 풀스크린 모달
- 실시간 GPS 추적 (Haversine 거리 계산)
- 대형 타이머 + 거리 HUD
- 💩 **Poop Drop FAB** - 현재 위치에 배변 마커 추가
- 일시정지/재개/종료 컨트롤
- 산책 종료 시 자동 로그 저장

### 4. InfoWidgetRow (Horizontal Scroll)
| 위젯 | 내용 |
|------|------|
| 🐶 함께한 날 | D+xxx 카운터 |
| 🍚 오늘 식사 | 총 섭취량 (g) + 횟수 |
| ⚖️ 최근 체중 | 마지막 체중 기록 |
| 💩 오늘 배변 | 배변 횟수 |

### 5. QuickActionGrid (Squircle Icons)
- 🍽️ 밥, 💩 응가, ⚖️ 몸무게, 👨‍👩‍👧 가족, 💰 지출
- **다크 모드 수정**: `dark:bg-amber-900/40` 등 적용

### 6. DailyLogFeed (Timeline)
- 오늘 기록 시간순 정렬
- 타입별 아이콘 및 색상

---

## 🚶 useWalkStore (Global Walk State) 🆕

### State
```typescript
interface WalkState {
  isTracking: boolean;      // 추적 중 여부
  isPaused: boolean;        // 일시정지 여부
  path: Coordinate[];       // GPS 경로 좌표 배열
  poopLocations: PoopLocation[]; // 💩 마커 위치들
  distance: number;         // 총 이동 거리 (km)
  time: number;             // 경과 시간 (초)
  startTime: Date | null;   // 시작 시간
  currentPosition: Coordinate | null; // 현재 위치
}
```

### Actions
- `startWalk()` - 산책 시작
- `stopWalk()` - 산책 종료 (WalkSummary 반환)
- `pauseWalk()` / `resumeWalk()` - 일시정지/재개
- `updateLocation(lat, lng)` - GPS 좌표 업데이트 (Haversine 거리 계산)
- `dropPoopMarker()` - 현재 위치에 💩 마커 추가
- `incrementTime()` - 타이머 증가 (매초 호출)

### Haversine Formula
```typescript
// 두 GPS 좌표 간 거리 계산 (km)
function calculateDistance(lat1, lon1, lat2, lon2): number
```

---

## 🌙 다크 모드 (Night Walk Mode)

### SideDrawer.tsx 수정사항
- 컨테이너: `bg-white dark:bg-slate-900`
- 보더: `border-gray-100 dark:border-slate-800`
- 텍스트: `text-gray-900 dark:text-gray-100`
- 버튼: `hover:bg-gray-100 dark:hover:bg-slate-800`
- 야간 모드 토글 스위치 추가

### 전체 다크 모드 스타일
| Light | Dark |
|-------|------|
| `bg-white` | `dark:bg-slate-800` |
| `bg-gray-50` | `dark:bg-slate-900` |
| `bg-gray-100` | `dark:bg-slate-700` |
| `text-gray-900` | `dark:text-gray-100` |
| `text-gray-500` | `dark:text-gray-400` |
| `border-gray-100` | `dark:border-slate-700` |

---

## 📖 일기장 (CalendarPage)

- 월간 캘린더 뷰
- 일별 이벤트 및 기록 표시
- 산책, 식사, 배변, 몸무게, 지출 로그 통합

---

## 🏥 서비스 페이지 (ServicePage)

### 뷰 모드
- **지도 뷰**: 마커로 업체 위치 표시
- **목록 뷰**: 카드 형태로 업체 리스트

### 카테고리 필터
- 전체, 병원, 미용, 호텔, 훈련

### 검색 기능
- 장소/서비스명 검색

### 서비스 카드 (ServiceCard)
- 업체 이미지 (플레이스홀더)
- 별점 및 리뷰 수
- 거리 표시
- **❤️ 저장 버튼** - 장소 저장/해제
- 클릭 시 **최근 본 장소에 자동 추가**

### 상세 시트
- 업체 상세 정보
- 서비스 목록
- 전화하기 / 예약하기 버튼
- 저장(하트) 버튼

---

## 👤 마이 페이지 (ProfilePage)

### 프로필 카드
- 사용자 아바타, 이름, 이메일
- 선택된 펫 정보

### 대시보드 그리드
- 예약내역 수
- 쿠폰 수
- 내 리뷰 수
- 포인트

### 👀 최근 본 장소 (NEW)
- 수평 스크롤 섹션
- 최대 10개 썸네일 표시
- 전체 삭제 버튼

### 메뉴 리스트
- ❤️ **저장한 장소** - 저장한 장소 페이지로 이동
- 🕒 최근 본 장소
- 📞 고객센터
- 📢 공지사항

### 설정 섹션
- 🌙 **야간 산책 모드** - 다크 모드 토글 스위치
- 알림 설정
- 언어 설정
- 개인정보 처리방침
- 이용약관
- 앱 정보

### 로그아웃
- 확인 모달 후 로그아웃

---

## ❤️ 저장한 장소 페이지 (SavedPlacesPage) - NEW

- 저장한 업체 목록 표시
- 카드 형태로 업체 정보
- 하트 버튼으로 저장 해제
- 전체 삭제 버튼
- 빈 상태 시 "서비스 둘러보기" 버튼

---

## 🌙 다크 모드 (Night Walk Mode) - NEW

### 기술 구현
- Tailwind CSS `darkMode: 'class'` 전략
- `useThemeStore` - Zustand + localStorage 저장
- HTML root에 `dark` 클래스 토글

### 스타일 변환
| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `dark:bg-slate-800` |
| `bg-gray-50` | `dark:bg-slate-900` |
| `text-gray-900` | `dark:text-gray-100` |
| `bg-orange-500` | `dark:bg-orange-400` |
| `border-gray-100` | `dark:border-slate-700` |

### 적용 범위
- Layout (헤더, 네비게이션)
- HomePage
- ProfilePage
- ServicePage (검색바, 카테고리, 상세 시트)
- SavedPlacesPage
- ServiceCard
- BottomSheet, Modal 등 공통 컴포넌트

---

## 📦 Zustand Stores

| Store | 용도 | Persist |
|-------|------|---------|
| `useAuthStore` | 인증 상태 | ✅ |
| `usePetStore` | 펫 관리 | ✅ |
| `useCalendarStore` | 캘린더 이벤트 | ✅ |
| `useDailyLogStore` | 일일 기록 (산책, 식사 등) | ✅ |
| `useFamilyStore` | 가족 멤버 | ✅ |
| `useFamilyBoardStore` | 가족 보드 (할일, 메모) | ✅ |
| `useServiceStore` | 서비스 업체/예약 | ✅ |
| `useThemeStore` | 테마 (다크 모드) | ✅ |
| `usePlaceStore` | 저장/최근 장소 | ✅ |

---

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript
- **State Management**: Zustand 5 + Persist Middleware
- **Styling**: Tailwind CSS 4 (with dark mode)
- **Routing**: React Router DOM 7
- **Date**: date-fns
- **Icons**: Lucide React
- **Map**: Leaflet + React-Leaflet
- **Build**: Vite 7

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/         # Button, Modal, Input 등
│   ├── layout/         # Layout, SideDrawer
│   ├── service/        # ServiceCard
│   └── auth/           # ProtectedRoute
├── pages/
│   ├── HomePage.tsx        # 벤토 그리드 홈
│   ├── CalendarPage.tsx    # 일기장
│   ├── ServicePage.tsx     # 서비스 지도/목록
│   ├── ProfilePage.tsx     # 마이 페이지
│   ├── SavedPlacesPage.tsx # 저장한 장소
│   └── provider/           # 업체용 대시보드
├── stores/
│   ├── useThemeStore.ts    # 다크 모드
│   ├── usePlaceStore.ts    # 장소 저장/최근
│   └── ...
├── types/
└── routes/
```

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

개발 서버: http://localhost:5173

---

## 📝 최근 업데이트

1. **다크 모드 (야간 산책 모드)** - 전체 앱 다크 테마 지원
2. **장소 저장 시스템** - 하트 버튼으로 업체 저장
3. **최근 본 장소** - 자동 히스토리 추적 (최대 15개)
4. **Bento Grid 홈 화면** - 깔끔한 위젯 레이아웃
5. **산책 트래커 위젯** - 실시간 타이머 + 거리 측정
