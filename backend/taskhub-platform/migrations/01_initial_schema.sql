
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user', -- 'admin' or 'user' [cite: 36, 49]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, assigned, in_progress, submitted, accepted, revision_requested [cite: 54]
  assigned_to UUID REFERENCES users(id),
  product_image_url TEXT NOT NULL, 
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL, -- e.g., 'white_bg', 'theme', 'artistic', 'model' [cite: 97]
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  metadata JSONB,
  angle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- Users can only see their own profile data
CREATE POLICY "View own profile" ON users FOR SELECT USING (auth.uid() = id);

-- Users see assigned tasks; Admins see all tasks
CREATE POLICY "Task visibility" ON tasks FOR SELECT 
USING (assigned_to = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Only Admins can create new tasks
CREATE POLICY "Admin task creation" ON tasks FOR INSERT 
WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');