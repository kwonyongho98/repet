import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Phone,
  MapPin,
  FileText,
  QrCode,
  Copy,
  RefreshCw,
  Check,
  Loader2,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button, Input, TextArea, Modal } from '../../components/common';
import { useProviderStore } from '../../stores/useProviderStore';
import { useUIStore } from '../../stores/useUIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { serviceTypeConfig } from '../../types/provider';

export default function ProviderSettingsPage() {
  const navigate = useNavigate();
  const myProvider = useProviderStore((state) => state.myProvider);
  const updateProvider = useProviderStore((state) => state.updateProvider);
  const createInviteCode = useProviderStore((state) => state.createInviteCode);
  const fetchMyProvider = useProviderStore((state) => state.fetchMyProvider);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const logout = useAuthStore((state) => state.logout);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    fetchMyProvider();
  }, [fetchMyProvider]);

  useEffect(() => {
    if (myProvider) {
      setEditForm({
        name: myProvider.name,
        phone: myProvider.phone || '',
        address: myProvider.address || '',
        description: myProvider.description || '',
      });
    }
  }, [myProvider]);

  // Generate invite code
  const handleGenerateInviteCode = async () => {
    setIsLoading(true);
    try {
      const invite = await createInviteCode(7); // 7일 유효
      if (invite) {
        setInviteCode(invite.code);
        setIsInviteModalOpen(true);
      }
    } catch (error) {
      console.error('Generate invite code error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy invite code
  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // Update provider info
  const handleUpdateProvider = async () => {
    if (!myProvider) return;
    setIsLoading(true);
    try {
      await updateProvider(myProvider.id, editForm);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to family mode
  const handleSwitchToFamily = () => {
    setViewMode('family');
    navigate('/home');
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!myProvider) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const serviceConfig = serviceTypeConfig[myProvider.serviceType];

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 pb-8">
      {/* Provider Profile Card */}
      <div className="bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: serviceConfig?.color + '20' }}
          >
            {serviceConfig?.emoji || '🏪'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {myProvider.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: serviceConfig?.color }}
              />
              {serviceConfig?.label || myProvider.serviceType}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Store size={24} className="text-blue-500" />
            <span className="text-sm">정보 수정</span>
          </Button>
          <Button
            variant="secondary"
            className="h-auto py-4 flex-col gap-2"
            onClick={handleGenerateInviteCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <QrCode size={24} className="text-green-500" />
            )}
            <span className="text-sm">초대코드 생성</span>
          </Button>
        </div>
      </div>

      {/* Settings List */}
      <div className="mt-4">
        {/* Business Info */}
        <div className="bg-white dark:bg-slate-800 mb-4">
          <h2 className="px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700">
            업체 정보
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            <div className="px-4 py-4 flex items-center gap-4">
              <Phone size={20} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">연락처</p>
                <p className="text-gray-900 dark:text-white">
                  {myProvider.phone || '미등록'}
                </p>
              </div>
            </div>
            <div className="px-4 py-4 flex items-center gap-4">
              <MapPin size={20} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">주소</p>
                <p className="text-gray-900 dark:text-white">
                  {myProvider.address || '미등록'}
                </p>
              </div>
            </div>
            <div className="px-4 py-4 flex items-center gap-4">
              <FileText size={20} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">사업자등록번호</p>
                <p className="text-gray-900 dark:text-white">
                  {myProvider.businessNumber || '미등록'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-slate-800 mb-4">
          <h2 className="px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700">
            설정
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Bell size={20} className="text-gray-400" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">알림 설정</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Shield size={20} className="text-gray-400" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">개인정보 처리방침</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
            <button className="w-full px-4 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <HelpCircle size={20} className="text-gray-400" />
              <span className="flex-1 text-left text-gray-900 dark:text-white">도움말</span>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSwitchToFamily}
          >
            🏠 가족 모드로 전환
          </Button>
          <Button
            variant="danger"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="업체 정보 수정"
      >
        <div className="space-y-4">
          <Input
            label="업체명"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="연락처"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Input
            label="주소"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <TextArea
            label="업체 소개"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleUpdateProvider}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '저장'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Code Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="초대 코드"
      >
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            이 코드를 보호자님께 공유하세요
          </p>
          
          {/* Code Display */}
          <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl p-6 mb-4">
            <p className="text-3xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
              {inviteCode}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            유효기간: 7일 · 최대 10회 사용 가능
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleGenerateInviteCode}
              disabled={isLoading}
            >
              <RefreshCw size={18} className="mr-2" />
              재생성
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCopyCode}
            >
              {isCopied ? (
                <>
                  <Check size={18} className="mr-2" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  복사
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
