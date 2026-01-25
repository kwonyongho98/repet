import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Users,
  UserPlus,
  QrCode,
  Copy,
  Check,
  Trash2,
  Settings,
  Store,
  Shield,
  Eye,
  EyeOff,
  Link2,
  Loader2,
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../common';
import { usePartnerStore } from '../../stores/usePartnerStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { PartnerConnection, PartnerPermissions } from '../../types/partner';

export default function PartnerManageSection() {
  const user = useAuthStore((state) => state.user);
  const {
    connections,
    connectionsLoading,
    fetchConnections,
    createInvite,
    disconnectPartner,
    updatePermissions,
  } = usePartnerStore();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<PartnerConnection | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  useEffect(() => {
    if (user?.familyId) {
      fetchConnections(user.familyId);
    }
  }, [user?.familyId, fetchConnections]);

  const activeConnections = connections.filter((c) => c.status === 'active');

  const handleCreateInvite = async () => {
    if (!user?.familyId || !user?.id) return;

    setIsCreatingInvite(true);
    try {
      const invite = await createInvite(user.familyId, user.id);
      setInviteCode(invite.code);
      setInviteLink(`${window.location.origin}/partner/join?code=${invite.code}`);
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('초대 코드 생성에 실패했습니다.');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDisconnect = async () => {
    if (!selectedConnection) return;

    try {
      await disconnectPartner(selectedConnection.id);
      setIsDisconnectModalOpen(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Error disconnecting partner:', error);
      alert('연결 해제에 실패했습니다.');
    }
  };

  const handlePermissionChange = async (
    key: keyof PartnerPermissions,
    value: boolean
  ) => {
    if (!selectedConnection) return;

    try {
      await updatePermissions(selectedConnection.id, { [key]: value });
      setSelectedConnection({
        ...selectedConnection,
        permissions: { ...selectedConnection.permissions, [key]: value },
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const openPermissionModal = (connection: PartnerConnection) => {
    setSelectedConnection(connection);
    setIsPermissionModalOpen(true);
  };

  const openDisconnectModal = (connection: PartnerConnection) => {
    setSelectedConnection(connection);
    setIsDisconnectModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-500" />
            연결된 파트너
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            펫호텔, 유치원 등 케어 파트너를 관리합니다
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          파트너 초대
        </Button>
      </div>

      {/* 연결된 파트너 목록 */}
      {connectionsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : activeConnections.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              연결된 파트너가 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              펫호텔, 유치원과 연결하여 알림장을 받아보세요
            </p>
            <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              파트너 초대하기
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeConnections.map((connection) => (
            <Card key={connection.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Store className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {connection.providerName || '파트너'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {connection.providerType === 'hotel'
                        ? '펫호텔'
                        : connection.providerType === 'grooming'
                        ? '미용실'
                        : connection.providerType === 'training'
                        ? '훈련소'
                        : '병원'}
                    </p>
                    {connection.connectedAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        연결됨:{' '}
                        {format(new Date(connection.connectedAt), 'yyyy.M.d', {
                          locale: ko,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success">
                    <Check className="w-3 h-3 mr-1" />
                    연결됨
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPermissionModal(connection)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openDisconnectModal(connection)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 초대 모달 */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteCode(null);
          setInviteLink(null);
        }}
        title="파트너 초대"
        maxWidth="md"
      >
        <div className="space-y-6">
          {!inviteCode ? (
            <>
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  파트너 초대 코드 생성
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  펫호텔, 유치원 등에 초대 코드를 전달하면
                  <br />
                  파트너로 연결할 수 있습니다.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  파트너 권한 안내
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>✓ 예약된 펫의 기본 정보 조회</li>
                  <li>✓ 알러지, 건강 정보 조회 (케어 안전)</li>
                  <li>✓ 알림장(Care Note) 작성</li>
                  <li>✗ 비용/지출 정보 접근 불가</li>
                  <li>✗ 가족 로그 삭제 불가</li>
                </ul>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleCreateInvite}
                disabled={isCreatingInvite}
              >
                {isCreatingInvite ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-5 h-5 mr-2" />
                    초대 코드 생성하기
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  초대 코드가 생성되었습니다!
                </h3>
                <p className="text-sm text-gray-500">7일간 유효합니다</p>
              </div>

              {/* 초대 코드 */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  초대 코드
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl font-mono text-xl text-center font-bold tracking-wider">
                    {inviteCode}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(inviteCode, 'code')}
                  >
                    {copiedText === 'code' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 초대 링크 */}
              {inviteLink && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    초대 링크
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 truncate">
                      {inviteLink}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(inviteLink, 'link')}
                    >
                      {copiedText === 'link' ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                이 코드 또는 링크를 파트너에게 전달해주세요
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* 권한 설정 모달 */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedConnection(null);
        }}
        title="파트너 권한 설정"
        maxWidth="md"
      >
        {selectedConnection && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
              <Store className="w-10 h-10 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedConnection.providerName || '파트너'}
                </h3>
                <p className="text-sm text-gray-500">권한 설정</p>
              </div>
            </div>

            <div className="space-y-3">
              <PermissionToggle
                label="펫 기본 정보 조회"
                description="이름, 품종, 나이 등"
                enabled={selectedConnection.permissions.view_pet_info}
                onChange={(v) => handlePermissionChange('view_pet_info', v)}
              />
              <PermissionToggle
                label="건강 기록 조회"
                description="체중 기록, 건강 메모"
                enabled={selectedConnection.permissions.view_health_records}
                onChange={(v) => handlePermissionChange('view_health_records', v)}
              />
              <PermissionToggle
                label="알러지 정보 조회"
                description="알러지 및 주의사항"
                enabled={selectedConnection.permissions.view_allergies}
                onChange={(v) => handlePermissionChange('view_allergies', v)}
              />
              <PermissionToggle
                label="알림장 작성"
                description="Care Note 작성 권한"
                enabled={selectedConnection.permissions.create_care_notes}
                onChange={(v) => handlePermissionChange('create_care_notes', v)}
              />
              <PermissionToggle
                label="과거 로그 조회"
                description="산책, 식사 등 기록 열람"
                enabled={selectedConnection.permissions.view_past_logs}
                onChange={(v) => handlePermissionChange('view_past_logs', v)}
              />
              <PermissionToggle
                label="비용 정보 조회"
                description="지출 내역 열람 (비권장)"
                enabled={selectedConnection.permissions.view_expenses}
                onChange={(v) => handlePermissionChange('view_expenses', v)}
                danger
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 연결 해제 모달 */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => {
          setIsDisconnectModalOpen(false);
          setSelectedConnection(null);
        }}
        title="파트너 연결 해제"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            정말 <strong>{selectedConnection?.providerName || '이 파트너'}</strong>와의
            연결을 해제하시겠습니까?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            연결 해제 시 해당 파트너는 더 이상 펫 정보에 접근하거나 알림장을 작성할 수
            없습니다.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDisconnectModalOpen(false)}
            >
              취소
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDisconnect}>
              연결 해제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// Permission Toggle Component
// ============================================
function PermissionToggle({
  label,
  description,
  enabled,
  onChange,
  danger = false,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl ${
        danger
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-gray-50 dark:bg-slate-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {enabled ? (
          <Eye className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-green-500'}`} />
        ) : (
          <EyeOff className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <p className={`font-medium ${danger ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled
            ? danger
              ? 'bg-red-500'
              : 'bg-green-500'
            : 'bg-gray-300 dark:bg-slate-500'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
