-- StatSkill AI — Fix RLS Policy Infinite Recursion Loops
-- Replaces recursive SELECT checks on profiles table with JWT metadata checks

BEGIN;

  -- 1. Departments
  DROP POLICY IF EXISTS "Departments are manageable by admins" ON departments;
  CREATE POLICY "Departments are manageable by admins"
    ON departments FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

  -- 2. Profiles
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

  -- 3. Activity Logs
  DROP POLICY IF EXISTS "Admins and Trainers can view all activity logs" ON activity_logs;
  CREATE POLICY "Admins and Trainers can view all activity logs"
    ON activity_logs FOR SELECT TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('trainer', 'admin'));

  -- 4. User Competencies
  DROP POLICY IF EXISTS "Admins can view all user competencies" ON user_competencies;
  CREATE POLICY "Admins can view all user competencies"
    ON user_competencies FOR SELECT TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

  -- 5. Training Materials
  DROP POLICY IF EXISTS "Trainers and Admins can create training materials" ON training_materials;
  CREATE POLICY "Trainers and Admins can create training materials"
    ON training_materials FOR INSERT TO authenticated
    WITH CHECK (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('trainer', 'admin'));

  -- 6. Generated Questions
  DROP POLICY IF EXISTS "Trainers and Admins can manage generated questions" ON generated_questions;
  CREATE POLICY "Trainers and Admins can manage generated questions"
    ON generated_questions FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('trainer', 'admin'));

  -- 7. Quizzes
  DROP POLICY IF EXISTS "Trainers and Admins can manage quizzes" ON quizzes;
  CREATE POLICY "Trainers and Admins can manage quizzes"
    ON quizzes FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('trainer', 'admin'));

  -- 8. Quiz Questions
  DROP POLICY IF EXISTS "Trainers and Admins can manage quiz questions" ON quiz_questions;
  CREATE POLICY "Trainers and Admins can manage quiz questions"
    ON quiz_questions FOR ALL TO authenticated
    USING (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('trainer', 'admin'));

COMMIT;
