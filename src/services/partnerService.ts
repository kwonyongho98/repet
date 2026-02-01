import { supabase, uploadImage, STORAGE_BUCKETS } from '../lib/supabase';
import type {
  PartnerConnection,
  PartnerInvite,
  CareNote,
  CareNoteFormData,
  Notification,
  PushSubscription,
} from '../types/partner';

// ============================================
// Partner Connection Services
// ============================================

/**
 * 가족의 파트너 연결 목록 조회
 */
export const getPartnerConnections = async (familyId: string): Promise<PartnerConnection[]> => {
  const { data, error } = await supabase
    .from('partner_connections')
    .select(`
      *,
      service_providers (
        id,
        business_name,
        service_type
      )
    `)
    .eq('family_id', familyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching partner connections:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    familyId: item.family_id,
    providerId: item.provider_id,
    providerName: item.service_providers?.business_name,
    providerType: item.service_providers?.service_type,
    status: item.status,
    inviteCode: item.invite_code,
    permissions: item.permissions,
    connectedAt: item.connected_at,
    connectedBy: item.connected_by,
    expiresAt: item.expires_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

/**
 * Provider의 연결된 가족 목록 조회
 */
export const getProviderConnections = async (providerId: string): Promise<PartnerConnection[]> => {
  const { data, error } = await supabase
    .from('partner_connections')
    .select(`
      *,
      families (
        id,
        name
      )
    `)
    .eq('provider_id', providerId)
    .eq('status', 'active')
    .order('connected_at', { ascending: false });

  if (error) {
    console.error('Error fetching provider connections:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    familyId: item.family_id,
    providerId: item.provider_id,
    status: item.status,
    permissions: item.permissions,
    connectedAt: item.connected_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
};

/**
 * 파트너 초대 코드 생성
 */
export const createPartnerInvite = async (
  familyId: string,
  createdBy: string
): Promise<PartnerInvite> => {
  // 6자리 랜덤 코드 생성
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // 7일 후 만료
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from('partner_invites')
    .insert({
      family_id: familyId,
      code,
      created_by: createdBy,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating partner invite:', error);
    throw error;
  }

  return {
    id: data.id,
    familyId: data.family_id,
    code: data.code,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
};

/**
 * 초대 코드로 파트너 연결 수락
 */
export const acceptPartnerInvite = async (
  code: string,
  providerId: string
): Promise<PartnerConnection> => {
  // 1. 초대 코드 검증
  const { data: invite, error: inviteError } = await supabase
    .from('partner_invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (inviteError || !invite) {
    throw new Error('유효하지 않거나 만료된 초대 코드입니다.');
  }

  // 2. 이미 연결되어 있는지 확인
  const { data: existing } = await supabase
    .from('partner_connections')
    .select('id')
    .eq('family_id', invite.family_id)
    .eq('provider_id', providerId)
    .single();

  if (existing) {
    throw new Error('이미 연결된 가족입니다.');
  }

  // 3. 파트너 연결 생성
  const { data: connection, error: connectionError } = await supabase
    .from('partner_connections')
    .insert({
      family_id: invite.family_id,
      provider_id: providerId,
      status: 'active',
      connected_at: new Date().toISOString(),
      connected_by: invite.created_by,
    })
    .select()
    .single();

  if (connectionError) {
    console.error('Error creating partner connection:', connectionError);
    throw connectionError;
  }

  // 4. 초대 코드 사용 처리
  await supabase
    .from('partner_invites')
    .update({
      used_at: new Date().toISOString(),
      used_by: providerId,
    })
    .eq('id', invite.id);

  return {
    id: connection.id,
    familyId: connection.family_id,
    providerId: connection.provider_id,
    status: connection.status,
    permissions: connection.permissions,
    connectedAt: connection.connected_at,
    connectedBy: connection.connected_by,
    createdAt: connection.created_at,
    updatedAt: connection.updated_at,
  };
};

/**
 * 파트너 연결 해제
 */
export const disconnectPartner = async (connectionId: string): Promise<void> => {
  const { error } = await supabase
    .from('partner_connections')
    .update({ status: 'removed' })
    .eq('id', connectionId);

  if (error) {
    console.error('Error disconnecting partner:', error);
    throw error;
  }
};

/**
 * 파트너 권한 업데이트
 */
export const updatePartnerPermissions = async (
  connectionId: string,
  permissions: Partial<PartnerConnection['permissions']>
): Promise<void> => {
  const { error } = await supabase
    .from('partner_connections')
    .update({ permissions })
    .eq('id', connectionId);

  if (error) {
    console.error('Error updating partner permissions:', error);
    throw error;
  }
};

// ============================================
// Care Note Services
// ============================================

/**
 * 알림장 목록 조회 (가족용)
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
export const getCareNotesByFamily = async (
  familyId: string,
  options?: { petId?: string; startDate?: string; endDate?: string }
): Promise<CareNote[]> => {
  let query = supabase
    .from('care_notes')
    .select(`
      *,
      pets (id, name, profile_image),
      service_providers (id, business_name)
    `)
    .eq('family_id', familyId)
    .order('date', { ascending: false });

  if (options?.petId) {
    query = query.eq('pet_id', options.petId);
  }
  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching care notes:', error);
    throw error;
  }

  return (data || []).map(mapCareNoteFromDB);
};

/**
 * 알림장 목록 조회 (Provider용)
 */
export const getCareNotesByProvider = async (
  providerId: string,
  options?: { date?: string }
): Promise<CareNote[]> => {
  let query = supabase
    .from('care_notes')
    .select(`
      *,
      pets (id, name, profile_image),
      service_bookings (id, service_name)
    `)
    .eq('provider_id', providerId)
    .order('date', { ascending: false });

  if (options?.date) {
    query = query.eq('date', options.date);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching care notes:', error);
    throw error;
  }

  return (data || []).map(mapCareNoteFromDB);
};

/**
 * 특정 예약의 알림장 조회
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
export const getCareNoteByBooking = async (
  bookingId: string,
  date: string
): Promise<CareNote | null> => {
  const { data, error } = await supabase
    .from('care_notes')
    .select(`
      *,
      pets (id, name, profile_image),
      service_providers (id, business_name)
    `)
    .eq('booking_id', bookingId)
    .eq('date', date)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching care note:', error);
    throw error;
  }

  return mapCareNoteFromDB(data);
};

/**
 * 알림장 생성
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
export const createCareNote = async (
  bookingId: string,
  petId: string,
  providerId: string,
  familyId: string,
  date: string,
  formData: CareNoteFormData,
  createdBy: string
): Promise<CareNote> => {
  // 1. 사진 업로드
  const photoUrls: string[] = [];
  if (formData.photos && formData.photos.length > 0) {
    for (const file of formData.photos) {
      const path = `care-notes/${providerId}/${date}/${Date.now()}-${file.name}`;
      const url = await uploadImage('PROVIDER_IMAGES', file, path);
      if (url) {
        photoUrls.push(url);
      }
    }
  }

  // 2. 알림장 생성
  const { data, error } = await supabase
    .from('care_notes')
    .insert({
      booking_id: bookingId,
      pet_id: petId,
      provider_id: providerId,
      family_id: familyId,
      date,
      mood: formData.mood,
      mood_note: formData.moodNote || null,
      activities: formData.activities,
      meals: formData.meals,
      bowel_logs: formData.bowelLogs,
      photos: photoUrls,
      comment: formData.comment || null,
      created_by: createdBy,
    })
    .select(`
      *,
      pets (id, name, profile_image),
      service_providers (id, business_name)
    `)
    .single();

  if (error) {
    console.error('Error creating care note:', error);
    throw error;
  }

  // 3. 가족에게 알림 전송
  await sendCareNoteNotification(familyId, petId, providerId, data.id);

  return mapCareNoteFromDB(data);
};

/**
 * 알림장 수정
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
export const updateCareNote = async (
  careNoteId: string,
  formData: Partial<CareNoteFormData>,
  providerId: string
): Promise<CareNote> => {
  // 기존 알림장 조회
  const { data: existing } = await supabase
    .from('care_notes')
    .select('photos, date')
    .eq('id', careNoteId)
    .single();

  // 새 사진 업로드
  let photoUrls: string[] = formData.existingPhotos || [];
  
  if (formData.photos && formData.photos.length > 0) {
    for (const file of formData.photos) {
      const path = `care-notes/${providerId}/${existing?.date}/${Date.now()}-${file.name}`;
      const url = await uploadImage('PROVIDER_IMAGES', file, path);
      if (url) {
        photoUrls.push(url);
      }
    }
  }

  const updateData: any = {};
  if (formData.mood !== undefined) updateData.mood = formData.mood;
  if (formData.moodNote !== undefined) updateData.mood_note = formData.moodNote;
  if (formData.activities !== undefined) updateData.activities = formData.activities;
  if (formData.meals !== undefined) updateData.meals = formData.meals;
  if (formData.bowelLogs !== undefined) updateData.bowel_logs = formData.bowelLogs;
  if (formData.comment !== undefined) updateData.comment = formData.comment;
  if (photoUrls.length > 0) updateData.photos = photoUrls;

  const { data, error } = await supabase
    .from('care_notes')
    .update(updateData)
    .eq('id', careNoteId)
    .select(`
      *,
      pets (id, name, profile_image),
      service_providers (id, business_name)
    `)
    .single();

  if (error) {
    console.error('Error updating care note:', error);
    throw error;
  }

  return mapCareNoteFromDB(data);
};

/**
 * 알림장 삭제
 */
export const deleteCareNote = async (careNoteId: string): Promise<void> => {
  const { error } = await supabase
    .from('care_notes')
    .delete()
    .eq('id', careNoteId);

  if (error) {
    console.error('Error deleting care note:', error);
    throw error;
  }
};

// ============================================
// Notification Services
// ============================================

/**
 * 푸시 구독 저장
 */
export const savePushSubscription = async (
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<void> => {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    }, {
      onConflict: 'user_id,endpoint',
    });

  if (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

/**
 * 알림 목록 조회
 */
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    type: item.type,
    title: item.title,
    body: item.body,
    data: item.data,
    readAt: item.read_at,
    createdAt: item.created_at,
  }));
};

/**
 * 알림 읽음 처리
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Care Note 알림 전송 (내부 함수)
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
const sendCareNoteNotification = async (
  familyId: string,
  petId: string,
  providerId: string,
  careNoteId: string
): Promise<void> => {
  try {
    // 펫 이름 조회
    const { data: pet } = await supabase
      .from('pets')
      .select('name')
      .eq('id', petId)
      .single();

    // Provider 이름 조회 (✅ FIXED)
    const { data: provider } = await supabase
      .from('service_providers')
      .select('business_name')
      .eq('id', providerId)
      .single();

    // 가족 구성원들의 ID 조회
    const { data: familyMembers } = await supabase
      .from('profiles')
      .select('id')
      .eq('family_id', familyId);

    if (!familyMembers) return;

    // 각 가족 구성원에게 알림 생성
    const notifications = familyMembers.map((member: any) => ({
      user_id: member.id,
      type: 'care_note',
      title: `${pet?.name || '반려동물'}의 알림장이 도착했어요! 📝`,
      body: `${provider?.business_name || '파트너'}에서 오늘의 알림장을 보내왔습니다.`,
      data: {
        careNoteId,
        petId,
        providerId,
      },
    }));

    await supabase.from('notifications').insert(notifications);

    // TODO: 실제 푸시 알림 전송 (Web Push API)
    // 이 부분은 서버 사이드 또는 Edge Function에서 처리해야 함
  } catch (error) {
    console.error('Error sending care note notification:', error);
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * DB 결과를 CareNote 타입으로 변환
 * ✅ FIXED: service_providers.name → service_providers.business_name
 */
const mapCareNoteFromDB = (data: any): CareNote => ({
  id: data.id,
  bookingId: data.booking_id,
  petId: data.pet_id,
  providerId: data.provider_id,
  familyId: data.family_id,
  date: data.date,
  mood: data.mood,
  moodNote: data.mood_note,
  activities: data.activities,
  meals: data.meals,
  bowelLogs: data.bowel_logs,
  photos: data.photos,
  comment: data.comment,
  createdBy: data.created_by,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  petName: data.pets?.name,
  petImage: data.pets?.profile_image,
  providerName: data.service_providers?.business_name, // ✅ FIXED
});

/**
 * Provider가 접근 가능한 펫 목록 조회
 */
export const getAccessiblePets = async (providerId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('service_bookings')
    .select(`
      pet_id,
      pets (
        id,
        name,
        species,
        breed,
        birth_date,
        gender,
        weight,
        profile_image,
        pet_allergies (id, allergy_name, severity),
        vaccination_records (id, vaccine_name, date, next_due_date)
      ),
      families (id, name)
    `)
    .eq('provider_id', providerId)
    .in('status', ['confirmed', 'completed']);

  if (error) {
    console.error('Error fetching accessible pets:', error);
    throw error;
  }

  // 중복 제거 및 펫 정보 반환
  const uniquePets = new Map();
  (data || []).forEach((item: any) => {
    if (item.pets && !uniquePets.has(item.pet_id)) {
      uniquePets.set(item.pet_id, {
        ...item.pets,
        familyId: item.families?.id,
        familyName: item.families?.name,
      });
    }
  });

  return Array.from(uniquePets.values());
};

/**
 * Provider의 오늘 예약 목록 조회 (알림장 작성 가능한)
 */
export const getTodayBookingsForCareNote = async (providerId: string): Promise<any[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('service_bookings')
    .select(`
      *,
      pets (id, name, profile_image, species, breed),
      families (id, name),
      care_notes!care_notes_booking_id_fkey (id, date)
    `)
    .eq('provider_id', providerId)
    .eq('status', 'confirmed')
    .lte('start_date', today)
    .gte('end_date', today);

  if (error) {
    console.error('Error fetching today bookings:', error);
    throw error;
  }

  // 이미 오늘 알림장이 작성되었는지 확인
  return (data || []).map((booking: any) => ({
    ...booking,
    hasTodayCareNote: booking.care_notes?.some((cn: any) => cn.date === today) || false,
  }));
};
