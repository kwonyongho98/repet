-- ============================================
-- Repet Database Schema (Idempotent Version)
-- Safe to run multiple times
-- FIXED: Infinite recursion in profiles & family_members RLS policy
-- Solution: Use SECURITY DEFINER functions to bypass RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS (Idempotent)
-- ============================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('family', 'provider');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE family_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pet_gender AS ENUM ('male', 'female');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE satisfaction_level AS ENUM ('good', 'normal', 'bad');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bowel_type AS ENUM ('urine', 'feces', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bowel_condition AS ENUM ('good', 'loose', 'hard');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE food_type AS ENUM ('dry', 'wet', 'cooked', 'treat', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM ('food', 'medical', 'grooming', 'supplies', 'training', 'hotel', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_type AS ENUM ('health', 'grooming', 'training', 'hotel', 'hospital', 'other', 'walk');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('hotel', 'training', 'grooming', 'hospital');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'cancelled_by_provider', 'cancelled_by_customer', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE distance_unit AS ENUM ('km', 'm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'family',
  family_id UUID,
  provider_id UUID,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles after families table is created
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT fk_profiles_family 
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Family Members (junction table)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role family_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Pets
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender pet_gender NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  profile_image TEXT,
  microchip_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet Allergies
CREATE TABLE IF NOT EXISTS pet_allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergy_name TEXT NOT NULL,
  severity allergy_severity,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vaccination Records
CREATE TABLE IF NOT EXISTS vaccination_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  date DATE NOT NULL,
  next_due_date DATE,
  veterinarian TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Walk Logs
CREATE TABLE IF NOT EXISTS walk_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  distance DECIMAL(5,2),
  distance_unit distance_unit DEFAULT 'km',
  satisfaction satisfaction_level DEFAULT 'normal',
  photo_url TEXT,
  path_data JSONB,
  poop_locations JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal Logs
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  meal_type meal_type NOT NULL,
  food_type food_type NOT NULL,
  food_name TEXT,
  amount INTEGER NOT NULL,
  meds_taken BOOLEAN DEFAULT FALSE,
  meds_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bowel Logs
CREATE TABLE IF NOT EXISTS bowel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  bowel_type bowel_type NOT NULL,
  condition bowel_condition NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight Logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Logs
CREATE TABLE IF NOT EXISTS expense_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount INTEGER NOT NULL,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type event_type NOT NULL,
  description TEXT,
  location TEXT,
  service_provider TEXT,
  booking_id UUID,
  related_log_id UUID,
  related_log_type TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for related_log_type
DO $$ BEGIN
  ALTER TABLE calendar_events 
  ADD CONSTRAINT calendar_events_related_log_type_check 
  CHECK (related_log_type IS NULL OR related_log_type IN ('walk', 'meal', 'bowel', 'weight', 'expense'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Service Providers
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  service_type service_type NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  business_hours JSONB,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles after service_providers table is created
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT fk_profiles_provider 
    FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Service Bookings
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  status booking_status DEFAULT 'pending',
  total_price INTEGER,
  special_requests TEXT,
  cancellation_reason TEXT,
  service_id UUID,
  created_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Comments
CREATE TABLE IF NOT EXISTS provider_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  comment TEXT NOT NULL,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Places
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recent Places
CREATE TABLE IF NOT EXISTS recent_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Todos
CREATE TABLE IF NOT EXISTS family_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Notes
CREATE TABLE IF NOT EXISTS family_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#fef3c7',
  is_pinned BOOLEAN DEFAULT FALSE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (Idempotent)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_family_id ON pets(family_id);
CREATE INDEX IF NOT EXISTS idx_pet_allergies_pet_id ON pet_allergies(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_records_pet_id ON vaccination_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_walk_logs_pet_id ON walk_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_walk_logs_date ON walk_logs(date);
CREATE INDEX IF NOT EXISTS idx_meal_logs_pet_id ON meal_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
CREATE INDEX IF NOT EXISTS idx_bowel_logs_pet_id ON bowel_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_bowel_logs_date ON bowel_logs(date);
CREATE INDEX IF NOT EXISTS idx_weight_logs_pet_id ON weight_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_expense_logs_pet_id ON expense_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_expense_logs_date ON expense_logs(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_pet_id ON calendar_events(pet_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_log_id ON calendar_events(related_log_id) WHERE related_log_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_family_id ON service_bookings(family_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_dates ON service_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_provider_comments_booking_id ON provider_comments(booking_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_recent_places_user_id ON recent_places(user_id);
CREATE INDEX IF NOT EXISTS idx_family_todos_family_id ON family_todos(family_id);
CREATE INDEX IF NOT EXISTS idx_family_notes_family_id ON family_notes(family_id);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER - Bypass RLS)
-- These functions run with elevated privileges to avoid infinite recursion
-- ============================================

-- Get current user's family_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to a specific family (bypasses RLS)
CREATE OR REPLACE FUNCTION is_family_member(check_family_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND family_id = check_family_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get pet IDs for current user's family (bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_pet_ids()
RETURNS SETOF UUID AS $$
  SELECT p.id FROM pets p
  WHERE p.family_id = (SELECT family_id FROM profiles WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (idempotent)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_families_updated_at ON families;
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_providers_updated_at ON service_providers;
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_bookings_updated_at ON service_bookings;
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_notes_updated_at ON family_notes;
CREATE TRIGGER update_family_notes_updated_at BEFORE UPDATE ON family_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'family'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES (FIXED - Using SECURITY DEFINER function)
-- ============================================

-- 자기 자신의 프로필은 항상 조회/수정 가능
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (id = auth.uid());

-- 같은 가족 멤버의 프로필 조회 (SECURITY DEFINER 함수 사용으로 무한재귀 방지)
DROP POLICY IF EXISTS "Users can view family members profiles" ON profiles;
CREATE POLICY "Users can view family members profiles" ON profiles 
  FOR SELECT USING (
    family_id IS NOT NULL AND family_id = get_my_family_id()
  );

-- 프로필 INSERT 정책
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================
-- FAMILIES POLICIES
-- ============================================

-- 모든 가족 조회 허용 (초대 코드 확인 등을 위해)
DROP POLICY IF EXISTS "View own family" ON families;
DROP POLICY IF EXISTS "View family by invite code" ON families;
DROP POLICY IF EXISTS "View families" ON families;
CREATE POLICY "View families" ON families 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Create family" ON families;
CREATE POLICY "Create family" ON families 
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Update own family" ON families;
CREATE POLICY "Update own family" ON families 
  FOR UPDATE USING (owner_id = auth.uid());

-- ============================================
-- FAMILY MEMBERS POLICIES (FIXED - Using SECURITY DEFINER function)
-- ============================================

DROP POLICY IF EXISTS "View family members" ON family_members;
CREATE POLICY "View family members" ON family_members 
  FOR SELECT USING (
    user_id = auth.uid() 
    OR family_id = get_my_family_id()
  );

DROP POLICY IF EXISTS "Join family" ON family_members;
CREATE POLICY "Join family" ON family_members 
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Leave family" ON family_members;
CREATE POLICY "Leave family" ON family_members 
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Update family members" ON family_members;
CREATE POLICY "Update family members" ON family_members 
  FOR UPDATE USING (
    family_id IN (SELECT id FROM families WHERE owner_id = auth.uid())
  );

-- ============================================
-- PETS POLICIES (FIXED - Using SECURITY DEFINER function)
-- ============================================

DROP POLICY IF EXISTS "Family pets access" ON pets;
CREATE POLICY "Family pets access" ON pets 
  FOR ALL USING (family_id = get_my_family_id());

-- ============================================
-- PET RELATED LOGS POLICIES (FIXED - Using SECURITY DEFINER function)
-- ============================================

DROP POLICY IF EXISTS "Pet allergies access" ON pet_allergies;
CREATE POLICY "Pet allergies access" ON pet_allergies 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Vaccination access" ON vaccination_records;
CREATE POLICY "Vaccination access" ON vaccination_records 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Walk logs access" ON walk_logs;
CREATE POLICY "Walk logs access" ON walk_logs 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Meal logs access" ON meal_logs;
CREATE POLICY "Meal logs access" ON meal_logs 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Bowel logs access" ON bowel_logs;
CREATE POLICY "Bowel logs access" ON bowel_logs 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Weight logs access" ON weight_logs;
CREATE POLICY "Weight logs access" ON weight_logs 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

DROP POLICY IF EXISTS "Expense logs access" ON expense_logs;
CREATE POLICY "Expense logs access" ON expense_logs 
  FOR ALL USING (pet_id IN (SELECT get_my_pet_ids()));

-- ============================================
-- CALENDAR EVENTS POLICIES (FIXED)
-- ============================================

DROP POLICY IF EXISTS "Calendar events access" ON calendar_events;
CREATE POLICY "Calendar events access" ON calendar_events 
  FOR ALL USING (family_id = get_my_family_id());

-- ============================================
-- SERVICE PROVIDERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public read providers" ON service_providers;
CREATE POLICY "Public read providers" ON service_providers 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage providers" ON service_providers;
CREATE POLICY "Owners manage providers" ON service_providers 
  FOR ALL USING (owner_id = auth.uid());

-- ============================================
-- SERVICE BOOKINGS POLICIES (FIXED)
-- ============================================

DROP POLICY IF EXISTS "Family bookings view" ON service_bookings;
CREATE POLICY "Family bookings view" ON service_bookings 
  FOR SELECT USING (family_id = get_my_family_id());

DROP POLICY IF EXISTS "Family bookings create" ON service_bookings;
CREATE POLICY "Family bookings create" ON service_bookings 
  FOR INSERT WITH CHECK (family_id = get_my_family_id());

DROP POLICY IF EXISTS "Family bookings update" ON service_bookings;
CREATE POLICY "Family bookings update" ON service_bookings 
  FOR UPDATE USING (family_id = get_my_family_id());

DROP POLICY IF EXISTS "Provider bookings view" ON service_bookings;
CREATE POLICY "Provider bookings view" ON service_bookings 
  FOR SELECT USING (
    provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Provider bookings update" ON service_bookings;
CREATE POLICY "Provider bookings update" ON service_bookings 
  FOR UPDATE USING (
    provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid())
  );

-- ============================================
-- PROVIDER COMMENTS POLICIES (FIXED)
-- ============================================

DROP POLICY IF EXISTS "Provider create comments" ON provider_comments;
CREATE POLICY "Provider create comments" ON provider_comments 
  FOR INSERT WITH CHECK (
    provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Family view comments" ON provider_comments;
CREATE POLICY "Family view comments" ON provider_comments 
  FOR SELECT USING (pet_id IN (SELECT get_my_pet_ids()));

-- ============================================
-- PLACES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Own saved places" ON saved_places;
CREATE POLICY "Own saved places" ON saved_places 
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Own recent places" ON recent_places;
CREATE POLICY "Own recent places" ON recent_places 
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- FAMILY BOARD POLICIES (FIXED)
-- ============================================

DROP POLICY IF EXISTS "Family todos access" ON family_todos;
CREATE POLICY "Family todos access" ON family_todos 
  FOR ALL USING (family_id = get_my_family_id());

DROP POLICY IF EXISTS "Family notes access" ON family_notes;
CREATE POLICY "Family notes access" ON family_notes 
  FOR ALL USING (family_id = get_my_family_id());

  -- service_providers 테이블에 누락된 컬럼 추가
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS business_hours JSONB;

ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);

ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_providers';

-- 2. business_name 컬럼이 없다면 추가
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS business_name TEXT NOT NULL DEFAULT '';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'service_providers'
ORDER BY ordinal_position;
