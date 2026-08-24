-- StatSkill AI — Migration 004: Competency Framework Schema

-- 1. Domains (Competency Domains)
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'Award',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Competencies (Individual skills within a domain)
CREATE TABLE competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  level_1_desc TEXT DEFAULT 'Basic Awareness',
  level_2_desc TEXT DEFAULT 'Novice / Guided Practice',
  level_3_desc TEXT DEFAULT 'Intermediate / Independent',
  level_4_desc TEXT DEFAULT 'Advanced / Proficient',
  level_5_desc TEXT DEFAULT 'Expert / Master Trainer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Role Competencies (Required skill levels for designations/roles)
CREATE TABLE role_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designation TEXT NOT NULL,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  required_level INTEGER NOT NULL CHECK (required_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(designation, competency_id)
);

-- 4. User Competencies (Current tracked skill level per user)
CREATE TABLE user_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL CHECK (current_level BETWEEN 1 AND 5),
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, competency_id)
);

-- Indexes for performance
CREATE INDEX idx_competencies_domain ON competencies(domain_id);
CREATE INDEX idx_role_competencies_designation ON role_competencies(designation);
CREATE INDEX idx_user_competencies_user ON user_competencies(user_id);

-- Row Level Security (RLS)
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_competencies ENABLE ROW LEVEL SECURITY;

-- Read policies for public framework data
CREATE POLICY "Domains are readable by authenticated users"
  ON domains FOR SELECT TO authenticated USING (true);

CREATE POLICY "Competencies are readable by authenticated users"
  ON competencies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Role competencies are readable by authenticated users"
  ON role_competencies FOR SELECT TO authenticated USING (true);

-- User competencies policies (Users manage their own scores)
CREATE POLICY "Users can read their own competency levels"
  ON user_competencies FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own competency levels"
  ON user_competencies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competency levels"
  ON user_competencies FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user competencies"
  ON user_competencies FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
