// ============================================
// 공통 유틸리티 함수
// ============================================

import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

// ============================================
// 날짜 유틸리티
// ============================================

/**
 * 날짜를 한국어 형식으로 포맷
 */
export function formatDateKo(date: Date | string, formatStr: string = 'yyyy년 M월 d일'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr, { locale: ko });
}

/**
 * 시간을 HH:mm 형식으로 포맷
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, 'HH:mm');
}

/**
 * 상대 시간 표시 (방금 전, 5분 전, 1시간 전 등)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return formatDateKo(dateObj, 'M월 d일');
}

// ============================================
// 문자열 유틸리티
// ============================================

/**
 * 문자열 자르기 (말줄임표 포함)
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * 첫 글자만 대문자로
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// 숫자 유틸리티
// ============================================

/**
 * 숫자에 천 단위 콤마 추가
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

/**
 * 금액 포맷 (원)
 */
export function formatCurrency(amount: number): string {
  return `${formatNumber(amount)}원`;
}

/**
 * 거리 포맷 (km/m)
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${Math.round(meters)}m`;
}

/**
 * 시간 포맷 (시:분:초)
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// 배열 유틸리티
// ============================================

/**
 * 배열에서 중복 제거
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 배열을 특정 키로 그룹핑
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ============================================
// 유효성 검사
// ============================================

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 유효성 검사 (한국)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
}

// ============================================
// 기타
// ============================================

/**
 * 딜레이 (Promise)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * UUID 생성 (간단 버전)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 클래스명 조합 (cn 유틸리티)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
