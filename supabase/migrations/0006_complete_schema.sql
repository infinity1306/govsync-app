-- Migration 0006: Complete schema for full cross-portal data flow
-- Adds missing columns, department_responses table, new statuses, and open RLS policies

-- 1. Add new status enum values
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'awaiting_responses';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'responses_received';

-- 2. Add missing columns to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS location_desc TEXT,
  ADD COLUMN IF NOT EXISTS scope TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS dept_slug TEXT;

-- 3. Create department_responses table for cross-dept coordination
CREATE TABLE IF NOT EXISTS department_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  dept_slug TEXT NOT NULL,
  dept_name TEXT,
  timeline TEXT,
  budget NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE department_responses ENABLE ROW LEVEL SECURITY;

-- 4. Permissive RLS policies for demo portal flow (anon access)
-- These allow the app to function without requiring Supabase Auth for every action.

-- Projects: allow all operations for anon/authenticated
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all select on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow all select on projects" ON projects FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all insert on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow all insert on projects" ON projects FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all update on projects' AND tablename = 'projects') THEN
    CREATE POLICY "Allow all update on projects" ON projects FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- AI Warnings: allow all operations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all insert on ai_warnings' AND tablename = 'ai_warnings') THEN
    CREATE POLICY "Allow all insert on ai_warnings" ON ai_warnings FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all update on ai_warnings' AND tablename = 'ai_warnings') THEN
    CREATE POLICY "Allow all update on ai_warnings" ON ai_warnings FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all select on ai_warnings' AND tablename = 'ai_warnings') THEN
    CREATE POLICY "Allow all select on ai_warnings" ON ai_warnings FOR SELECT USING (true);
  END IF;
END $$;

-- Escrow Ledger: allow all operations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all insert on escrow_ledger' AND tablename = 'escrow_ledger') THEN
    CREATE POLICY "Allow all insert on escrow_ledger" ON escrow_ledger FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all select on escrow_ledger' AND tablename = 'escrow_ledger') THEN
    CREATE POLICY "Allow all select on escrow_ledger" ON escrow_ledger FOR SELECT USING (true);
  END IF;
END $$;

-- Department Responses: allow all operations
CREATE POLICY "Allow all select on department_responses" ON department_responses FOR SELECT USING (true);
CREATE POLICY "Allow all insert on department_responses" ON department_responses FOR INSERT WITH CHECK (true);

-- Departments: allow all operations (already has authenticated SELECT, add anon)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon select on departments' AND tablename = 'departments') THEN
    CREATE POLICY "Allow anon select on departments" ON departments FOR SELECT USING (true);
  END IF;
END $$;

-- Profiles: allow anon select
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon select on profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Allow anon select on profiles" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Notifications: ensure full access
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all select on notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Allow all select on notifications" ON notifications FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all insert on notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Allow all insert on notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
