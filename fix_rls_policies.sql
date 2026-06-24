-- ============================================================
-- Fix: infinite recursion in space_members RLS policy
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Drop the broken recursive policies
DROP POLICY IF EXISTS "Members can view space_members" ON space_members;
DROP POLICY IF EXISTS "Authenticated users can join spaces" ON space_members;
DROP POLICY IF EXISTS "Members can leave spaces" ON space_members;

-- Also fix spaces policies that may reference space_members recursively
DROP POLICY IF EXISTS "Members can view their spaces" ON spaces;
DROP POLICY IF EXISTS "Public spaces are viewable by all" ON spaces;
DROP POLICY IF EXISTS "Authenticated users can create spaces" ON spaces;
DROP POLICY IF EXISTS "Owners can update their spaces" ON spaces;
DROP POLICY IF EXISTS "Owners can delete their spaces" ON spaces;

-- ── SPACES: clean non-recursive policies ────────────────────
-- Public spaces visible to all; private spaces visible to owner only (no recursion)
CREATE POLICY "spaces_select"
  ON spaces FOR SELECT
  USING (
    is_public = TRUE
    OR owner_id = auth.uid()
  );

CREATE POLICY "spaces_insert"
  ON spaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "spaces_update"
  ON spaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "spaces_delete"
  ON spaces FOR DELETE
  USING (auth.uid() = owner_id);

-- ── SPACE_MEMBERS: simple non-recursive policies ─────────────
-- SELECT: user can see their own membership rows (no self-join)
CREATE POLICY "space_members_select"
  ON space_members FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: authenticated users can add themselves
CREATE POLICY "space_members_insert"
  ON space_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: users can remove themselves
CREATE POLICY "space_members_delete"
  ON space_members FOR DELETE
  USING (auth.uid() = user_id);

-- ── Verify ───────────────────────────────────────────────────
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('spaces', 'space_members')
ORDER BY tablename, policyname;
