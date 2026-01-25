-- ============================================
-- Repet Partner System Schema
-- Run this AFTER the main schema.sql
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Partner connection status
CREATE TYPE partner_status AS ENUM ('pending', 'active', 'suspended', 'removed');

-- Care note mood types
CREATE TYPE care_mood AS ENUM ('happy', 'good', 'normal', 'tired', 'sick');

-- ============================================
-- TABLES
-- ============================================

-- Partner Connections (Family ↔ Provider 연결)
-- 예약 기반으로 특정 펫에 대한 접근 권한 부여
CREATE TABLE partner_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 연결 주체
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- 연결 정보
  status partner_status DEFAULT 'pending',
  invite_code TEXT UNIQUE,
  
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
  connected_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(family_id, provider_id)
);

-- Care Notes (알림장) - provider_comments 확장/대체
CREATE TABLE care_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 관계
  booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  -- 날짜 (서비스 이용일)
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
  
  -- 사진 (필수, 최대 5장)
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 코멘트
  comment TEXT,
  
  -- 메타
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 하루에 하나의 예약당 하나의 알림장
  UNIQUE(booking_id, date)
);

-- Partner Invite Codes (임시 초대 코드)
CREATE TABLE partner_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES service_providers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_partner_connections_family ON partner_connections(family_id);
CREATE INDEX idx_partner_connections_provider ON partner_connections(provider_id);
CREATE INDEX idx_partner_connections_status ON partner_connections(status);
CREATE INDEX idx_care_notes_booking ON care_notes(booking_id);
CREATE INDEX idx_care_notes_pet ON care_notes(pet_id);
CREATE INDEX idx_care_notes_provider ON care_notes(provider_id);
CREATE INDEX idx_care_notes_family ON care_notes(family_id);
CREATE INDEX idx_care_notes_date ON care_notes(date);
CREATE INDEX idx_partner_invites_code ON partner_invites(code);
CREATE INDEX idx_partner_invites_family ON partner_invites(family_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_partner_connections_updated_at 
  BEFORE UPDATE ON partner_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_notes_updated_at 
  BEFORE UPDATE ON care_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- 파트너가 특정 펫에 접근 가능한지 확인 (예약 기반)
CREATE OR REPLACE FUNCTION can_partner_access_pet(
  p_provider_id UUID,
  p_pet_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM service_bookings sb
    JOIN partner_connections pc ON pc.provider_id = sb.provider_id 
      AND pc.family_id = sb.family_id
    WHERE sb.provider_id = p_provider_id
      AND sb.pet_id = p_pet_id
      AND pc.status = 'active'
      AND sb.status IN ('confirmed', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 유저가 파트너(provider)인지 확인
CREATE OR REPLACE FUNCTION is_partner_user() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'provider'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 유저의 provider_id 가져오기
CREATE OR REPLACE FUNCTION get_user_provider_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT provider_id FROM profiles 
    WHERE id = auth.uid() AND role = 'provider'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Partner Connections Policies
-- ============================================

-- 가족은 자신의 파트너 연결 조회/관리 가능
CREATE POLICY "Family view own partner connections" ON partner_connections
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Family manage own partner connections" ON partner_connections
  FOR ALL USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- Provider는 자신과 연결된 가족 조회 가능
CREATE POLICY "Provider view own connections" ON partner_connections
  FOR SELECT USING (
    provider_id = get_user_provider_id()
  );

-- ============================================
-- Care Notes Policies
-- ============================================

-- 가족은 자신의 펫에 대한 알림장 조회 가능
CREATE POLICY "Family view care notes" ON care_notes
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- Provider는 자신이 작성한 알림장 CRUD 가능
CREATE POLICY "Provider manage own care notes" ON care_notes
  FOR ALL USING (
    provider_id = get_user_provider_id()
  );

-- Provider는 활성 연결된 펫에 대해서만 알림장 작성 가능
CREATE POLICY "Provider create care notes for connected pets" ON care_notes
  FOR INSERT WITH CHECK (
    provider_id = get_user_provider_id()
    AND can_partner_access_pet(provider_id, pet_id)
  );

-- ============================================
-- Partner Invites Policies
-- ============================================

-- 가족은 자신의 초대 코드 관리
CREATE POLICY "Family manage own invites" ON partner_invites
  FOR ALL USING (
    family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
  );

-- Provider는 초대 코드로 조회 가능 (가입 시)
CREATE POLICY "Provider view invite by code" ON partner_invites
  FOR SELECT USING (true);  -- 코드 검증은 애플리케이션 레벨에서

-- ============================================
-- Extended Policies for Existing Tables
-- ============================================

-- Partner가 연결된 펫 정보 READ-ONLY 접근
DROP POLICY IF EXISTS "Partner read connected pets" ON pets;
CREATE POLICY "Partner read connected pets" ON pets
  FOR SELECT USING (
    is_partner_user() 
    AND can_partner_access_pet(get_user_provider_id(), id)
  );

-- Partner가 연결된 펫의 알러지 정보 READ-ONLY 접근
DROP POLICY IF EXISTS "Partner read pet allergies" ON pet_allergies;
CREATE POLICY "Partner read pet allergies" ON pet_allergies
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

-- Partner가 연결된 펫의 백신 정보 READ-ONLY 접근
DROP POLICY IF EXISTS "Partner read vaccination records" ON vaccination_records;
CREATE POLICY "Partner read vaccination records" ON vaccination_records
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

-- Partner가 연결된 펫의 과거 로그 READ-ONLY 접근
DROP POLICY IF EXISTS "Partner read walk logs" ON walk_logs;
CREATE POLICY "Partner read walk logs" ON walk_logs
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Partner read meal logs" ON meal_logs;
CREATE POLICY "Partner read meal logs" ON meal_logs
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Partner read bowel logs" ON bowel_logs;
CREATE POLICY "Partner read bowel logs" ON bowel_logs
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

DROP POLICY IF EXISTS "Partner read weight logs" ON weight_logs;
CREATE POLICY "Partner read weight logs" ON weight_logs
  FOR SELECT USING (
    is_partner_user()
    AND can_partner_access_pet(get_user_provider_id(), pet_id)
  );

-- Partner는 expense_logs 접근 완전 차단 (기존 정책 유지, 추가 차단 없음)
-- expense_logs는 family 전용이므로 Partner에게는 정책 자체가 없음

-- ============================================
-- Push Notification Helper Table
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'care_note', 'booking', 'reminder'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
