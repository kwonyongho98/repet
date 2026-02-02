# 🐕 Repet 앱 - 홈화면 리디자인 완료 (v2.0)

## 📱 주요 변경사항 요약

### 🏠 새로운 홈화면 구조

```
┌─────────────────────────────────────┐
│ ≡ REPET                         🔔  │
│ (사이드드로어)              (알림)   │
├─────────────────────────────────────┤
│ ┌────────┬──────────────┬────────┐ │
│ │[강아지 │ 에당이        │  ← →  │ │  ← NewPetHeader
│ │ 사진]  │ ♂ · 2살      │(스와이프)│ │
│ └────────┴──────────────┴────────┘ │
├─────────────────────────────────────┤
│ 🐾 에당이의 하루                     │  ← DashboardGrid
│ ┌─────────┬─────────────┬────────┐ │
│ │ 가족/   │  가족 공유   │ 가족/  │ │
│ │ 업체    │   메모장     │ 업체   │ │
│ │ 연동    │    📝       │ 공유   │ │
│ │  🔗    │  (클릭→이동) │ 앨범   │ │
│ │─────────│             │  📷   │ │
│ │ 캘린더  │             │        │ │
│ │  📅    │             │        │ │
│ │(몸무게 │             │        │ │
│ │ 포함)   │             │        │ │
│ └─────────┴─────────────┴────────┘ │
├─────────────────────────────────────┤
│ 🏢 팻츠템 (업체명)        ← 슬라이드 → │  ← ProviderSection
│ ┌───────┬───────┬───────┬────────┐ │    (Provider 연결 시에만)
│ │ 케어  │ 공지  │ 일정표│  케어  │ │
│ │ 노트  │ 사항  │       │ 요청서 │ │
│ └───────┴───────┴───────┴────────┘ │
├─────────────────────────────────────┤
│      🏠          🔍          👤     │  ← 3개 탭으로 통합
│      홈       업체 찾기      my     │
└─────────────────────────────────────┘
```

---

## 📁 수정/생성된 파일 목록

### 🆕 새로 생성된 파일

| 파일 | 역할 |
|------|------|
| `src/components/home/NewPetHeader.tsx` | 펫 헤더 (사진 + 정보 + 스와이프 전환) |
| `src/components/home/DashboardGrid.tsx` | 4개 위젯 그리드 (연동, 캘린더, 메모장, 앨범) |
| `src/components/home/ProviderSection.tsx` | 업체별 위젯 섹션 (케어노트, 공지, 일정, 요청서) |

### ✏️ 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/pages/HomePage.tsx` | 완전히 새로운 홈화면 구조로 재작성 |
| `src/pages/CalendarPage.tsx` | 체중 기록 기능 추가, 밥/응가/산책 표시 제거 |
| `src/pages/family/FamilyBoardPage.tsx` | DailyTracker 클릭 가능, 산책 GPS 기능 추가 |
| `src/components/familyBoard/DailyTracker.tsx` | 클릭 가능한 버튼으로 변경 |
| `src/components/home/index.tsx` | 새 컴포넌트 export 추가 |
| `src/stores/useUIStore.ts` | 탭바 5개 → 3개로 변경 |

---

## 🔄 기능 이동/통합 내역

### 홈 → 가족 보드 (FamilyBoardPage)로 이동

| 기능 | 이전 위치 | 새 위치 |
|------|----------|---------|
| 밥 기록 버튼 | HomePage 퀵버튼 | FamilyBoardPage DailyTracker 클릭 |
| 응가 기록 버튼 | HomePage 퀵버튼 | FamilyBoardPage DailyTracker 클릭 |
| 산책 GPS 시작 | HomePage WalkHeroWidget | FamilyBoardPage DailyTracker 클릭 |

### 홈 → 캘린더 (CalendarPage)로 이동

| 기능 | 이전 위치 | 새 위치 |
|------|----------|---------|
| 체중 기록 | HomePage 퀵버튼 → BottomSheet | CalendarPage 날짜 선택 → "체중 기록하기" 버튼 |

### 캘린더에서 제거된 표시

| 제거된 항목 | 사유 |
|------------|------|
| 밥 스탬프 (😋) | FamilyBoardPage에서 관리 |
| 응가 스탬프 (💩) | FamilyBoardPage에서 관리 |
| 산책 스탬프 (👃) | FamilyBoardPage에서 관리 |

### 캘린더에 유지된 표시

| 유지된 항목 | 설명 |
|------------|------|
| 체중 스탬프 (⚖️) | 캘린더에서 직접 기록 |
| 지출 스탬프 (🐷) | 캘린더에서 확인 |
| 일정 이벤트 | 병원, 미용, 훈련 등 |

---

## 📱 탭바 변경

### 이전 (5개 탭)
```
🏠 홈 | 📖 일지 | 🔍 업체 | 💬 소통 | 👤 MY
```

### 변경 후 (3개 탭)
```
🏠 홈 | 🔍 업체 찾기 | 👤 my
```

### 제거된 탭의 기능 이동

| 제거된 탭 | 기능 이동 위치 |
|----------|---------------|
| 📖 일지 | 홈 → 가족 공유 메모장 위젯 |
| 💬 소통 | 홈 → 업체 섹션 → 케어 노트 위젯 |

---

## 🎯 새로운 사용자 플로우

### 1. 밥/응가 기록하기
```
홈 → "가족 공유 메모장" 클릭 → FamilyBoardPage
→ "오늘의 현황"에서 🍚밥 또는 💩응가 클릭 → BottomSheet에서 기록
```

### 2. 산책 시작하기
```
홈 → "가족 공유 메모장" 클릭 → FamilyBoardPage
→ "오늘의 현황"에서 🐾산책 클릭 → WalkMapModal에서 GPS 산책 시작
```
또는
```
홈 → 우측 하단 초록색 FAB 클릭 → WalkMapModal에서 GPS 산책 시작
```

### 3. 체중 기록하기
```
홈 → "캘린더" 클릭 → CalendarPage
→ 날짜 더블클릭 → "⚖️ 체중 기록하기" 클릭 → 모달에서 기록
```

### 4. 케어노트 확인하기 (Provider 연결 시)
```
홈 → 업체 섹션에서 "케어 노트" 클릭 → CommunicationPage
```

---

## 🏗️ 컴포넌트 구조

### NewPetHeader.tsx
```tsx
// 기능:
// - 펫 프로필 사진 (좌측, 원형)
// - 펫 이름, 성별, 나이, 품종 (중앙)
// - 펫 전환 버튼 (우측, 여러 마리일 때)
// - 펫 인디케이터 도트 (하단)
```

### DashboardGrid.tsx
```tsx
// 4개 위젯:
// 1. 가족/업체 연동 → /home/provider-connect
// 2. 캘린더 (몸무게) → /home/calendar
// 3. 가족 공유 메모장 → /home/family-board
// 4. 가족/업체 공유 앨범 → /home/album
```

### ProviderSection.tsx
```tsx
// Provider 연결 시에만 표시
// 4개 위젯:
// 1. 케어 노트 → /home/communication
// 2. 공지사항 → /home/communication
// 3. 일정표 → /home/calendar
// 4. 케어 요청서 → /home/communication (TODO)
```

### DailyTracker.tsx (수정됨)
```tsx
// 클릭 가능한 버튼으로 변경
// Props:
// - onMealClick: () => void (밥 기록 BottomSheet 열기)
// - onBowelClick: () => void (응가 기록 BottomSheet 열기)
// - onWalkClick: () => void (산책 GPS 모달 열기)
```

---

## 📂 전체 프로젝트 구조

```
/src
├── components/
│   ├── home/
│   │   ├── NewPetHeader.tsx      # 🆕 펫 헤더
│   │   ├── DashboardGrid.tsx     # 🆕 4개 위젯 그리드
│   │   ├── ProviderSection.tsx   # 🆕 업체 섹션
│   │   ├── WalkMapModal.tsx      # GPS 산책 모달
│   │   ├── WalkHeroWidget.tsx    # (미사용, 참고용 유지)
│   │   ├── PetSelector.tsx       # (미사용, NewPetHeader로 대체)
│   │   └── index.tsx             # ✏️ export 추가
│   ├── familyBoard/
│   │   ├── DailyTracker.tsx      # ✏️ 클릭 가능 버튼
│   │   ├── MealSection.tsx
│   │   ├── BowelSection.tsx
│   │   └── WalkSection.tsx
│   └── layout/
│       └── Layout.tsx            # 3개 탭바 사용
├── pages/
│   ├── HomePage.tsx              # ✏️ 완전 재작성
│   ├── CalendarPage.tsx          # ✏️ 체중 기록 추가
│   └── family/
│       └── FamilyBoardPage.tsx   # ✏️ 산책 모달 추가
└── stores/
    └── useUIStore.ts             # ✏️ 탭 3개로 변경
```

---

## ⚠️ 주의사항

1. **기존 데이터 호환**: 기존에 저장된 밥/응가/산책/체중 데이터는 그대로 유지됩니다.
2. **캘린더 표시 변경**: 캘린더에서 밥/응가/산책 스탬프가 더 이상 표시되지 않습니다.
3. **산책 FAB**: 홈 화면에 초록색 산책 FAB 버튼은 그대로 유지됩니다.

---

## 🚀 향후 개선사항 (TODO)

- [ ] 케어 요청서 별도 페이지 구현
- [ ] 업체별 공지사항 필터링
- [ ] 펫 전환 스와이프 제스처 추가 (react-swipeable)
- [ ] 다크모드 위젯 색상 최적화

---

*업데이트 일자: 2026-02-02*
*버전: v2.0 - 홈화면 리디자인*
