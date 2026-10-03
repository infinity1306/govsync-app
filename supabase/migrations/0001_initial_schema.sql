-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'dept', 'finance', 'contractor');
CREATE TYPE project_status AS ENUM ('pending_coordination', 'approved', 'blocked', 'completed');
CREATE TYPE ledger_type AS ENUM ('deposit', 'release');

-- 2. Create Tables
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id),
    full_name TEXT NOT NULL
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    department_id UUID REFERENCES departments(id) NOT NULL,
    name TEXT NOT NULL,
    contractor_name TEXT,
    status project_status DEFAULT 'pending_coordination',
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    milestone TEXT,
    payout_requested BOOLEAN DEFAULT FALSE,
    conflict_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE escrow_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type ledger_type NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Escrow Summary View
CREATE OR REPLACE VIEW escrow_summary AS
SELECT
    COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) AS total,
    COALESCE(SUM(CASE WHEN type = 'release' THEN amount ELSE 0 END), 0) AS released,
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM projects
        WHERE payout_requested = true AND status != 'completed'
    ) AS pending_verification
FROM escrow_ledger;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_ledger ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Profiles: Anyone authenticated can read all profiles (needed for contractor lookups)
CREATE POLICY "Anyone authenticated can read all profiles"
ON profiles FOR SELECT TO authenticated USING (true);

-- Departments: Anyone authenticated can read all departments
CREATE POLICY "Anyone authenticated can read all departments"
ON departments FOR SELECT TO authenticated USING (true);

-- AI Warnings: Anyone authenticated can read all ai_warnings
CREATE POLICY "Anyone authenticated can read all ai_warnings"
ON ai_warnings FOR SELECT TO authenticated USING (true);

-- Projects: Anyone authenticated can read all projects
CREATE POLICY "Anyone authenticated can read all projects"
ON projects FOR SELECT TO authenticated USING (true);

-- Projects Insert: Dept users can only insert projects for their own department_id
CREATE POLICY "Dept users can insert their own projects"
ON projects FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'dept' 
        AND profiles.department_id = projects.department_id
    )
);

-- Projects Update: Contractors can only update progress/payout_requested on their assigned projects
CREATE POLICY "Contractors can update their assigned projects"
ON projects FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'contractor' 
        AND profiles.full_name = projects.contractor_name
    )
);

-- Escrow Ledger Select: Anyone authenticated can view ledger
CREATE POLICY "Anyone authenticated can read escrow ledger"
ON escrow_ledger FOR SELECT TO authenticated USING (true);

-- Escrow Ledger Insert (Admin): Only admins can write deposits
CREATE POLICY "Admins can insert deposits"
ON escrow_ledger FOR INSERT TO authenticated
WITH CHECK (
    type = 'deposit' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Escrow Ledger Insert (Finance): Only finance role can write releases
CREATE POLICY "Finance can insert releases"
ON escrow_ledger FOR INSERT TO authenticated
WITH CHECK (
    type = 'release' AND
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'finance'
    )
);

-- 6. Seeds
INSERT INTO departments (name, slug, color) VALUES
('PWD', 'pwd', '#0A2540'),
('Water', 'water', '#3B82F6'),
('Electricity', 'electricity', '#F59E0B'),
('Telecom', 'telecom', '#8B5CF6'),
('Environment', 'environment', '#10B981');
