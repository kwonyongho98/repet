-- ============================================
-- Migration: Booking System MVP
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENUMS (새로운 상태 추가)
-- ============================================

-- booking_status가 이미 있다면 새 값 추가
DO $$ 
BEGIN
    -- cancelled_by_provider, cancelled_by_customer 추가
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled_by_provider' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
    ) THEN
        ALTER TYPE booking_status ADD VALUE 'cancelled_by_provider';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled_by_customer' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
    ) THEN
        ALTER TYPE booking_status ADD VALUE 'cancelled_by_customer';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'no_show' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'booking_status')
    ) THEN
        ALTER TYPE booking_status ADD VALUE 'no_show';
    END IF;
END $$;

-- ============================================
-- 2. Provider Services (업체별 서비스 상세)
-- ============================================

CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- 서비스 정보
  name TEXT NOT NULL,                    -- "소형견 목욕", "대형견 풀코스"
  description TEXT,
  service_category service_type NOT NULL, -- grooming, hotel, training, hospital
  
  -- 가격 & 시간
  base_price INTEGER NOT NULL,           -- 기본 가격 (원)
  duration_minutes INTEGER,              -- 소요 시간 (분) - 호텔은 NULL
  
  -- 대상
  pet_size_allowed TEXT[] DEFAULT ARRAY['small', 'medium', 'large']::TEXT[],
  pet_species_allowed TEXT[] DEFAULT ARRAY['dog', 'cat']::TEXT[],
  
  -- 수용
  max_daily_bookings INTEGER DEFAULT 10, -- 하루 최대 예약 수
  
  -- 상태
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Provider Availability (운영 시간)
-- ============================================

CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- 요일별 운영 (0=일, 1=월, ... 6=토)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- 운영 시간
  open_time TIME NOT NULL,              -- 09:00
  close_time TIME NOT NULL,             -- 18:00
  
  -- 휴무
  is_closed BOOLEAN DEFAULT false,
  
  UNIQUE(provider_id, day_of_week)
);

-- ============================================
-- 4. Provider Blackouts (휴무일/예외)
-- ============================================

CREATE TABLE IF NOT EXISTS provider_blackouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  
  -- 휴무 기간
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 사유
  reason TEXT,                          -- "설 연휴", "인테리어 공사"
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Bookings 테이블 확장 (기존 service_bookings 활용)
-- ============================================

-- 새 컬럼 추가
ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS start_time TIME;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS end_time TIME;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS special_requests TEXT;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE service_bookings 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- ============================================
-- 6. Booking Reviews (리뷰)
-- ============================================

CREATE TABLE IF NOT EXISTS booking_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  
  -- 평점
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- 리뷰 내용
  content TEXT,
  
  -- 사진
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- 업체 답변
  reply TEXT,
  replied_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(booking_id) -- 예약당 하나의 리뷰만
);

-- ============================================
-- 7. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id 
ON provider_services(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_services_category 
ON provider_services(service_category);

CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id 
ON provider_availability(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_blackouts_provider_id 
ON provider_blackouts(provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_blackouts_dates 
ON provider_blackouts(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_service_bookings_service_id 
ON service_bookings(service_id);

CREATE INDEX IF NOT EXISTS idx_service_bookings_dates 
ON service_bookings(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_service_bookings_status 
ON service_bookings(status);

CREATE INDEX IF NOT EXISTS idx_booking_reviews_provider_id 
ON booking_reviews(provider_id);

-- ============================================
-- 8. RLS Policies
-- ============================================

ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reviews ENABLE ROW LEVEL SECURITY;

-- Provider Services: 누구나 읽기, 업체 소유자만 수정
CREATE POLICY "Provider services read" ON provider_services 
FOR SELECT USING (true);

CREATE POLICY "Provider services write" ON provider_services 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM service_providers sp 
    WHERE sp.id = provider_id AND sp.owner_id = auth.uid()
  )
);

-- Provider Availability: 누구나 읽기, 업체 소유자만 수정
CREATE POLICY "Provider availability read" ON provider_availability 
FOR SELECT USING (true);

CREATE POLICY "Provider availability write" ON provider_availability 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM service_providers sp 
    WHERE sp.id = provider_id AND sp.owner_id = auth.uid()
  )
);

-- Provider Blackouts: 누구나 읽기, 업체 소유자만 수정
CREATE POLICY "Provider blackouts read" ON provider_blackouts 
FOR SELECT USING (true);

CREATE POLICY "Provider blackouts write" ON provider_blackouts 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM service_providers sp 
    WHERE sp.id = provider_id AND sp.owner_id = auth.uid()
  )
);

-- Booking Reviews: 누구나 읽기, 작성자만 수정
CREATE POLICY "Booking reviews read" ON booking_reviews 
FOR SELECT USING (true);

CREATE POLICY "Booking reviews write" ON booking_reviews 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM families f 
    JOIN family_members fm ON f.id = fm.family_id
    WHERE f.id = family_id AND fm.user_id = auth.uid()
  )
);

-- ============================================
-- 9. Functions
-- ============================================

-- 특정 날짜의 예약 가능 여부 확인
CREATE OR REPLACE FUNCTION check_booking_availability(
  p_provider_id UUID,
  p_service_id UUID,
  p_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
  v_max_bookings INTEGER;
  v_current_bookings INTEGER;
  v_day_of_week INTEGER;
  v_is_closed BOOLEAN;
  v_is_blackout BOOLEAN;
BEGIN
  -- 1. 서비스의 최대 예약 수 확인
  SELECT max_daily_bookings INTO v_max_bookings
  FROM provider_services
  WHERE id = p_service_id AND provider_id = p_provider_id;
  
  IF v_max_bookings IS NULL THEN
    RETURN false;
  END IF;
  
  -- 2. 요일 확인
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;
  
  -- 3. 해당 요일 휴무 확인
  SELECT is_closed INTO v_is_closed
  FROM provider_availability
  WHERE provider_id = p_provider_id AND day_of_week = v_day_of_week;
  
  IF v_is_closed = true THEN
    RETURN false;
  END IF;
  
  -- 4. 특별 휴무일 확인
  SELECT EXISTS (
    SELECT 1 FROM provider_blackouts
    WHERE provider_id = p_provider_id
    AND p_date BETWEEN start_date AND end_date
  ) INTO v_is_blackout;
  
  IF v_is_blackout THEN
    RETURN false;
  END IF;
  
  -- 5. 현재 예약 수 확인
  SELECT COUNT(*) INTO v_current_bookings
  FROM service_bookings
  WHERE provider_id = p_provider_id
  AND service_id = p_service_id
  AND start_date = p_date
  AND status IN ('pending', 'confirmed');
  
  -- 6. 예약 가능 여부 반환
  RETURN v_current_bookings < v_max_bookings;
END;
$$ LANGUAGE plpgsql;

-- 예약 생성 시 자동 검증
CREATE OR REPLACE FUNCTION validate_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- 예약 가능 여부 확인
  IF NOT check_booking_availability(NEW.provider_id, NEW.service_id, NEW.start_date) THEN
    RAISE EXCEPTION 'Booking not available for this date';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 (INSERT 시에만)
DROP TRIGGER IF EXISTS validate_booking_trigger ON service_bookings;
CREATE TRIGGER validate_booking_trigger
BEFORE INSERT ON service_bookings
FOR EACH ROW
WHEN (NEW.service_id IS NOT NULL)
EXECUTE FUNCTION validate_booking();

-- ============================================
-- 10. Updated Triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_provider_services_updated_at ON provider_services;
CREATE TRIGGER update_provider_services_updated_at 
BEFORE UPDATE ON provider_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_booking_reviews_updated_at ON booking_reviews;
CREATE TRIGGER update_booking_reviews_updated_at 
BEFORE UPDATE ON booking_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
