-- StatSkill AI — Migration 009: Training Materials, Quizzes, and Attempts Schema

-- 1. Training Materials Registry
CREATE TABLE training_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size_kb INTEGER,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'processed', -- 'processing', 'processed', 'failed'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AI Generated Questions Bank
CREATE TABLE generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES training_materials(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
  status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Published Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  target_level INTEGER NOT NULL CHECK (target_level BETWEEN 1 AND 5),
  passing_score INTEGER DEFAULT 70 CHECK (passing_score BETWEEN 10 AND 100),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Quiz Questions Mapping (Approved questions linked to a quiz)
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. User Quiz Attempts
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'passed', 'failed'
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX idx_materials_competency ON training_materials(competency_id);
CREATE INDEX idx_gen_questions_status ON generated_questions(status);
CREATE INDEX idx_quizzes_competency ON quizzes(competency_id);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);

-- Enable RLS
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 1. Training Materials Policies
CREATE POLICY "Users can read all training materials metadata"
  ON training_materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and Admins can create training materials"
  ON training_materials FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );

CREATE POLICY "Trainers can manage their own training materials"
  ON training_materials FOR ALL TO authenticated
  USING (uploaded_by = auth.uid());

-- 2. Generated Questions Policies
CREATE POLICY "Trainers and Admins can manage generated questions"
  ON generated_questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );

-- 3. Quizzes Policies (Readable by all, managed by trainers/admins)
CREATE POLICY "Quizzes are readable by authenticated users"
  ON quizzes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and Admins can manage quizzes"
  ON quizzes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );

-- 4. Quiz Questions Policies (Readable by all, managed by trainers/admins)
CREATE POLICY "Quiz questions are readable by authenticated users"
  ON quiz_questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trainers and Admins can manage quiz questions"
  ON quiz_questions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );

-- 5. Quiz Attempts Policies
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
