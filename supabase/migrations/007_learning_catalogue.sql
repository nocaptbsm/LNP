-- StatSkill AI — Migration 007: Learning Catalogue & Personalized Learning Paths Schema

-- 1. Courses Table (iGOT Karmayogi, NSSTA, TPAC, MoSPI)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL, -- 'iGOT Karmayogi', 'NSSTA', 'TPAC', 'MoSPI DIID'
  description TEXT,
  duration_hours NUMERIC(4, 1) DEFAULT 4.0,
  level TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
  external_url TEXT,
  thumbnail_url TEXT,
  rating NUMERIC(2, 1) DEFAULT 4.8,
  enrolled_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Course Competencies Mapping (Which competencies a course develops and target level)
CREATE TABLE course_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  target_level INTEGER NOT NULL CHECK (target_level BETWEEN 1 AND 5),
  relevance_weight NUMERIC(3, 2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, competency_id)
);

-- 3. Personalized Learning Paths (User's tailored learning roadmap)
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Personalized Capacity Building Path',
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  total_courses INTEGER DEFAULT 0,
  completed_courses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Learning Path Courses (Specific courses in a user's roadmap with explainability reasons)
CREATE TABLE learning_path_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id),
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  sequence_order INTEGER NOT NULL DEFAULT 1,
  recommendation_reason TEXT,
  status TEXT DEFAULT 'recommended', -- 'recommended', 'enrolled', 'completed'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(learning_path_id, course_id)
);

-- 5. User Course Progress & Enrollment Tracking
CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled', -- 'enrolled', 'in_progress', 'completed'
  progress_percentage INTEGER DEFAULT 0,
  hours_spent NUMERIC(4, 1) DEFAULT 0.0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Indexes for performance
CREATE INDEX idx_courses_provider ON courses(provider);
CREATE INDEX idx_course_competencies_competency ON course_competencies(competency_id);
CREATE INDEX idx_learning_paths_user ON learning_paths(user_id);
CREATE INDEX idx_learning_path_courses_path ON learning_path_courses(learning_path_id);
CREATE INDEX idx_user_course_progress_user ON user_course_progress(user_id);

-- Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- Read policies for public catalogue
CREATE POLICY "Courses are readable by authenticated users"
  ON courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Course competencies are readable by authenticated users"
  ON course_competencies FOR SELECT TO authenticated USING (true);

-- Learning path policies (Users manage their own paths)
CREATE POLICY "Users can view their own learning paths"
  ON learning_paths FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning paths"
  ON learning_paths FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths"
  ON learning_paths FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning paths"
  ON learning_paths FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Learning path courses policies
CREATE POLICY "Users can view courses in their learning paths"
  ON learning_path_courses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_path_courses.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage courses in their learning paths"
  ON learning_path_courses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_paths
      WHERE learning_paths.id = learning_path_courses.learning_path_id
      AND learning_paths.user_id = auth.uid()
    )
  );

-- User course progress policies
CREATE POLICY "Users can view their course progress"
  ON user_course_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their course progress"
  ON user_course_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their course progress"
  ON user_course_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
