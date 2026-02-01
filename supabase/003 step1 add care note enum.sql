-- ============================================
-- Migration 003 - Step 1: ENUM 값 추가 & 제약조건 수정
-- ⚠️ 이 파일을 먼저 실행한 후, Step 2를 실행하세요
-- ============================================

-- 1. event_type ENUM에 'care_note' 값 추가
DO $$ BEGIN
  ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'care_note';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. related_log_type CHECK 제약조건 업데이트 (care_note 허용)
DO $$ BEGIN
  ALTER TABLE calendar_events 
  DROP CONSTRAINT IF EXISTS calendar_events_related_log_type_check;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

ALTER TABLE calendar_events 
ADD CONSTRAINT calendar_events_related_log_type_check 
CHECK (related_log_type IS NULL OR related_log_type IN ('walk', 'meal', 'bowel', 'weight', 'expense', 'care_note'));