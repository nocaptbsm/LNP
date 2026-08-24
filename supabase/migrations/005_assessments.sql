-- StatSkill AI — Migration 005: Assessment Schema & Auto-Sync Trigger

-- 1. Assessments (Record of assessment sessions)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Baseline Competency Self-Assessment',
  type TEXT NOT NULL DEFAULT 'self_assessment', -- 'self_assessment', 'ai_quiz', 'supervisor_review'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
  total_questions INTEGER DEFAULT 0,
  completed_questions INTEGER DEFAULT 0,
  score_percentage NUMERIC(5, 2) DEFAULT 0.00,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Assessment Results (Specific scores for each competency tested)
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  score_level INTEGER NOT NULL CHECK (score_level BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, competency_id)
);

-- Indexes
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessment_results_assessment ON assessment_results(assessment_id);

-- RLS Policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
  ON assessments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON assessments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their assessment results"
  ON assessment_results FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_results.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their assessment results"
  ON assessment_results FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_results.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

-- Trigger Function: Auto-sync user_competencies when an assessment is completed
CREATE OR REPLACE FUNCTION sync_assessment_results_to_user_competencies()
RETURNS TRIGGER AS $$
BEGIN
  -- Only execute when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO user_competencies (user_id, competency_id, current_level, last_assessed_at)
    SELECT
      NEW.user_id,
      ar.competency_id,
      ar.score_level,
      now()
    FROM assessment_results ar
    WHERE ar.assessment_id = NEW.id
    ON CONFLICT (user_id, competency_id)
    DO UPDATE SET
      current_level = EXCLUDED.current_level,
      last_assessed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_assessment_completed
  AFTER UPDATE OF status ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION sync_assessment_results_to_user_competencies();
