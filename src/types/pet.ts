// 접종 기록 타입
export interface VaccinationRecord {
  id: string;
  vaccineName: string; // 백신 이름 (종합백신, 광견병 등)
  date: string; // 접종일
  nextDueDate?: string; // 다음 접종 예정일
  veterinarian?: string; // 접종 병원/수의사
  notes?: string; // 메모
}

export interface Pet {
  id: string;
  name: string;
  species: string; // 종 (개, 고양이 등)
  breed: string; // 품종
  birthDate: string;
  age?: number; // 추가
  gender: "male" | "female";
  weight: number;
  color: string; // 캘린더 표시용 색상
  profileImage?: string;
  microchipId?: string;
  notes?: string;
  // 3단계 추가: 알레르기 및 접종 이력
  allergies?: string[]; // 알레르기 목록 (예: ['닭고기', '밀'])
  vaccinationHistory?: VaccinationRecord[]; // 접종 이력
  createdAt: string;
  updatedAt: string;
}
