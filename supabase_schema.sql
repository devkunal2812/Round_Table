-- ============================================================
-- Roundtable – Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT,
  bio         TEXT
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── GOALS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  progress    INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority    TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date    DATE,
  niche       TEXT,
  completed   BOOLEAN DEFAULT FALSE
);

-- ─── TASKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status      TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Completed')),
  due_date    DATE,
  assignee    TEXT,
  department  TEXT
);

-- ─── SPACES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spaces (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  owner_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  cover_image_url  TEXT,
  is_public        BOOLEAN DEFAULT TRUE,
  invite_code      TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS space_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  space_id    UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(space_id, user_id)
);

-- ─── RESOURCES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  link        TEXT,
  type        TEXT DEFAULT 'link' CHECK (type IN ('article', 'video', 'doc', 'link')),
  niche       TEXT,
  likes       INTEGER DEFAULT 0,
  space_id    UUID REFERENCES spaces(id) ON DELETE SET NULL
);

-- ─── SHOWCASE PROJECTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS showcase_projects (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  project_link     TEXT,
  github_link      TEXT,
  cover_image_url  TEXT,
  tags             TEXT[] DEFAULT '{}',
  likes            INTEGER DEFAULT 0,
  niche            TEXT
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'system' CHECK (type IN ('task', 'message', 'system')),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces              ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile"      ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"      ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals: private to owner
CREATE POLICY "Users manage own goals" ON goals USING (auth.uid() = user_id);

-- Tasks: private to owner
CREATE POLICY "Users manage own tasks" ON tasks USING (auth.uid() = user_id);

-- Spaces: public spaces readable by all, private only by members
CREATE POLICY "Public spaces are viewable by all"  ON spaces FOR SELECT USING (is_public = TRUE OR owner_id = auth.uid());
CREATE POLICY "Members can view their spaces"      ON spaces FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members WHERE space_id = spaces.id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create spaces" ON spaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their spaces"    ON spaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their spaces"    ON spaces FOR DELETE USING (auth.uid() = owner_id);

-- Space members
CREATE POLICY "Members can view space_members"  ON space_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM space_members sm WHERE sm.space_id = space_members.space_id AND sm.user_id = auth.uid())
);
CREATE POLICY "Authenticated users can join spaces" ON space_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave spaces"           ON space_members FOR DELETE USING (auth.uid() = user_id);

-- Resources: public read, owner can write
CREATE POLICY "Resources are viewable by everyone"      ON resources FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can share resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own resources"         ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own resources"         ON resources FOR DELETE USING (auth.uid() = user_id);

-- Showcase: public read, owner can write
CREATE POLICY "Projects are viewable by everyone"       ON showcase_projects FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can showcase"        ON showcase_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own projects"          ON showcase_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own projects"          ON showcase_projects FOR DELETE USING (auth.uid() = user_id);

-- Notifications: private to owner
CREATE POLICY "Users manage own notifications" ON notifications USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_goals_user_id              ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id              ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_spaces_owner_id            ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_space_members_user_id      ON space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_space_members_space_id     ON space_members(space_id);
CREATE INDEX IF NOT EXISTS idx_resources_user_id          ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_user_id           ON showcase_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
