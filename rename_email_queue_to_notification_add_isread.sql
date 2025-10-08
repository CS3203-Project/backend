-- Rename email_queue table to notification and add isRead column
-- Migration: Rename EmailQueue table and add read status tracking
-- Generated on: 2025-10-06
-- Description: Database migration to rename email_queue to notification table and add isRead boolean field

-- Step 1: Rename the table from email_queue to notification
ALTER TABLE "email_queue" RENAME TO "notification";

-- Step 2: Add the isRead column with a default value of false
-- This column tracks whether the notification has been read by the recipient
ALTER TABLE "notification" ADD COLUMN "isRead" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Verify the migration (optional verification queries)
-- You can uncomment and run these queries to verify the migration:

-- Check table structure:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'notification'
-- ORDER BY ordinal_position;

-- Check if indexes were renamed properly (PostgreSQL should handle this automatically):
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'notification';

-- Check existing data count to ensure no data loss:
-- SELECT COUNT(*) as notification_count FROM notification;
