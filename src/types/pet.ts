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
  createdAt: string;
  updatedAt: string;
}
