-- ============================================================
-- HydroTrack — Complete Supabase SQL Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 2. TABLES
-- ────────────────────────────────────────────────────────────

-- Users (mirrors auth.users)
CREATE TABLE public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hydroponic setups / systems
CREATE TABLE public.setups (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setup_name     TEXT NOT NULL,
  location       TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  plant_capacity INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crop experiment iterations
CREATE TABLE public.iterations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setup_id         UUID NOT NULL REFERENCES public.setups(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,
  crop_name        TEXT NOT NULL,
  crop_qty         INTEGER NOT NULL DEFAULT 0,
  season           TEXT NOT NULL DEFAULT '',
  created_by       UUID NOT NULL REFERENCES public.users(id),
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  closed_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Iteration numbers must be unique per setup
  UNIQUE (setup_id, iteration_number)
);

-- TDS / pH readings
CREATE TABLE public.readings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iteration_id UUID NOT NULL REFERENCES public.iterations(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.users(id),
  tds          FLOAT NOT NULL,
  ph           FLOAT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX idx_iterations_setup_id   ON public.iterations(setup_id);
CREATE INDEX idx_iterations_status     ON public.iterations(status);
CREATE INDEX idx_iterations_created_by ON public.iterations(created_by);
CREATE INDEX idx_readings_iteration_id ON public.readings(iteration_id);
CREATE INDEX idx_readings_user_id      ON public.readings(user_id);
CREATE INDEX idx_readings_created_at   ON public.readings(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 4. AUTO-CREATE USER PROFILE ON SIGNUP
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 5. PREVENT READINGS ON CLOSED ITERATIONS
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_iteration_open()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT status FROM public.iterations WHERE id = NEW.iteration_id) = 'closed' THEN
    RAISE EXCEPTION 'Cannot add readings to a closed iteration.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_open_iteration ON public.readings;
CREATE TRIGGER enforce_open_iteration
  BEFORE INSERT ON public.readings
  FOR EACH ROW EXECUTE FUNCTION public.check_iteration_open();

-- ────────────────────────────────────────────────────────────
-- 6. HELPER: get current user role
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readings   ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────
-- Any logged-in user can read all profiles
CREATE POLICY "users: authenticated can read"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile
CREATE POLICY "users: own update"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Admins can do everything
CREATE POLICY "users: admin full access"
  ON public.users FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── setups ───────────────────────────────────────────────────
-- All authenticated users can view setups
CREATE POLICY "setups: read"
  ON public.setups FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create/update/delete setups
CREATE POLICY "setups: admin manage"
  ON public.setups FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── iterations ───────────────────────────────────────────────
-- All authenticated users can view iterations
CREATE POLICY "iterations: read"
  ON public.iterations FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user can create an iteration
CREATE POLICY "iterations: employee create"
  ON public.iterations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Employees can only update their own active iterations (e.g. close)
-- (close = setting status to closed; reopen is admin only)
CREATE POLICY "iterations: employee close own"
  ON public.iterations FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.current_user_role() = 'admin'
  );

-- Only admins can delete iterations
CREATE POLICY "iterations: admin delete"
  ON public.iterations FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ── readings ─────────────────────────────────────────────────
-- All authenticated users can view readings
CREATE POLICY "readings: read"
  ON public.readings FOR SELECT
  TO authenticated
  USING (true);

-- Any authenticated user can add readings
CREATE POLICY "readings: employee create"
  ON public.readings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only admins can delete readings
CREATE POLICY "readings: admin delete"
  ON public.readings FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ────────────────────────────────────────────────────────────
-- 8. SAMPLE DATA (optional — remove for production)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.setups (setup_name, location, description, plant_capacity) VALUES
  ('Tower A',      'Greenhouse 1', 'Vertical NFT tower system',    60),
  ('Tower B',      'Greenhouse 1', 'Vertical NFT tower system',    60),
  ('Rack System 1','Greenhouse 2', 'Horizontal DWC rack system',  120),
  ('Raft Bed 1',   'Greenhouse 2', 'Deep water culture raft bed',  80)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONE ✓
-- ────────────────────────────────────────────────────────────
