-- StatSkill AI — Migration 011: Capacity Intelligence Views & Activity Logs Schema

-- 1. Department Competency Statistics View (Aggregates ratings per MoSPI department)
CREATE OR REPLACE VIEW view_department_competency_stats AS
  SELECT 
    d.id AS department_id,
    d.name AS department_name,
    c.id AS competency_id,
    c.name AS competency_name,
    c.code AS competency_code,
    c.domain_id,
    dom.name AS domain_name,
    dom.code AS domain_code,
    COALESCE(AVG(uc.current_level), 0)::numeric(3,2) AS average_current_level,
    COALESCE(AVG(rc.required_level), 3)::numeric(3,2) AS average_required_level
  FROM departments d
  CROSS JOIN competencies c
  JOIN domains dom ON dom.id = c.domain_id
  LEFT JOIN profiles p ON p.department_id = d.id
  LEFT JOIN user_competencies uc ON uc.user_id = p.id AND uc.competency_id = c.id
  LEFT JOIN role_competencies rc ON rc.designation = p.designation AND rc.competency_id = c.id
  GROUP BY d.id, d.name, c.id, c.name, c.code, c.domain_id, dom.name, dom.code;

-- 2. Activity Logs Table (Tracks unified audit trail of capacity development)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'assessment_completed', 'course_enrolled', 'course_completed', 'quiz_completed'
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast logs lookup
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Activity Logs
CREATE POLICY "Users can view their own activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and Trainers can view all activity logs"
  ON activity_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('trainer', 'admin')
    )
  );
