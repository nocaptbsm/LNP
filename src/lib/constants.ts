// StatSkill AI — Application Constants

import {
  LayoutDashboard,
  User,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Upload,
  FileQuestion,
  Users,
  Building2,
  TrendingUp,
  Code2,
  Award,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';

// ============================================================
// APP META
// ============================================================

export const APP_NAME = 'StatSkill AI';
export const APP_DESCRIPTION =
  'AI-Powered Skill Intelligence for India\'s Official Statistical Workforce';
export const APP_TAGLINE =
  'Competency Intelligence · Skill Gap Analysis · Personalized Learning · AI Assessment · Workforce Analytics';

// ============================================================
// NAVIGATION
// ============================================================

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
  disabled?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['employee', 'trainer', 'admin'],
      },
      {
        title: 'My Profile',
        href: '/profile',
        icon: User,
        roles: ['employee', 'trainer', 'admin'],
      },
    ],
  },
  {
    label: 'Learning & Skills',
    items: [
      {
        title: 'Competency Profile',
        href: '/competency',
        icon: BarChart3,
        roles: ['employee', 'trainer', 'admin'],
        disabled: false,
      },
      {
        title: 'Assessments',
        href: '/assessments',
        icon: ClipboardCheck,
        roles: ['employee', 'trainer', 'admin'],
        disabled: false,
      },
      {
        title: 'Learning Path',
        href: '/learning',
        icon: BookOpen,
        roles: ['employee'],
        badge: 'Phase 3',
        disabled: true,
      },
    ],
  },
  {
    label: 'Trainer Tools',
    items: [
      {
        title: 'Upload Materials',
        href: '/trainer/upload',
        icon: Upload,
        roles: ['trainer'],
        badge: 'Phase 4',
        disabled: true,
      },
      {
        title: 'Quiz Manager',
        href: '/trainer/quizzes',
        icon: FileQuestion,
        roles: ['trainer'],
        badge: 'Phase 4',
        disabled: true,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        title: 'Workforce Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
        roles: ['admin'],
        badge: 'Phase 6',
        disabled: true,
      },
      {
        title: 'Department Overview',
        href: '/admin/departments',
        icon: Building2,
        roles: ['admin'],
        badge: 'Phase 6',
        disabled: true,
      },
      {
        title: 'Manage Users',
        href: '/admin/users',
        icon: Users,
        roles: ['admin'],
        badge: 'Phase 6',
        disabled: true,
      },
    ],
  },
];

// ============================================================
// ROLE LABELS & COLORS
// ============================================================

export const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Employee',
  trainer: 'Trainer',
  admin: 'Administrator',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  employee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  trainer: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  admin: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

// ============================================================
// DOMAIN ICON MAPPING
// ============================================================

export const DOMAIN_ICONS: Record<string, LucideIcon> = {
  BarChart3: BarChart3,
  Code2: Code2,
  Building2: Building2,
  Users: Users,
  Award: Award,
};

// ============================================================
// PUBLIC ROUTES
// ============================================================

export const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback'];
