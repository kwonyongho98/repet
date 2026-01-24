import { useState } from "react";
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  TextArea,
} from "../components/common";
import { usePetStore } from "../stores/usePetStore";
import type { Pet } from "../types/pet";
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

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
  });

  // 나이 계산
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

  // 폼 초기화
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
    });
  };

  // 반려견 추가
  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();

    addPet({
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      birthDate: formData.birthDate,
      gender: formData.gender,
      weight: parseFloat(formData.weight),
      color: formData.color,
      microchipId: formData.microchipId || undefined,
      notes: formData.notes || undefined,
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  // 반려견 수정
  const handleEditPet = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPet) return;

    updatePet(editingPet.id, {
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      birthDate: formData.birthDate,
      gender: formData.gender,
      weight: parseFloat(formData.weight),
      color: formData.color,
      microchipId: formData.microchipId || undefined,
      notes: formData.notes || undefined,
    });

    setIsEditModalOpen(false);
    setEditingPet(null);
    setSelectedPet(null);
    resetForm();
  };

  // 반려견 삭제
  const handleDeletePet = () => {
    if (!editingPet) return;

    deletePet(editingPet.id);
    setIsDeleteModalOpen(false);
    setEditingPet(null);
    setSelectedPet(null);
  };

  // 수정 모달 열기
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
    });
    setIsEditModalOpen(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = (pet: Pet) => {
    setEditingPet(pet);
    setIsDeleteModalOpen(true);
  };

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

      {/* 반려견 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Card key={pet.id}>
            <div className="flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
                style={{ backgroundColor: pet.color }}
              >
                {pet.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold">{pet.name}</h3>
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

      {/* 반려견 상세 정보 */}
      {selectedPet && (
        <Card title={`${selectedPet.name} 상세 정보`}>
          <div className="space-y-4">
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

      {/* 반려견 추가 모달 */}
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
            placeholder="특이사항이나 알레르기 등을 입력하세요"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              추가
            </Button>
          </div>
        </form>
      </Modal>

      {/* 반려견 수정 모달 */}
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
            placeholder="특이사항이나 알레르기 등을 입력하세요"
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />

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
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              수정 완료
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
