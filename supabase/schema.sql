-- ============================================
-- Repet Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('family', 'provider');
CREATE TYPE family_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE pet_gender AS ENUM ('male', 'female');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');
CREATE TYPE satisfaction_level AS ENUM ('good', 'normal', 'bad');
CREATE TYPE bowel_type AS ENUM ('urine', 'feces', 'both');
CREATE TYPE bowel_condition AS ENUM ('good', 'loose', 'hard');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE food_type AS ENUM ('dry', 'wet', 'cooked', 'treat', 'other');
CREATE TYPE expense_category AS ENUM ('food', 'medical', 'grooming', 'supplies', 'training', 'hotel', 'other');
CREATE TYPE event_type AS ENUM ('health', 'grooming', 'training', 'hotel', 'hospital', 'other');
CREATE TYPE service_type AS ENUM ('hotel', 'training', 'grooming', 'hospital');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE distance_unit AS ENUM ('km', 'm');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase Auth users)
CREATE TABLE profiles (
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
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles after families table is created
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_family 
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL;

-- Family Members (junction table)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role family_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Pets
CREATE TABLE pets (
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
CREATE TABLE pet_allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergy_name TEXT NOT NULL,
  severity allergy_severity,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vaccination Records
CREATE TABLE vaccination_records (
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
CREATE TABLE walk_logs (
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
CREATE TABLE meal_logs (
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
CREATE TABLE bowel_logs (
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
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Logs
CREATE TABLE expense_logs (
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
CREATE TABLE calendar_events (
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
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Providers
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type service_type NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  services TEXT[] DEFAULT ARRAY[]::TEXT[],
  price_range TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Bookings
CREATE TABLE service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status booking_status DEFAULT 'pending',
  price INTEGER NOT NULL,
  notes TEXT,
  pet_info_snapshot JSONB,
  calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Comments (Daily Reports)
CREATE TABLE provider_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  image_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Places
CREATE TABLE saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Recent Places
CREATE TABLE recent_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Family Todos
CREATE TABLE family_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  created_by TEXT NOT NULL,
  due_date DATE,
  pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Notes
CREATE TABLE family_notes (
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
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_pets_family_id ON pets(family_id);
CREATE INDEX idx_pet_allergies_pet_id ON pet_allergies(pet_id);
CREATE INDEX idx_vaccination_records_pet_id ON vaccination_records(pet_id);
CREATE INDEX idx_walk_logs_pet_id ON walk_logs(pet_id);
CREATE INDEX idx_walk_logs_date ON walk_logs(date);
CREATE INDEX idx_meal_logs_pet_id ON meal_logs(pet_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);
CREATE INDEX idx_bowel_logs_pet_id ON bowel_logs(pet_id);
CREATE INDEX idx_bowel_logs_date ON bowel_logs(date);
CREATE INDEX idx_weight_logs_pet_id ON weight_logs(pet_id);
CREATE INDEX idx_expense_logs_pet_id ON expense_logs(pet_id);
CREATE INDEX idx_expense_logs_date ON expense_logs(date);
CREATE INDEX idx_calendar_events_family_id ON calendar_events(family_id);
CREATE INDEX idx_calendar_events_pet_id ON calendar_events(pet_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_service_bookings_provider_id ON service_bookings(provider_id);
CREATE INDEX idx_service_bookings_family_id ON service_bookings(family_id);
CREATE INDEX idx_provider_comments_booking_id ON provider_comments(booking_id);
CREATE INDEX idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX idx_recent_places_user_id ON recent_places(user_id);
CREATE INDEX idx_family_todos_family_id ON family_todos(family_id);
CREATE INDEX idx_family_notes_family_id ON family_notes(family_id);

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

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view family members" ON profiles FOR SELECT 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- Families policies
CREATE POLICY "View own family" ON families FOR SELECT 
  USING (id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()));
CREATE POLICY "Create family" ON families FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own family" ON families FOR UPDATE USING (owner_id = auth.uid());

-- Family members policies
CREATE POLICY "View family members" ON family_members FOR SELECT 
  USING (family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid()));
CREATE POLICY "Join family" ON family_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Pets policies
CREATE POLICY "Family pets access" ON pets FOR ALL 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- Pet allergies policies
CREATE POLICY "Pet allergies access" ON pet_allergies FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

-- Vaccination records policies
CREATE POLICY "Vaccination access" ON vaccination_records FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

-- Daily logs policies
CREATE POLICY "Walk logs access" ON walk_logs FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Meal logs access" ON meal_logs FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Bowel logs access" ON bowel_logs FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Weight logs access" ON weight_logs FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Expense logs access" ON expense_logs FOR ALL 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

-- Calendar events policies
CREATE POLICY "Calendar events access" ON calendar_events FOR ALL 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- Service providers policies
CREATE POLICY "Public read providers" ON service_providers FOR SELECT USING (true);
CREATE POLICY "Owners manage providers" ON service_providers FOR ALL USING (owner_id = auth.uid());

-- Service bookings policies
CREATE POLICY "Family bookings view" ON service_bookings FOR SELECT 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Family bookings create" ON service_bookings FOR INSERT 
  WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Provider bookings view" ON service_bookings FOR SELECT 
  USING (provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid()));
CREATE POLICY "Provider bookings update" ON service_bookings FOR UPDATE 
  USING (provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid()));

-- Provider comments policies
CREATE POLICY "Provider create comments" ON provider_comments FOR INSERT 
  WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE owner_id = auth.uid()));
CREATE POLICY "Family view comments" ON provider_comments FOR SELECT 
  USING (pet_id IN (SELECT id FROM pets WHERE family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())));

-- Saved/Recent places policies
CREATE POLICY "Own saved places" ON saved_places FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Own recent places" ON recent_places FOR ALL USING (user_id = auth.uid());

-- Family board policies
CREATE POLICY "Family todos access" ON family_todos FOR ALL 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Family notes access" ON family_notes FOR ALL 
  USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));
