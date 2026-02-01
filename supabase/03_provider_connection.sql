-- ============================================
-- Repet Provider Connection System (Idempotent)
-- "Kids Note Style" Provider-Family Connection
-- This file consolidates provider_connection_schema.sql and partner_schema.sql
-- ============================================

-- ============================================
-- ENUMS (Idempotent)
-- ============================================

-- Connection status
DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'active', 'paused', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Care note mood types
DO $$ BEGIN
  CREATE TYPE care_mood AS ENUM ('happy', 'good', 'normal', 'tired', 'sick');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Provider Connections (펫별 연결)
-- 가족-Provider 연결을 펫 단위로 관리
CREATE TABLE IF NOT EXISTS provider_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 주체 (펫별 연결)
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  
  -- 연결 정보
  status connection_status DEFAULT 'pending',
  
  -- 연결 방식
  connection_type TEXT DEFAULT 'invite', -- 'invite' | 'booking'
  invite_code TEXT,
  booking_id UUID REFERENCES service_bookings(id),
  
  -- 권한 설정
  permissions JSONB DEFAULT '{
    "view_pet_info": true,
    "view_health_records": true,
    "view_allergies": true,
    "create_care_notes": true,
    "view_past_logs": true,
    "view_expenses": false
  }'::jsonb,
  
  -- 메타
  connected_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 동일 Provider-Pet 연결은 하나만
  UNIQUE(provider_id, pet_id)
);

-- Provider Invites (초대 코드)
-- Provider가 생성 → Family가 코드 입력 → 펫 선택 → 연결
CREATE TABLE IF NOT EXISTS provider_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 초대 생성자 (Provider)
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- 초대 코드 (6자리)
  code TEXT UNIQUE NOT NULL,
  
  -- 메타
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Notes (알림장/돌봄일지)
-- booking_id를 NULLABLE로 변경하여 예약 없이도 작성 가능
CREATE TABLE IF NOT EXISTS care_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 관계
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  -- 예약 연결 (NULLABLE - 예약 없이도 작성 가능)
  booking_id UUID REFERENCES service_bookings(id) ON DELETE SET NULL,
  
  -- 날짜
  date DATE NOT NULL,
  
  -- 기분/컨디션
  mood care_mood NOT NULL DEFAULT 'normal',
  mood_note TEXT,
  
  -- 활동 체크리스트
  activities JSONB DEFAULT '{
    "nap": false,
    "snack": false,
    "play": false,
    "walk": false,
    "grooming": false,
    "training": false,
    "socialization": false
  }'::jsonb,
  
  -- 식사 정보
  meals JSONB DEFAULT '[]'::jsonb,
  -- 예: [{"time": "09:00", "type": "breakfast", "amount": 100, "ate_well": true}]
  
  -- 배변 정보
  bowel_logs JSONB DEFAULT '[]'::jsonb,
  -- 예: [{"time": "10:30", "type": "both", "condition": "good"}]
  
  -- 사진 (최대 5장)
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 코멘트
  comment TEXT,
  
  -- 코멘트 수 (denormalized for performance)
  comment_count INTEGER DEFAULT 0,
  
  -- 메타
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 하루에 펫당 하나의 알림장 제약 조건 (예약 없는 경우)
-- 예약이 있으면 예약당 하나
-- PostgreSQL에서 UNIQUE 제약조건에 COALESCE 사용 불가하므로 
-- 대신 부분 인덱스와 별도 제약조건 사용
CREATE UNIQUE INDEX IF NOT EXISTS idx_care_notes_daily_without_booking 
ON care_notes(provider_id, pet_id, date) 
WHERE booking_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_care_notes_with_booking 
ON care_notes(provider_id, pet_id, date, booking_id) 
WHERE booking_id IS NOT NULL;

-- ============================================
-- Care Note Comments (알림장 댓글)
-- ============================================

CREATE TABLE IF NOT EXISTS care_note_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_note_id UUID NOT NULL REFERENCES care_notes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('family', 'provider')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Announcements (공지사항)
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Announcement Reads (읽음 확인)
-- ============================================

CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

-- ============================================
-- Notifications (알림)
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'care_note', 'connection', 'booking', 'reminder'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Push Subscriptions (푸시 구독)
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- ============================================
-- INDEXES (Idempotent)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_provider_connections_provider ON provider_connections(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_family ON provider_connections(family_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_pet ON provider_connections(pet_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_status ON provider_connections(status);

CREATE INDEX IF NOT EXISTS idx_provider_invites_provider ON provider_invites(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_invites_code ON provider_invites(code);

CREATE INDEX IF NOT EXISTS idx_care_notes_provider ON care_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_care_notes_pet ON care_notes(pet_id);
CREATE INDEX IF NOT EXISTS idx_care_notes_family ON care_notes(family_id);
CREATE INDEX IF NOT EXISTS idx_care_notes_date ON care_notes(date);
CREATE INDEX IF NOT EXISTS idx_care_notes_booking ON care_notes(booking_id);

CREATE INDEX IF NOT EXISTS idx_care_note_comments_care_note_id ON care_note_comments(care_note_id);
CREATE INDEX IF NOT EXISTS idx_care_note_comments_author_id ON care_note_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_provider_id ON announcements(provider_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ============================================
-- TRIGGERS (Idempotent)
-- ============================================

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_provider_connections_updated_at ON provider_connections;
CREATE TRIGGER update_provider_connections_updated_at 
  BEFORE UPDATE ON provider_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_care_notes_updated_at ON care_notes;
CREATE TRIGGER update_care_notes_updated_at 
  BEFORE UPDATE ON care_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CONNECTION ON BOOKING (예약 시 자동 연결)
-- ============================================

CREATE OR REPLACE FUNCTION auto_connect_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- 새 예약이 확인(confirmed)되면 자동으로 연결 생성
  IF NEW.status = 'confirmed' THEN
    INSERT INTO provider_connections (
      provider_id,
      family_id,
      pet_id,
      status,
      connection_type,
      booking_id,
      connected_at,
      created_by
    ) VALUES (
      NEW.provider_id,
      NEW.family_id,
      NEW.pet_id,
      'active',
      'booking',
      NEW.id,
      NOW(),
      NEW.created_by
    )
    ON CONFLICT (provider_id, pet_id) DO UPDATE
    SET 
      status = 'active',
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_connect_on_booking ON service_bookings;
CREATE TRIGGER trigger_auto_connect_on_booking
  AFTER INSERT OR UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION auto_connect_on_booking();

-- ============================================
-- Comment Count Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_care_note_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE care_notes SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = NEW.care_note_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE care_notes SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0) WHERE id = OLD.care_note_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS care_note_comment_count_trigger ON care_note_comments;
CREATE TRIGGER care_note_comment_count_trigger
  AFTER INSERT OR DELETE ON care_note_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_care_note_comment_count();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- 현재 유저의 provider_id 가져오기
CREATE OR REPLACE FUNCTION get_user_provider_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT provider_id FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Provider가 특정 펫에 연결되어 있는지 확인
CREATE OR REPLACE FUNCTION is_connected_to_pet(
  p_provider_id UUID,
  p_pet_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM provider_connections
    WHERE provider_id = p_provider_id
      AND pet_id = p_pet_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (Idempotent)
-- ============================================

ALTER TABLE provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Provider Connections Policies
-- ============================================

-- 가족은 자신의 펫 연결 조회 가능
DROP POLICY IF EXISTS "Family view own connections" ON provider_connections;
CREATE POLICY "Family view own connections" ON provider_connections
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- 가족은 자신의 펫 연결 관리 가능
DROP POLICY IF EXISTS "Family manage own connections" ON provider_connections;
CREATE POLICY "Family manage own connections" ON provider_connections
  FOR ALL USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- Provider는 자신의 연결 조회 가능
DROP POLICY IF EXISTS "Provider view own connections" ON provider_connections;
CREATE POLICY "Provider view own connections" ON provider_connections
  FOR SELECT USING (
    provider_id = get_user_provider_id()
  );

-- Provider는 연결 생성 가능 (초대코드 수락 시)
DROP POLICY IF EXISTS "Provider create connections" ON provider_connections;
CREATE POLICY "Provider create connections" ON provider_connections
  FOR INSERT WITH CHECK (
    provider_id = get_user_provider_id()
  );

-- ============================================
-- Provider Invites Policies
-- ============================================

-- Provider는 자신의 초대 코드 관리
DROP POLICY IF EXISTS "Provider manage own invites" ON provider_invites;
CREATE POLICY "Provider manage own invites" ON provider_invites
  FOR ALL USING (
    provider_id = get_user_provider_id()
  );

-- 누구나 초대 코드 조회 가능 (코드 검증용)
DROP POLICY IF EXISTS "Anyone can view invites" ON provider_invites;
CREATE POLICY "Anyone can view invites" ON provider_invites
  FOR SELECT USING (true);

-- ============================================
-- Care Notes Policies
-- ============================================

-- 가족은 자신의 펫 알림장 조회 가능
DROP POLICY IF EXISTS "Family view care notes" ON care_notes;
CREATE POLICY "Family view care notes" ON care_notes
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- Provider는 연결된 펫의 알림장 작성 가능
DROP POLICY IF EXISTS "Provider create care notes" ON care_notes;
CREATE POLICY "Provider create care notes" ON care_notes
  FOR INSERT WITH CHECK (
    provider_id = get_user_provider_id()
    AND is_connected_to_pet(provider_id, pet_id)
  );

-- Provider는 자신이 작성한 알림장 수정/삭제 가능
DROP POLICY IF EXISTS "Provider manage own care notes" ON care_notes;
CREATE POLICY "Provider manage own care notes" ON care_notes
  FOR ALL USING (
    provider_id = get_user_provider_id()
  );

-- ============================================
-- Care Note Comments Policies
-- ============================================

-- 가족/Provider 모두 읽기 가능 (해당 케어노트에 접근 권한이 있는 경우)
DROP POLICY IF EXISTS "read_care_note_comments" ON care_note_comments;
CREATE POLICY "read_care_note_comments" ON care_note_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM care_notes cn
      WHERE cn.id = care_note_id
      AND (
        -- 가족인 경우
        cn.family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
        -- Provider인 경우
        OR cn.provider_id = get_user_provider_id()
      )
    )
  );

-- 본인만 작성 가능
DROP POLICY IF EXISTS "insert_care_note_comments" ON care_note_comments;
CREATE POLICY "insert_care_note_comments" ON care_note_comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- 본인만 삭제 가능
DROP POLICY IF EXISTS "delete_care_note_comments" ON care_note_comments;
CREATE POLICY "delete_care_note_comments" ON care_note_comments
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- Announcements Policies
-- ============================================

-- 연결된 가족 또는 Provider 읽기 가능
DROP POLICY IF EXISTS "read_announcements" ON announcements;
CREATE POLICY "read_announcements" ON announcements
  FOR SELECT USING (
    -- Provider 소속인 경우
    provider_id = get_user_provider_id()
    -- 연결된 가족인 경우
    OR EXISTS (
      SELECT 1 FROM provider_connections pc
      JOIN profiles p ON p.family_id = pc.family_id
      WHERE pc.provider_id = announcements.provider_id
      AND p.id = auth.uid()
      AND pc.status = 'active'
    )
  );

-- Provider만 작성 가능
DROP POLICY IF EXISTS "insert_announcements" ON announcements;
CREATE POLICY "insert_announcements" ON announcements
  FOR INSERT WITH CHECK (
    provider_id = get_user_provider_id()
  );

-- Provider만 삭제 가능
DROP POLICY IF EXISTS "delete_announcements" ON announcements;
CREATE POLICY "delete_announcements" ON announcements
  FOR DELETE USING (
    provider_id = get_user_provider_id()
  );

-- ============================================
-- Announcement Reads Policies
-- ============================================

-- 본인의 읽음 상태만 조회 가능
DROP POLICY IF EXISTS "read_announcement_reads" ON announcement_reads;
CREATE POLICY "read_announcement_reads" ON announcement_reads
  FOR SELECT USING (user_id = auth.uid());

-- 본인만 읽음 표시 가능
DROP POLICY IF EXISTS "insert_announcement_reads" ON announcement_reads;
CREATE POLICY "insert_announcement_reads" ON announcement_reads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- Notifications Policies
-- ============================================

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System create notifications" ON notifications;
CREATE POLICY "System create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- Push Subscriptions Policies
-- ============================================

DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- Extended Policies for Pets (Provider Read Access)
-- ============================================

-- Provider가 연결된 펫 정보 조회 가능
DROP POLICY IF EXISTS "Provider read connected pets" ON pets;
CREATE POLICY "Provider read connected pets" ON pets
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), id)
  );

-- Provider가 연결된 펫의 알러지 조회 가능
DROP POLICY IF EXISTS "Provider read pet allergies" ON pet_allergies;
CREATE POLICY "Provider read pet allergies" ON pet_allergies
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );

-- Provider가 연결된 펫의 백신 기록 조회 가능
DROP POLICY IF EXISTS "Provider read vaccination records" ON vaccination_records;
CREATE POLICY "Provider read vaccination records" ON vaccination_records
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );

-- Provider가 연결된 펫의 과거 로그 READ-ONLY 접근
DROP POLICY IF EXISTS "Provider read walk logs" ON walk_logs;
CREATE POLICY "Provider read walk logs" ON walk_logs
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Provider read meal logs" ON meal_logs;
CREATE POLICY "Provider read meal logs" ON meal_logs
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Provider read bowel logs" ON bowel_logs;
CREATE POLICY "Provider read bowel logs" ON bowel_logs
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Provider read weight logs" ON weight_logs;
CREATE POLICY "Provider read weight logs" ON weight_logs
  FOR SELECT USING (
    is_connected_to_pet(get_user_provider_id(), pet_id)
  );
ALTER TABLE care_notes 
ALTER COLUMN booking_id DROP NOT NULL;
ALTER TABLE care_notes ALTER COLUMN booking_id DROP NOT NULL;
