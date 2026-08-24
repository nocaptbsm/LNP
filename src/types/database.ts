// StatSkill AI — Database Types
// TypeScript interfaces mirroring the Supabase database schema

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

export type UserRole = 'employee' | 'trainer' | 'admin';
export type AssessmentType = 'self_assessment' | 'ai_quiz' | 'supervisor_review';
export type AssessmentStatus = 'in_progress' | 'completed';

// ============================================================
// TABLES
// ============================================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  designation: string | null;
  department_id: string | null;
  employee_id: string | null;
  date_of_joining: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon_name: string;
  created_at: string;
}

export interface Competency {
  id: string;
  domain_id: string;
  name: string;
  code: string;
  description: string | null;
  level_1_desc: string;
  level_2_desc: string;
  level_3_desc: string;
  level_4_desc: string;
  level_5_desc: string;
  created_at: string;
}

export interface RoleCompetency {
  id: string;
  designation: string;
  competency_id: string;
  required_level: number;
  created_at: string;
}

export interface UserCompetency {
  id: string;
  user_id: string;
  competency_id: string;
  current_level: number;
  last_assessed_at: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  user_id: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  total_questions: number;
  completed_questions: number;
  score_percentage: number;
  completed_at: string | null;
  created_at: string;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  competency_id: string;
  score_level: number;
  feedback: string | null;
  created_at: string;
}

// ============================================================
// COMPUTED / JOIN TYPES (for UI & Skill Intelligence)
// ============================================================

export interface ProfileWithDepartment extends Profile {
  department: Department | null;
}

export interface CompetencyWithDomain extends Competency {
  domain: Domain;
}

export interface SkillGapItem {
  competency_id: string;
  competency_name: string;
  competency_code: string;
  domain_name: string;
  domain_code: string;
  current_level: number;
  required_level: number;
  gap: number; // required_level - current_level
  status: 'critical_gap' | 'moderate_gap' | 'met' | 'exceeded';
}

export interface DomainOverview {
  domain_id: string;
  domain_name: string;
  domain_code: string;
  icon_name: string;
  current_avg: number;
  required_avg: number;
  total_competencies: number;
}

export interface AssessmentWithResults extends Assessment {
  results: (AssessmentResult & { competency: Competency })[];
}

// ============================================================
// FORM TYPES
// ============================================================

export interface ProfileUpdateData {
  full_name?: string;
  designation?: string | null;
  department_id?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  designation?: string;
  department_id?: string;
  employee_id?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SelfAssessmentSubmission {
  competency_scores: Record<string, number>; // competency_id -> rating (1-5)
}

// ============================================================
// SUPABASE DATABASE TYPE HELPER
// ============================================================

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Department, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      domains: {
        Row: Domain;
        Insert: Omit<Domain, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Domain, 'id' | 'created_at'>>;
      };
      competencies: {
        Row: Competency;
        Insert: Omit<Competency, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Competency, 'id' | 'created_at'>>;
      };
      role_competencies: {
        Row: RoleCompetency;
        Insert: Omit<RoleCompetency, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<RoleCompetency, 'id' | 'created_at'>>;
      };
      user_competencies: {
        Row: UserCompetency;
        Insert: Omit<UserCompetency, 'id' | 'created_at' | 'last_assessed_at'> & {
          id?: string;
          created_at?: string;
          last_assessed_at?: string;
        };
        Update: Partial<Omit<UserCompetency, 'id' | 'created_at'>>;
      };
      assessments: {
        Row: Assessment;
        Insert: Omit<Assessment, 'id' | 'created_at' | 'completed_at'> & {
          id?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: Partial<Omit<Assessment, 'id' | 'created_at'>>;
      };
      assessment_results: {
        Row: AssessmentResult;
        Insert: Omit<AssessmentResult, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AssessmentResult, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
}
