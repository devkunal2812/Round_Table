-- ============================================================
-- Roundtable – Dummy Data Seed (Self-contained)
-- ✅ Run supabase_schema.sql FIRST, then run this file.
-- This script creates auth users + all app data in one shot.
-- ============================================================

DO $$
DECLARE
  uid_kunal    UUID := uuid_generate_v4();
  uid_krish    UUID := uuid_generate_v4();
  uid_dnyanesh UUID := uuid_generate_v4();
  uid_jay      UUID := uuid_generate_v4();
  uid_srujal   UUID := uuid_generate_v4();

  sid_hangout  UUID := uuid_generate_v4();
  sid_design   UUID := uuid_generate_v4();
  sid_oss      UUID := uuid_generate_v4();
  sid_builders UUID := uuid_generate_v4();

BEGIN

-- ─── AUTH USERS (inserts into Supabase's internal auth schema) ──
-- This creates the auth.users rows that profiles FK references
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (uid_kunal,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'kunal@roundtable.dev',    '$2a$10$PgjZ1O9XDKP7Q1234567890123456789012345678901234567890',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Kunal Chauhan"}',
   FALSE, '', '', '', ''),

  (uid_krish,    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'krish@roundtable.dev',    '$2a$10$PgjZ1O9XDKP7Q1234567890123456789012345678901234567890',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Krish Prajapati"}',
   FALSE, '', '', '', ''),

  (uid_dnyanesh, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'dnyanesh@roundtable.dev', '$2a$10$PgjZ1O9XDKP7Q1234567890123456789012345678901234567890',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Dnyanesh Chaudhari"}',
   FALSE, '', '', '', ''),

  (uid_jay,      '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'jay@roundtable.dev',      '$2a$10$PgjZ1O9XDKP7Q1234567890123456789012345678901234567890',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Jay Nirmal"}',
   FALSE, '', '', '', ''),

  (uid_srujal,   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'srujal@roundtable.dev',   '$2a$10$PgjZ1O9XDKP7Q1234567890123456789012345678901234567890',
   NOW(), NOW(), NOW(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Srujal Shah"}',
   FALSE, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Also insert identity rows required by Supabase
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
  (uid_kunal,    uid_kunal,    'kunal@roundtable.dev',
   json_build_object('sub', uid_kunal::text, 'email', 'kunal@roundtable.dev'),
   'email', NOW(), NOW(), NOW()),
  (uid_krish,    uid_krish,    'krish@roundtable.dev',
   json_build_object('sub', uid_krish::text, 'email', 'krish@roundtable.dev'),
   'email', NOW(), NOW(), NOW()),
  (uid_dnyanesh, uid_dnyanesh, 'dnyanesh@roundtable.dev',
   json_build_object('sub', uid_dnyanesh::text, 'email', 'dnyanesh@roundtable.dev'),
   'email', NOW(), NOW(), NOW()),
  (uid_jay,      uid_jay,      'jay@roundtable.dev',
   json_build_object('sub', uid_jay::text, 'email', 'jay@roundtable.dev'),
   'email', NOW(), NOW(), NOW()),
  (uid_srujal,   uid_srujal,   'srujal@roundtable.dev',
   json_build_object('sub', uid_srujal::text, 'email', 'srujal@roundtable.dev'),
   'email', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── PROFILES ───────────────────────────────────────────────
INSERT INTO profiles (id, username, full_name, role, bio) VALUES
  (uid_kunal,    'kunal_c',    'Kunal Chauhan',      'Full Stack Developer', 'Building Roundtable. Love React & Postgres.'),
  (uid_krish,    'krisharj',   'Krish Prajapati',    'UI/UX Designer',       'Figma enthusiast. Making pixels perfect.'),
  (uid_dnyanesh, 'dnyanesh_c', 'Dnyanesh Chaudhari', 'Backend Developer',    'Node.js & Python. Open source contributor.'),
  (uid_jay,      'jay_n',      'Jay Nirmal',         'Product Designer',     'Design systems & component libraries.'),
  (uid_srujal,   'srujal_s',   'Srujal Shah',        'Content Strategist',   'Words that ship products.')
ON CONFLICT (id) DO UPDATE SET
  username  = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role      = EXCLUDED.role,
  bio       = EXCLUDED.bio;

-- ─── GOALS ──────────────────────────────────────────────────
INSERT INTO goals (user_id, title, description, progress, priority, due_date, niche, completed) VALUES
  (uid_kunal,    'Launch Roundtable v1.0',
   'Complete all core features, connect Supabase backend, deploy to Vercel.',
   75, 'High', CURRENT_DATE + 14, 'Dev', FALSE),

  (uid_kunal,    'Learn TypeScript Advanced Patterns',
   'Cover utility types, conditional types, and template literal types.',
   45, 'Medium', CURRENT_DATE + 30, 'Dev', FALSE),

  (uid_kunal,    'Contribute to 3 Open Source Projects',
   'Find issues, submit PRs, and get them merged.',
   33, 'Low', CURRENT_DATE + 60, 'Dev', FALSE),

  (uid_krish,    'Complete Figma Design System',
   'Build a full component library with tokens, variants, and auto layout.',
   60, 'High', CURRENT_DATE + 10, 'Design', FALSE),

  (uid_krish,    'Publish UI Portfolio',
   'Showcase 5 best design case studies on Behance and personal site.',
   20, 'Medium', CURRENT_DATE + 45, 'Design', FALSE),

  (uid_dnyanesh, 'Build REST API for Roundtable',
   'Design and implement all backend endpoints with proper auth.',
   50, 'High', CURRENT_DATE + 20, 'Dev', FALSE),

  (uid_dnyanesh, 'Learn System Design',
   'Study distributed systems, CAP theorem, and real-world architecture.',
   70, 'Medium', CURRENT_DATE + 30, 'Dev', FALSE),

  (uid_jay,      'Ship Design Tokens Library',
   'Create a reusable token system for colors, spacing, and typography.',
   80, 'High', CURRENT_DATE + 7, 'Design', FALSE),

  (uid_srujal,   'Write 10 Technical Blog Posts',
   'Cover topics ranging from web dev to product strategy.',
   40, 'Medium', CURRENT_DATE + 90, 'Content', FALSE),

  (uid_srujal,   'Grow Newsletter to 500 Subscribers',
   'Weekly roundup of dev tools, design tips, and productivity hacks.',
   25, 'Low', CURRENT_DATE + 120, 'Content', FALSE);

-- ─── TASKS ──────────────────────────────────────────────────
INSERT INTO tasks (user_id, title, description, priority, status, due_date, assignee, department) VALUES
  (uid_kunal,    'Wire Supabase auth to frontend',
   'Replace localStorage auth with Supabase session management.',
   'High', 'In Progress', CURRENT_DATE + 2, 'Kunal Chauhan', 'Development'),

  (uid_kunal,    'Build Dashboard stats from real data',
   'Replace hardcoded stats with live counts from Supabase tables.',
   'High', 'To Do', CURRENT_DATE + 4, 'Kunal Chauhan', 'Development'),

  (uid_kunal,    'Setup Vercel deployment',
   'Configure environment variables and CI/CD for production deploy.',
   'Medium', 'To Do', CURRENT_DATE + 7, 'Kunal Chauhan', 'Infrastructure'),

  (uid_kunal,    'Write README documentation',
   'Document setup steps, env vars, and contribution guidelines.',
   'Low', 'Completed', CURRENT_DATE - 3, 'Kunal Chauhan', 'Development'),

  (uid_krish,    'Design login screen wireframes',
   'Create wireframes and hi-fi mockups for the auth flow.',
   'High', 'Completed', CURRENT_DATE - 5, 'Krish Prajapati', 'Design'),

  (uid_krish,    'Design Spaces card component',
   'Create final card design with hover states and member avatars.',
   'Medium', 'In Progress', CURRENT_DATE + 3, 'Krish Prajapati', 'Design'),

  (uid_krish,    'Create icon set for navigation',
   'Design consistent icon variants for all nav items.',
   'Low', 'To Do', CURRENT_DATE + 10, 'Krish Prajapati', 'Design'),

  (uid_dnyanesh, 'Implement REST API endpoints',
   'Build backend services for user, goals, tasks, and spaces.',
   'High', 'In Progress', CURRENT_DATE + 5, 'Dnyanesh Chaudhari', 'Development'),

  (uid_dnyanesh, 'Write unit tests for API',
   'Ensure 80%+ coverage on all critical endpoints.',
   'Medium', 'To Do', CURRENT_DATE + 14, 'Dnyanesh Chaudhari', 'Testing'),

  (uid_dnyanesh, 'Setup CI/CD pipeline',
   'Configure GitHub Actions for automated testing and deployment.',
   'High', 'Completed', CURRENT_DATE - 7, 'Dnyanesh Chaudhari', 'Infrastructure'),

  (uid_jay,      'Design Showcase page layout',
   'Create the project card design with like, comment, and share actions.',
   'Medium', 'Completed', CURRENT_DATE - 2, 'Jay Nirmal', 'Design'),

  (uid_jay,      'Create color palette documentation',
   'Document all brand colors, dark mode variants, and usage guidelines.',
   'Low', 'In Progress', CURRENT_DATE + 6, 'Jay Nirmal', 'Design'),

  (uid_srujal,   'Write onboarding copy',
   'Create welcome messages, tooltips, and empty-state copy for all pages.',
   'Medium', 'In Progress', CURRENT_DATE + 4, 'Srujal Shah', 'Content'),

  (uid_srujal,   'Draft social media launch posts',
   'Prepare Twitter/LinkedIn announcement posts for v1.0 launch.',
   'High', 'To Do', CURRENT_DATE + 10, 'Srujal Shah', 'Content');

-- ─── SPACES ─────────────────────────────────────────────────
INSERT INTO spaces (id, owner_id, name, description, is_public, invite_code) VALUES
  (sid_hangout,  uid_kunal,    'Saturday Hangouts',
   'A curated circle for purposeful learning, building side projects, and growing together.',
   TRUE,  'HANG01'),

  (sid_design,   uid_krish,    'Design Jam',
   'Weekly design challenges, Figma critiques, and UI inspiration for creative minds.',
   TRUE,  'DESJAM'),

  (sid_oss,      uid_dnyanesh, 'Open Source Squad',
   'Collaborate on open source contributions, review PRs, and share learning resources.',
   FALSE, 'OSS007'),

  (sid_builders, uid_kunal,    'Product Builders',
   'For people shipping products. Share progress, get feedback, stay accountable.',
   FALSE, 'BUILD8');

-- ─── SPACE MEMBERS ──────────────────────────────────────────
INSERT INTO space_members (space_id, user_id, role) VALUES
  (sid_hangout,  uid_kunal,    'admin'),
  (sid_hangout,  uid_krish,    'member'),
  (sid_hangout,  uid_dnyanesh, 'member'),
  (sid_hangout,  uid_jay,      'member'),
  (sid_hangout,  uid_srujal,   'member'),

  (sid_design,   uid_krish,    'admin'),
  (sid_design,   uid_jay,      'member'),
  (sid_design,   uid_kunal,    'member'),

  (sid_oss,      uid_dnyanesh, 'admin'),
  (sid_oss,      uid_kunal,    'member'),
  (sid_oss,      uid_jay,      'member'),

  (sid_builders, uid_kunal,    'admin'),
  (sid_builders, uid_krish,    'member'),
  (sid_builders, uid_srujal,   'member')
ON CONFLICT (space_id, user_id) DO NOTHING;

-- ─── RESOURCES ──────────────────────────────────────────────
INSERT INTO resources (user_id, title, description, link, type, niche, likes, space_id) VALUES
  (uid_krish,
   'React Performance Optimization Guide',
   'A deep dive into React rendering patterns, memoization strategies, and how to profile your app.',
   'https://react.dev/learn/render-and-commit',
   'article', 'Dev', 14, sid_hangout),

  (uid_kunal,
   'Figma Auto Layout Masterclass',
   'Learn how to use Auto Layout to build responsive, scalable UI components from scratch.',
   'https://help.figma.com/hc/en-us/articles/360040451373',
   'video', 'Design', 22, sid_design),

  (uid_dnyanesh,
   'System Design Interview Handbook',
   'Comprehensive guide covering distributed systems, databases, caching, and architecture patterns.',
   'https://github.com/donnemartin/system-design-primer',
   'doc', 'Dev', 31, sid_oss),

  (uid_jay,
   'Tailwind CSS Tips & Tricks',
   'Hidden Tailwind utilities and patterns that will supercharge your workflow.',
   'https://tailwindcss.com/docs',
   'article', 'Dev', 18, NULL),

  (uid_srujal,
   'Content Strategy for Developers',
   'How to build a personal brand online as a developer — writing, positioning, and growing an audience.',
   'https://dev.to',
   'doc', 'Content', 9, NULL),

  (uid_kunal,
   'TypeScript Advanced Patterns',
   'Utility types, conditional types, infer keyword, and advanced TS patterns for robust apps.',
   'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html',
   'link', 'Dev', 26, sid_hangout),

  (uid_krish,
   'Radix UI Component Primitives',
   'Unstyled, accessible UI components for React. Perfect base for any design system.',
   'https://www.radix-ui.com',
   'link', 'Design', 33, sid_design),

  (uid_dnyanesh,
   'PostgreSQL Performance Tuning',
   'Index strategies, query planning, EXPLAIN ANALYZE, and connection pooling best practices.',
   'https://www.postgresql.org/docs/current/performance-tips.html',
   'article', 'Dev', 17, sid_oss);

-- ─── SHOWCASE PROJECTS ──────────────────────────────────────
INSERT INTO showcase_projects (user_id, title, description, project_link, github_link, tags, likes, niche) VALUES
  (uid_kunal,
   'Roundtable – Productivity Platform',
   'A modern productivity and collaboration platform for managing goals, tasks, and projects in one workspace.',
   'https://round-table-zeta.vercel.app/',
   'https://github.com/devkunal2812/Round_Table',
   ARRAY['React', 'TypeScript', 'Supabase', 'Tailwind'],
   42, 'Dev'),

  (uid_krish,
   'DesignKit — UI Component Library',
   'A fully accessible, customizable component library built on Radix UI and Tailwind CSS with 50+ components.',
   'https://designkit.example.com',
   'https://github.com/krisharj/designkit',
   ARRAY['Design System', 'Figma', 'React', 'Radix UI'],
   87, 'Design'),

  (uid_dnyanesh,
   'DevMetrics — GitHub Analytics Dashboard',
   'Real-time analytics for GitHub repositories. Track commits, PRs, issues, and contributors.',
   'https://devmetrics.example.com',
   'https://github.com/dnyanesh-c/devmetrics',
   ARRAY['Next.js', 'GitHub API', 'Recharts', 'PostgreSQL'],
   61, 'Dev'),

  (uid_jay,
   'TokenStudio — Design Token Manager',
   'A web app for managing and exporting design tokens across platforms. Supports Figma, CSS, and JSON.',
   'https://tokenstudio.example.com',
   NULL,
   ARRAY['Design Tokens', 'Figma API', 'React'],
   29, 'Design'),

  (uid_srujal,
   'DevBrief — Weekly Newsletter',
   'A curated weekly newsletter covering dev tools, design tips, and productivity hacks for builders.',
   'https://devbrief.example.com',
   NULL,
   ARRAY['Newsletter', 'Content', 'Growth'],
   38, 'Content');

-- ─── NOTIFICATIONS ──────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, description, read) VALUES
  (uid_kunal, 'task',    'Task Completed',     'Dnyanesh marked "Setup CI/CD pipeline" as completed.',  FALSE),
  (uid_kunal, 'message', 'New Message',        'Krish sent a message in Saturday Hangouts.',             FALSE),
  (uid_kunal, 'system',  'New Member Joined',  'Jay Nirmal joined your space "Saturday Hangouts".',      TRUE),
  (uid_kunal, 'task',    'Deadline Tomorrow',  '"Wire Supabase auth to frontend" is due tomorrow.',      FALSE),

  (uid_krish, 'task',    'Goal Updated',       'Your goal "Complete Figma Design System" is at 60%.',   FALSE),
  (uid_krish, 'message', 'New Resource Shared','Kunal shared a new resource in Design Jam.',             TRUE),
  (uid_krish, 'system',  'Space Invite',       'Kunal joined your "Design Jam" space.',                  TRUE),

  (uid_dnyanesh, 'task',   'PR Review Requested','Kunal requested a review on the Supabase auth PR.',   FALSE),
  (uid_dnyanesh, 'system', 'New Follower',        'Jay Nirmal is now following your showcase.',           TRUE),

  (uid_jay, 'task',    'Task Assigned',        'You were assigned "Create icon set for navigation".',   FALSE),
  (uid_jay, 'message', 'Comment on Showcase',  'Krish commented on your "TokenStudio" project.',        FALSE),

  (uid_srujal, 'system', 'Resource Liked',     'Your resource got 5 new likes today.',                  FALSE),
  (uid_srujal, 'task',   'Deadline Approaching','Newsletter draft is due in 3 days.',                   TRUE);

END $$;

-- ─── VERIFY counts ──────────────────────────────────────────
SELECT 'profiles'          AS table_name, COUNT(*) AS rows FROM profiles
UNION ALL SELECT 'goals',           COUNT(*) FROM goals
UNION ALL SELECT 'tasks',           COUNT(*) FROM tasks
UNION ALL SELECT 'spaces',          COUNT(*) FROM spaces
UNION ALL SELECT 'space_members',   COUNT(*) FROM space_members
UNION ALL SELECT 'resources',       COUNT(*) FROM resources
UNION ALL SELECT 'showcase_projects', COUNT(*) FROM showcase_projects
UNION ALL SELECT 'notifications',   COUNT(*) FROM notifications;
