import { useState, useRef } from "react";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  TextArea,
} from "../components/common";
import PetProfileImageUpload from "../components/common/PetProfileImageUpload";
import { usePetStore } from "../stores/usePetStore";
import type { Pet, VaccinationRecord } from "../types/pet";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const genderLabels = {
  male: "남아",
  female: "여아",
};

export default function PetListPage() {
  const pets = usePetStore((state) => state.pets);
  const addPet = usePetStore((state) => state.addPet);
  const updatePet = usePetStore((state) => state.updatePet);
  const deletePet = usePetStore((state) => state.deletePet);
  const uploadPetImage = usePetStore((state) => state.uploadPetImage);
  const removePetImage = usePetStore((state) => state.removePetImage);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 🔥 NEW: 선택된 이미지 파일 (모달에서 임시 보관)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "개",
    breed: "",
    birthDate: "",
    gender: "male" as "male" | "female",
    weight: "",
    color: "#3B82F6",
    microchipId: "",
    notes: "",
    allergies: "" as string,
    vaccinationHistory: [] as VaccinationRecord[],
  });

  const [newVaccination, setNewVaccination] = useState({
    vaccineName: "",
    date: "",
    nextDueDate: "",
    veterinarian: "",
    notes: "",
  });

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;

    if (years === 0) return `${months}개월`;
    if (months === 0) return `${years}살`;
    return `${years}살 ${months}개월`;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      species: "개",
      breed: "",
      birthDate: "",
      gender: "male",
      weight: "",
      color: "#3B82F6",
      microchipId: "",
      notes: "",
      allergies: "",
      vaccinationHistory: [],
    });
    setNewVaccination({
      vaccineName: "",
      date: "",
      nextDueDate: "",
      veterinarian: "",
      notes: "",
    });
    // 이미지 상태 초기화
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setShouldRemoveImage(false);
  };

  const addVaccination = () => {
    if (!newVaccination.vaccineName || !newVaccination.date) return;

    const vaccination: VaccinationRecord = {
      id: Date.now().toString(),
      vaccineName: newVaccination.vaccineName,
      date: newVaccination.date,
      nextDueDate: newVaccination.nextDueDate || undefined,
      veterinarian: newVaccination.veterinarian || undefined,
      notes: newVaccination.notes || undefined,
    };

    setFormData({
      ...formData,
      vaccinationHistory: [...formData.vaccinationHistory, vaccination],
    });

    setNewVaccination({
      vaccineName: "",
      date: "",
      nextDueDate: "",
      veterinarian: "",
      notes: "",
    });
  };

  const removeVaccination = (id: string) => {
    setFormData({
      ...formData,
      vaccinationHistory: formData.vaccinationHistory.filter(
        (v) => v.id !== id,
      ),
    });
  };

  // 🔥 이미지 파일 선택 핸들러
  const handleImageFileSelect = (file: File) => {
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setShouldRemoveImage(false);
  };

  // 🔥 이미지 삭제 핸들러
  const handleImageRemove = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setShouldRemoveImage(true);
  };

  // 반려견 추가 (+ 이미지 업로드)
  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();

    const allergiesArray = formData.allergies
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    setIsUploading(true);

    try {
      // 1. 먼저 펫 추가
      await addPet({
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        color: formData.color,
        microchipId: formData.microchipId || undefined,
        notes: formData.notes || undefined,
        allergies: allergiesArray.length > 0 ? allergiesArray : undefined,
        vaccinationHistory:
          formData.vaccinationHistory.length > 0
            ? formData.vaccinationHistory
            : undefined,
      });

      // 2. 이미지가 선택되었으면 방금 추가된 펫에 업로드
      if (selectedImageFile) {
        const latestPets = usePetStore.getState().pets;
        const newPet = latestPets[latestPets.length - 1]; // 방금 추가된 펫
        if (newPet) {
          await uploadPetImage(newPet.id, selectedImageFile);
        }
      }
    } finally {
      setIsUploading(false);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  // 반려견 수정 (+ 이미지 업로드/삭제)
  const handleEditPet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPet) return;

    const allergiesArray = formData.allergies
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    setIsUploading(true);

    try {
      // 1. 펫 정보 업데이트
      await updatePet(editingPet.id, {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        birthDate: formData.birthDate,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        color: formData.color,
        microchipId: formData.microchipId || undefined,
        notes: formData.notes || undefined,
        allergies: allergiesArray.length > 0 ? allergiesArray : undefined,
        vaccinationHistory:
          formData.vaccinationHistory.length > 0
            ? formData.vaccinationHistory
            : undefined,
      });

      // 2. 이미지 처리
      if (shouldRemoveImage) {
        await removePetImage(editingPet.id);
      } else if (selectedImageFile) {
        await uploadPetImage(editingPet.id, selectedImageFile);
      }
    } finally {
      setIsUploading(false);
    }

    setIsEditModalOpen(false);
    setEditingPet(null);
    setSelectedPet(null);
    resetForm();
  };

  const handleDeletePet = () => {
    if (!editingPet) return;

    deletePet(editingPet.id);
    setIsDeleteModalOpen(false);
    setEditingPet(null);
    setSelectedPet(null);
  };

  const openEditModal = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: pet.birthDate,
      gender: pet.gender,
      weight: pet.weight.toString(),
      color: pet.color,
      microchipId: pet.microchipId || "",
      notes: pet.notes || "",
      allergies: pet.allergies?.join(", ") || "",
      vaccinationHistory: pet.vaccinationHistory || [],
    });
    // 기존 이미지 표시를 위한 상태 초기화
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setShouldRemoveImage(false);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pet: Pet) => {
    setEditingPet(pet);
    setIsDeleteModalOpen(true);
  };

  // 🔥 프로필 이미지 표시용 헬퍼
  const renderPetAvatar = (pet: Pet, sizeClass = "w-24 h-24", textSize = "text-3xl") => (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white ${textSize} font-bold overflow-hidden ring-3 ring-orange-200 dark:ring-orange-800/50 shadow-md`}
      style={{ backgroundColor: pet.profileImage ? 'transparent' : pet.color }}
    >
      {pet.profileImage ? (
        <img
          src={pet.profileImage}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
      ) : (
        pet.name.charAt(0)
      )}
    </div>
  );

  // ============================================
  // 이미지 업로드 폼 섹션 (추가/수정 모달 공통)
  // ============================================
  const renderImageUploadSection = (existingImage?: string) => (
    <div className="flex justify-center pb-2">
      <PetProfileImageUpload
        currentImage={shouldRemoveImage ? undefined : (imagePreviewUrl || existingImage)}
        petName={formData.name}
        petColor={formData.color}
        onFileSelect={handleImageFileSelect}
        onRemove={handleImageRemove}
        isUploading={isUploading}
        size="md"
      />
    </div>
  );

  // ============================================
  // 접종 이력 폼 섹션 (추가/수정 모달 공통)
  // ============================================
  const renderVaccinationSection = () => (
    <div className="border-t pt-4">
      <p className="text-sm font-medium text-gray-700 mb-3">
        접종 이력 (선택)
      </p>

      {formData.vaccinationHistory.length > 0 && (
        <div className="space-y-2 mb-4">
          {formData.vaccinationHistory.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="font-medium">{v.vaccineName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {v.date}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => removeVaccination(v.id)}
                className="text-red-500 text-sm px-2 py-1"
              >
                삭제
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 bg-gray-50 rounded-lg space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="백신명"
            placeholder="예: 종합백신(DHPPL)"
            value={newVaccination.vaccineName}
            onChange={(e) =>
              setNewVaccination({
                ...newVaccination,
                vaccineName: e.target.value,
              })
            }
          />
          <Input
            label="접종일"
            type="date"
            value={newVaccination.date}
            onChange={(e) =>
              setNewVaccination({
                ...newVaccination,
                date: e.target.value,
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="다음 접종 예정일"
            type="date"
            value={newVaccination.nextDueDate}
            onChange={(e) =>
              setNewVaccination({
                ...newVaccination,
                nextDueDate: e.target.value,
              })
            }
          />
          <Input
            label="접종 병원"
            placeholder="예: 해피동물병원"
            value={newVaccination.veterinarian}
            onChange={(e) =>
              setNewVaccination({
                ...newVaccination,
                veterinarian: e.target.value,
              })
            }
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addVaccination}
          className="w-full"
        >
          + 접종 기록 추가
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--color-secondary-900)" }}
          >
            반려견 목록
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }} className="mt-2">
            우리 가족의 소중한 반려견들
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + 반려견 추가
        </Button>
      </div>

      {/* 반려견 카드 목록 - 🔥 실제 사진 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <div className="flex flex-col items-center text-center">
              {renderPetAvatar(pet)}
              <h3 className="text-xl font-bold mt-4">{pet.name}</h3>
              <p className="text-gray-600">
                {pet.breed} · {calculateAge(pet.birthDate)}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="info">{genderLabels[pet.gender]}</Badge>
                <Badge variant="success">{pet.weight}kg</Badge>
              </div>
              <div className="flex gap-2 mt-4 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPet(pet)}
                >
                  상세
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => openEditModal(pet)}
                >
                  수정
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {pets.length === 0 && (
          <div className="col-span-full">
            <Card>
              <div className="text-center py-12">
                <p
                  style={{ color: "var(--color-text-secondary)" }}
                  className="mb-4"
                >
                  아직 등록된 반려견이 없습니다.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  첫 반려견 등록하기
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 반려견 상세 정보 - 🔥 실제 사진 표시 */}
      {selectedPet && (
        <Card title={`${selectedPet.name} 상세 정보`}>
          <div className="space-y-4">
            {/* 상단 프로필 이미지 */}
            <div className="flex justify-center">
              {renderPetAvatar(selectedPet, "w-28 h-28", "text-4xl")}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">이름</p>
                <p className="font-medium">{selectedPet.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">종</p>
                <p className="font-medium">{selectedPet.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">품종</p>
                <p className="font-medium">{selectedPet.breed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">나이</p>
                <p className="font-medium">
                  {calculateAge(selectedPet.birthDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">생년월일</p>
                <p className="font-medium">
                  {format(new Date(selectedPet.birthDate), "yyyy년 M월 d일", {
                    locale: ko,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">성별</p>
                <p className="font-medium">
                  {genderLabels[selectedPet.gender]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">몸무게</p>
                <p className="font-medium">{selectedPet.weight}kg</p>
              </div>
              {selectedPet.microchipId && (
                <div>
                  <p className="text-sm text-gray-600">마이크로칩</p>
                  <p className="font-medium">{selectedPet.microchipId}</p>
                </div>
              )}
            </div>

            {selectedPet.notes && (
              <div>
                <p className="text-sm text-gray-600">메모</p>
                <p className="mt-1">{selectedPet.notes}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">알레르기</p>
              {selectedPet.allergies && selectedPet.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPet.allergies.map((allergy, index) => (
                    <Badge key={index} variant="warning">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 mt-1">등록된 알레르기 없음</p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">접종 이력</p>
              {selectedPet.vaccinationHistory &&
              selectedPet.vaccinationHistory.length > 0 ? (
                <div className="space-y-2">
                  {selectedPet.vaccinationHistory.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {vaccination.vaccineName}
                          </p>
                          <p className="text-sm text-gray-600">
                            접종일:{" "}
                            {format(
                              new Date(vaccination.date),
                              "yyyy년 M월 d일",
                              { locale: ko },
                            )}
                          </p>
                          {vaccination.nextDueDate && (
                            <p className="text-sm text-orange-600">
                              다음 접종:{" "}
                              {format(
                                new Date(vaccination.nextDueDate),
                                "yyyy년 M월 d일",
                                { locale: ko },
                              )}
                            </p>
                          )}
                        </div>
                        {vaccination.veterinarian && (
                          <Badge variant="info">
                            {vaccination.veterinarian}
                          </Badge>
                        )}
                      </div>
                      {vaccination.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {vaccination.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">등록된 접종 이력 없음</p>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedPet(null)}>
                닫기
              </Button>
              <Button
                variant="primary"
                onClick={() => openEditModal(selectedPet)}
              >
                수정
              </Button>
              <Button
                variant="danger"
                onClick={() => openDeleteModal(selectedPet)}
              >
                삭제
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================ */}
      {/* 반려견 추가 모달 - 🔥 이미지 업로드 추가 */}
      {/* ============================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="새 반려견 추가"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPet} className="space-y-4">
          {/* 🔥 프로필 사진 업로드 */}
          {renderImageUploadSection()}

          <Input
            label="이름"
            placeholder="예: 멍멍이"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="종"
              value={formData.species}
              onChange={(e) =>
                setFormData({ ...formData, species: e.target.value })
              }
              options={[
                { value: "개", label: "개" },
                { value: "고양이", label: "고양이" },
                { value: "기타", label: "기타" },
              ]}
              required
            />

            <Input
              label="품종"
              placeholder="예: 골든 리트리버"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="생년월일"
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              required
            />

            <Select
              label="성별"
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as "male" | "female",
                })
              }
              options={[
                { value: "male", label: "남아" },
                { value: "female", label: "여아" },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="몸무게 (kg)"
              type="number"
              step="0.1"
              placeholder="예: 30"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                색상 (캘린더 표시용)
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <Input
            label="마이크로칩 번호 (선택)"
            placeholder="예: 123-456-789"
            value={formData.microchipId}
            onChange={(e) =>
              setFormData({ ...formData, microchipId: e.target.value })
            }
          />

          <TextArea
            label="메모 (선택)"
            placeholder="특이사항 등을 입력하세요"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <Input
            label="알레르기 (선택)"
            placeholder="쉼표로 구분하여 입력 (예: 닭고기, 밀, 유제품)"
            value={formData.allergies}
            onChange={(e) =>
              setFormData({ ...formData, allergies: e.target.value })
            }
          />

          {renderVaccinationSection()}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isUploading}>
              {isUploading ? '업로드 중...' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================ */}
      {/* 반려견 수정 모달 - 🔥 이미지 업로드 추가 */}
      {/* ============================================ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPet(null);
          resetForm();
        }}
        title="반려견 정보 수정"
        maxWidth="lg"
      >
        <form onSubmit={handleEditPet} className="space-y-4">
          {/* 🔥 프로필 사진 업로드 (기존 이미지 표시) */}
          {renderImageUploadSection(editingPet?.profileImage)}

          <Input
            label="이름"
            placeholder="예: 멍멍이"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="종"
              value={formData.species}
              onChange={(e) =>
                setFormData({ ...formData, species: e.target.value })
              }
              options={[
                { value: "개", label: "개" },
                { value: "고양이", label: "고양이" },
                { value: "기타", label: "기타" },
              ]}
              required
            />

            <Input
              label="품종"
              placeholder="예: 골든 리트리버"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="생년월일"
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              required
            />

            <Select
              label="성별"
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as "male" | "female",
                })
              }
              options={[
                { value: "male", label: "남아" },
                { value: "female", label: "여아" },
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="몸무게 (kg)"
              type="number"
              step="0.1"
              placeholder="예: 30"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                색상 (캘린더 표시용)
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <Input
            label="마이크로칩 번호 (선택)"
            placeholder="예: 123-456-789"
            value={formData.microchipId}
            onChange={(e) =>
              setFormData({ ...formData, microchipId: e.target.value })
            }
          />

          <TextArea
            label="메모 (선택)"
            placeholder="특이사항 등을 입력하세요"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <Input
            label="알레르기 (선택)"
            placeholder="쉼표로 구분하여 입력 (예: 닭고기, 밀, 유제품)"
            value={formData.allergies}
            onChange={(e) =>
              setFormData({ ...formData, allergies: e.target.value })
            }
          />

          {renderVaccinationSection()}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPet(null);
                resetForm();
              }}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={isUploading}>
              {isUploading ? '업로드 중...' : '수정 완료'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 반려견 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEditingPet(null);
        }}
        title="반려견 삭제"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말로 <strong>{editingPet?.name}</strong>을(를) 삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            삭제 시 관련된 모든 일정과 기록도 함께 삭제됩니다.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEditingPet(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeletePet}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
