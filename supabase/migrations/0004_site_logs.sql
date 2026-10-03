-- Create the site_logs table for contractor site log uploads
CREATE TABLE site_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_logs ENABLE ROW LEVEL SECURITY;

-- Contractors can read their own logs
CREATE POLICY "Contractors can view own logs"
  ON site_logs FOR SELECT
  USING (contractor_id = auth.uid());

-- Contractors can insert their own logs
CREATE POLICY "Contractors can insert own logs"
  ON site_logs FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

-- Admins and finance can view all logs
CREATE POLICY "Admin/finance can view all logs"
  ON site_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'finance')
    )
  );

-- Demo bypass: allow anonymous reads for demo mode
CREATE POLICY "Demo read access for site_logs"
  ON site_logs FOR SELECT
  USING (true);

CREATE POLICY "Demo insert access for site_logs"
  ON site_logs FOR INSERT
  WITH CHECK (true);

-- Create the storage bucket for site-logs
-- NOTE: Storage buckets and policies are managed via the Supabase Dashboard
-- or via the Supabase Management API. The SQL below documents the intent:
--
-- Bucket: site-logs (public)
-- RLS Policy: Contractors can upload to their own user-id-prefixed path
--   INSERT: (bucket_id = 'site-logs') AND (storage.foldername(name))[1] = auth.uid()::text
--   SELECT: true (public read for viewing uploaded media)

NOTIFY pgrst, 'reload schema';
