-- Fictional, public-safe seed data for local Supabase demos.

insert into public.profiles (id, auth_user_id, email, full_name, app_role) values
  ('00000000-0000-4000-8000-000000000101', null, 'ava.coach@example.test', 'Ava Patel', 'coach'),
  ('00000000-0000-4000-8000-000000000102', null, 'omar.admin@example.test', 'Omar Chen', 'admin'),
  ('00000000-0000-4000-8000-000000000201', null, 'maya.rivera@example.test', 'Maya Rivera', 'candidate'),
  ('00000000-0000-4000-8000-000000000202', null, 'noah.brooks@example.test', 'Noah Brooks', 'candidate'),
  ('00000000-0000-4000-8000-000000000203', null, 'lena.okafor@example.test', 'Lena Okafor', 'candidate');

insert into public.candidates (id, profile_id, target_role, cohort, coach_profile_id, readiness_score, last_active_at) values
  ('00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000201', 'Product Manager', 'June AI SaaS cohort', '00000000-0000-4000-8000-000000000101', 88, '2026-05-30 15:30:00+00'),
  ('00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000202', 'Full Stack Engineer', 'June AI SaaS cohort', '00000000-0000-4000-8000-000000000102', 84, '2026-05-27 18:00:00+00'),
  ('00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000203', 'Product Manager', 'Founders returning to PM', '00000000-0000-4000-8000-000000000101', 78, '2026-05-28 19:15:00+00');

insert into public.question_bank (id, title, prompt, role_focus, difficulty, tags, rubric_focus, created_by_profile_id, is_public_template) values
  ('q_behavioral_ownership', 'Ownership under ambiguity', 'Tell me about a time you owned a messy, ambiguous problem and moved it to a measurable outcome.', 'Product Manager', 'intermediate', array['behavioral','ownership','ambiguity','STAR'], array['Communication','Structure','Coachability'], '00000000-0000-4000-8000-000000000101', true),
  ('q_product_strategy', 'Product strategy trade-off', 'You have two quarters to improve activation for an AI SaaS onboarding flow. How do you prioritize bets?', 'Product Manager', 'senior', array['strategy','metrics','prioritization'], array['Role Depth','Structure'], '00000000-0000-4000-8000-000000000101', true),
  ('q_fullstack_architecture', 'AI feature architecture', 'Design a low-latency interview feedback feature that stores transcripts, scores rubrics, and keeps provider keys safe.', 'Full Stack Engineer', 'senior', array['architecture','security','supabase','provider-boundary'], array['Role Depth','Communication'], '00000000-0000-4000-8000-000000000102', true),
  ('q_coachability_followup', 'Coachability follow-up', 'What feedback have you received that changed your next interview performance?', 'All roles', 'foundational', array['coachability','reflection','growth'], array['Coachability','Communication'], '00000000-0000-4000-8000-000000000101', true);

insert into public.interview_sessions (id, title, candidate_id, coach_profile_id, target_role, status, scheduled_for, duration_minutes, follow_up_mode, final_score) values
  ('00000000-0000-4000-8000-000000002001', 'PM behavioral screen', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', 'Product Manager', 'completed', '2026-05-21', 42, 'mock_ai', 76),
  ('00000000-0000-4000-8000-000000002002', 'PM product strategy loop', '00000000-0000-4000-8000-000000001001', '00000000-0000-4000-8000-000000000101', 'Product Manager', 'completed', '2026-05-29', 48, 'mock_ai', 88),
  ('00000000-0000-4000-8000-000000002003', 'Full-stack architecture loop', '00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000102', 'Full Stack Engineer', 'completed', '2026-05-25', 55, 'mock_ai', 84),
  ('00000000-0000-4000-8000-000000002004', 'PM analytics and prioritization', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000101', 'Product Manager', 'completed', '2026-05-26', 45, 'mock_ai', 84),
  ('00000000-0000-4000-8000-000000002005', 'Coachability tune-up', '00000000-0000-4000-8000-000000001003', '00000000-0000-4000-8000-000000000101', 'Product Manager', 'scheduled', '2026-06-03', 30, 'mock_ai', null);

insert into public.session_questions (session_id, question_id, position) values
  ('00000000-0000-4000-8000-000000002002', 'q_product_strategy', 1),
  ('00000000-0000-4000-8000-000000002002', 'q_behavioral_ownership', 2);

insert into public.transcript_turns (session_id, speaker, spoken_at_seconds, text, question_id) values
  ('00000000-0000-4000-8000-000000002002', 'coach', 0, 'Walk me through a time you took ownership of an ambiguous product problem.', 'q_behavioral_ownership'),
  ('00000000-0000-4000-8000-000000002002', 'candidate', 31, 'At a billing startup, trial activation was flat and ownership was split between sales, product, and onboarding. I mapped the funnel, found that teams were optimizing different definitions of activation, and set a shared target around first successful invoice. We shipped guided setup, a weekly metric review, and reduced time-to-value by 34% in six weeks.', 'q_behavioral_ownership'),
  ('00000000-0000-4000-8000-000000002002', 'ai', 102, 'Follow-up: which trade-off did you make when sales wanted a high-touch path and product wanted self-serve only?', 'q_behavioral_ownership'),
  ('00000000-0000-4000-8000-000000002002', 'candidate', 134, 'I separated the first invoice milestone from expansion education. We kept the first-use journey self-serve, then triggered a human coaching offer after the first invoice for accounts with three or more invited teammates.', 'q_behavioral_ownership');

insert into public.rubric_scores (session_id, category, score, max_score, evidence) values
  ('00000000-0000-4000-8000-000000002002', 'Communication', 22, 25, 'Uses measurable evidence: 34%.'),
  ('00000000-0000-4000-8000-000000002002', 'Role Depth', 21, 25, 'Explains product constraints and the self-serve versus coached trade-off.'),
  ('00000000-0000-4000-8000-000000002002', 'Structure', 23, 25, 'Frames context, action, and result in a STAR-like sequence.'),
  ('00000000-0000-4000-8000-000000002002', 'Coachability', 20, 25, 'Identifies a concrete next practice loop with coach feedback.');

insert into public.feedback_reports (session_id, generated_by_provider, summary, strengths, risks, recommended_practice, overall_score) values
  ('00000000-0000-4000-8000-000000002002', 'mock', 'Strong practice loop: the candidate anchors the answer in a business outcome and names a real cross-functional trade-off.', array['Concrete activation metric', 'Clear ownership story'], array['Opening setup could be shorter'], 'Practice a 90-second STAR answer before the next coach review.', 86);
