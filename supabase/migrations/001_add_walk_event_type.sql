-- ============================================
-- Migration: Add Walk Event Type & Related Log Fields
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add 'walk' to event_type enum
-- Note: PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE
-- So we need to check first

DO $$ 
BEGIN
    -- Check if 'walk' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumlabel = 'walk' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type')
    ) THEN
        ALTER TYPE event_type ADD VALUE 'walk';
    END IF;
END $$;

-- 2. Add related_log_id and related_log_type columns to calendar_events
-- These columns allow linking calendar events to daily logs (walks, meals, etc.)

ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS related_log_id UUID;

ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS related_log_type TEXT;

-- 3. Add constraint for related_log_type
-- (Only if column was just created)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'calendar_events_related_log_type_check'
        AND table_name = 'calendar_events'
    ) THEN
        ALTER TABLE calendar_events 
        ADD CONSTRAINT calendar_events_related_log_type_check 
        CHECK (related_log_type IS NULL OR related_log_type IN ('walk', 'meal', 'bowel', 'weight', 'expense'));
    END IF;
END $$;

-- 4. Create index for faster lookups by related_log_id
CREATE INDEX IF NOT EXISTS idx_calendar_events_related_log_id 
ON calendar_events(related_log_id) 
WHERE related_log_id IS NOT NULL;

-- 5. Comment for documentation
COMMENT ON COLUMN calendar_events.related_log_id IS 'Reference to daily log entry (walk_logs, meal_logs, etc.)';
COMMENT ON COLUMN calendar_events.related_log_type IS 'Type of related log: walk, meal, bowel, weight, expense';

-- ============================================
-- Verification Query (optional)
-- ============================================
-- Run this to verify the changes:
-- 
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'calendar_events'
-- ORDER BY ordinal_position;
--
-- SELECT enumlabel FROM pg_enum 
-- WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'event_type');
