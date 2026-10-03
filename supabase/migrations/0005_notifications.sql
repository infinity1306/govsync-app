-- Create the notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() OR true); -- OR true for demo mode

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Demo insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Trigger Function: Project Updates (Blocked & Payout Requested)
CREATE OR REPLACE FUNCTION notify_project_updates()
RETURNS TRIGGER AS $$
DECLARE
  contractor_id_var uuid;
  finance_user_id uuid;
BEGIN
  -- Notify Contractor if blocked
  IF NEW.status = 'Blocked' AND OLD.status != 'Blocked' THEN
    IF NEW.contractor_name IS NOT NULL THEN
      FOR contractor_id_var IN 
        SELECT id FROM profiles WHERE role = 'contractor' AND full_name = NEW.contractor_name
      LOOP
        INSERT INTO notifications (user_id, title, body, link)
        VALUES (contractor_id_var, 'Project Blocked', 'Your project ' || NEW.name || ' has been blocked due to a conflict.', '/dashboard/contractor');
      END LOOP;
    END IF;
  END IF;

  -- Notify Finance if payout requested
  IF NEW.payout_requested = true AND OLD.payout_requested = false THEN
    FOR finance_user_id IN 
      SELECT id FROM profiles WHERE role = 'finance'
    LOOP
      INSERT INTO notifications (user_id, title, body, link)
      VALUES (finance_user_id, 'Payout Requested', 'A milestone payout was requested for ' || NEW.name || '.', '/dashboard/finance');
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_updates_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_updates();

-- Trigger Function: AI Warnings Inserted
CREATE OR REPLACE FUNCTION notify_ai_warnings()
RETURNS TRIGGER AS $$
DECLARE
  dept_user_id uuid;
  proj_dept_id uuid;
BEGIN
  SELECT department_id INTO proj_dept_id FROM projects WHERE id = NEW.project_id;
  
  IF proj_dept_id IS NOT NULL THEN
    FOR dept_user_id IN 
      SELECT id FROM profiles WHERE department_id = proj_dept_id
    LOOP
      INSERT INTO notifications (user_id, title, body, link)
      VALUES (dept_user_id, 'New AI Warning', NEW.title || ' on project ' || NEW.project_id, '/dashboard/dept/portal');
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_warnings_insert_trigger
  AFTER INSERT ON ai_warnings
  FOR EACH ROW
  EXECUTE FUNCTION notify_ai_warnings();

-- Trigger Function: Escrow Ledger Inserted (Release)
CREATE OR REPLACE FUNCTION notify_escrow_release()
RETURNS TRIGGER AS $$
DECLARE
  proj_name text;
  proj_dept_id uuid;
  proj_contractor text;
  dept_user_id uuid;
  contractor_user_id uuid;
BEGIN
  IF NEW.type = 'release' AND NEW.project_id IS NOT NULL THEN
    SELECT name, department_id, contractor_name INTO proj_name, proj_dept_id, proj_contractor
    FROM projects WHERE id = NEW.project_id;

    -- Notify department users
    IF proj_dept_id IS NOT NULL THEN
      FOR dept_user_id IN 
        SELECT id FROM profiles WHERE department_id = proj_dept_id
      LOOP
        INSERT INTO notifications (user_id, title, body, link)
        VALUES (dept_user_id, 'Funds Released', '₹' || NEW.amount || 'Cr released for ' || COALESCE(proj_name, NEW.project_id), '/dashboard/dept/portal');
      END LOOP;
    END IF;

    -- Notify contractor
    IF proj_contractor IS NOT NULL THEN
      FOR contractor_user_id IN 
        SELECT id FROM profiles WHERE role = 'contractor' AND full_name = proj_contractor
      LOOP
        INSERT INTO notifications (user_id, title, body, link)
        VALUES (contractor_user_id, 'Milestone Paid', 'Finance has released ₹' || NEW.amount || 'Cr for ' || COALESCE(proj_name, NEW.project_id), '/dashboard/contractor');
      END LOOP;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER escrow_release_insert_trigger
  AFTER INSERT ON escrow_ledger
  FOR EACH ROW
  EXECUTE FUNCTION notify_escrow_release();

NOTIFY pgrst, 'reload schema';
