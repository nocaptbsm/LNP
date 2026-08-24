-- StatSkill AI — Migration 012: Activity Logging Triggers

-- 1. Trigger Function: Log Assessment Completions
CREATE OR REPLACE FUNCTION log_assessment_completion_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO activity_logs (user_id, activity_type, description, metadata)
    VALUES (
      NEW.user_id,
      'assessment_completed',
      'Completed ' || NEW.title || ' (Score: ' || NEW.score_percentage || '%)',
      json_build_object('assessment_id', NEW.id, 'score', NEW.score_percentage)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_log_assessment_completed
  AFTER UPDATE OF status ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION log_assessment_completion_activity();


-- 2. Trigger Function: Log Course Progress Changes (Enrollment & Completions)
CREATE OR REPLACE FUNCTION log_course_progress_activity()
RETURNS TRIGGER AS $$
DECLARE
  c_title TEXT;
BEGIN
  -- Fetch course title
  SELECT title INTO c_title FROM courses WHERE id = NEW.course_id;

  -- Case A: Completed course
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO activity_logs (user_id, activity_type, description, metadata)
    VALUES (
      NEW.user_id,
      'course_completed',
      'Completed capacity building course: "' || c_title || '"',
      json_build_object('course_id', NEW.course_id, 'hours', NEW.hours_spent)
    );
  -- Case B: Enrolled in course
  ELSIF (OLD.status IS NULL) OR (NEW.status = 'in_progress' AND OLD.status = 'enrolled') THEN
    INSERT INTO activity_logs (user_id, activity_type, description, metadata)
    VALUES (
      NEW.user_id,
      'course_enrolled',
      'Enrolled in course: "' || c_title || '"',
      json_build_object('course_id', NEW.course_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_log_course_progress
  AFTER INSERT OR UPDATE OF status ON user_course_progress
  FOR EACH ROW
  EXECUTE FUNCTION log_course_progress_activity();


-- 3. Trigger Function: Log Quiz Attempts
CREATE OR REPLACE FUNCTION log_quiz_attempt_activity()
RETURNS TRIGGER AS $$
DECLARE
  q_title TEXT;
BEGIN
  -- Fetch quiz title
  SELECT title INTO q_title FROM quizzes WHERE id = NEW.quiz_id;

  INSERT INTO activity_logs (user_id, activity_type, description, metadata)
  VALUES (
    NEW.user_id,
    'quiz_completed',
    'Completed certified AI quiz: "' || q_title || '" with status: ' || UPPER(NEW.status) || ' (Score: ' || NEW.score_percentage || '%)',
    json_build_object('quiz_id', NEW.quiz_id, 'score', NEW.score_percentage, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_log_quiz_attempt
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION log_quiz_attempt_activity();
