-- AI Interview Training Platform local portfolio demo schema.
-- Public-safe, fictional data model shaped for Supabase Postgres + RLS.

create extension if not exists "pgcrypto";

create type public.app_role as enum ('candidate', 'coach', 'admin');
create type public.session_status as enum ('draft', 'scheduled', 'in_progress', 'completed');
create type public.transcript_speaker as enum ('candidate', 'coach', 'ai');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text not null,
  app_role public.app_role not null,
  created_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_role text not null,
  cohort text not null,
  coach_profile_id uuid references public.profiles(id),
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  last_active_at timestamptz
);

create table public.question_bank (
  id text primary key,
  title text not null,
  prompt text not null,
  role_focus text not null,
  difficulty text not null check (difficulty in ('foundational', 'intermediate', 'senior')),
  tags text[] not null default '{}',
  rubric_focus text[] not null default '{}',
  created_by_profile_id uuid references public.profiles(id),
  is_public_template boolean not null default true
);

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  coach_profile_id uuid not null references public.profiles(id),
  target_role text not null,
  status public.session_status not null default 'draft',
  scheduled_for date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  follow_up_mode text not null default 'mock_ai' check (follow_up_mode in ('mock_ai', 'manual')),
  final_score integer check (final_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.session_questions (
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_id text not null references public.question_bank(id),
  position integer not null check (position > 0),
  primary key (session_id, question_id)
);

create table public.transcript_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  speaker public.transcript_speaker not null,
  spoken_at_seconds integer not null default 0,
  text text not null,
  question_id text references public.question_bank(id),
  created_at timestamptz not null default now()
);

create table public.rubric_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  category text not null,
  score integer not null check (score between 0 and 25),
  max_score integer not null default 25,
  evidence text not null,
  created_at timestamptz not null default now()
);

create table public.feedback_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  generated_by_provider text not null default 'mock',
  summary text not null,
  strengths text[] not null default '{}',
  risks text[] not null default '{}',
  recommended_practice text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.candidates enable row level security;
alter table public.question_bank enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.session_questions enable row level security;
alter table public.transcript_turns enable row level security;
alter table public.rubric_scores enable row level security;
alter table public.feedback_reports enable row level security;

-- RLS notes:
-- 1. Candidates can see their own profile/candidate/session/report data.
-- 2. Coaches can see candidates assigned to them and sessions they coach.
-- 3. Admins can see all rows for operational analytics.
-- These policies are intentionally readable for portfolio review; production systems should also add INSERT/UPDATE policies by workflow.

create policy "profiles self coach admin read" on public.profiles
for select using (
  auth.uid() = auth_user_id
  or exists (
    select 1 from public.profiles viewer
    where viewer.auth_user_id = auth.uid()
      and viewer.app_role in ('coach', 'admin')
  )
);

create policy "candidates self assigned coach admin read" on public.candidates
for select using (
  exists (
    select 1 from public.profiles viewer
    where viewer.auth_user_id = auth.uid()
      and (
        viewer.id = candidates.profile_id
        or viewer.id = candidates.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);

create policy "question bank templates readable" on public.question_bank
for select using (is_public_template = true);

create policy "sessions self assigned coach admin read" on public.interview_sessions
for select using (
  exists (
    select 1
    from public.candidates c
    join public.profiles viewer on viewer.auth_user_id = auth.uid()
    where c.id = interview_sessions.candidate_id
      and (
        viewer.id = c.profile_id
        or viewer.id = interview_sessions.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);

create policy "session questions follow session read" on public.session_questions
for select using (
  exists (
    select 1
    from public.interview_sessions s
    join public.candidates c on c.id = s.candidate_id
    join public.profiles viewer on viewer.auth_user_id = auth.uid()
    where s.id = session_questions.session_id
      and (
        viewer.id = c.profile_id
        or viewer.id = s.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);

create policy "transcripts follow session read" on public.transcript_turns
for select using (
  exists (
    select 1
    from public.interview_sessions s
    join public.candidates c on c.id = s.candidate_id
    join public.profiles viewer on viewer.auth_user_id = auth.uid()
    where s.id = transcript_turns.session_id
      and (
        viewer.id = c.profile_id
        or viewer.id = s.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);

create policy "rubric scores follow session read" on public.rubric_scores
for select using (
  exists (
    select 1
    from public.interview_sessions s
    join public.candidates c on c.id = s.candidate_id
    join public.profiles viewer on viewer.auth_user_id = auth.uid()
    where s.id = rubric_scores.session_id
      and (
        viewer.id = c.profile_id
        or viewer.id = s.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);

create policy "feedback reports follow session read" on public.feedback_reports
for select using (
  exists (
    select 1
    from public.interview_sessions s
    join public.candidates c on c.id = s.candidate_id
    join public.profiles viewer on viewer.auth_user_id = auth.uid()
    where s.id = feedback_reports.session_id
      and (
        viewer.id = c.profile_id
        or viewer.id = s.coach_profile_id
        or viewer.app_role = 'admin'
      )
  )
);
