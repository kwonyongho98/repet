// ============================================
// 공통 상수 정의
// ============================================

// ============================================
// 날짜 관련
// ============================================

export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
] as const;

export const MONTH_NAMES_FULL = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
] as const;

export const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;
export const WEEKDAY_NAMES_FULL = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

// 연도 선택 범위 (현재 연도 기준 -5 ~ +5)
const BASE_YEAR = new Date().getFullYear();
export const YEAR_RANGE = Array.from({ length: 11 }, (_, i) => BASE_YEAR - 5 + i);

// ============================================
// 시간 관련
// ============================================

export const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
] as const;

// ============================================
// 펫 관련
// ============================================

export const PET_SPECIES = {
  dog: { label: '강아지', emoji: '🐕' },
  cat: { label: '고양이', emoji: '🐱' },
  bird: { label: '새', emoji: '🐦' },
  fish: { label: '물고기', emoji: '🐟' },
  hamster: { label: '햄스터', emoji: '🐹' },
  rabbit: { label: '토끼', emoji: '🐰' },
  turtle: { label: '거북이', emoji: '🐢' },
  other: { label: '기타', emoji: '🐾' },
} as const;

export const PET_GENDERS = {
  male: { label: '남아', emoji: '♂️' },
  female: { label: '여아', emoji: '♀️' },
} as const;

// ============================================
// UI 관련
// ============================================

export const TOAST_DURATION = {
  short: 2000,
  default: 3000,
  long: 5000,
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  default: 300,
  slow: 500,
} as const;

// ============================================
// 페이지네이션
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// ============================================
// 파일 업로드
// ============================================

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_UPLOAD = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

// ============================================
// 앱 설정
// ============================================

export const APP_NAME = 'Repet';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = '반려동물의 모든 순간을, 가족과 선생님과 함께';
