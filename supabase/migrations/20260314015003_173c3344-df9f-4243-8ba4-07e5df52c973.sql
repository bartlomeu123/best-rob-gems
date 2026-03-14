-- Add submission metadata to games
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS submitter_type text NOT NULL DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_other text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'games_submitter_type_check'
      AND conrelid = 'public.games'::regclass
  ) THEN
    ALTER TABLE public.games
      ADD CONSTRAINT games_submitter_type_check
      CHECK (submitter_type IN ('regular', 'developer'));
  END IF;
END $$;

-- Features catalog
CREATE TABLE IF NOT EXISTS public.features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- Game-feature relation table
CREATE TABLE IF NOT EXISTS public.game_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.features(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, feature_id)
);

CREATE INDEX IF NOT EXISTS idx_game_features_game_id ON public.game_features(game_id);
CREATE INDEX IF NOT EXISTS idx_game_features_feature_id ON public.game_features(feature_id);

ALTER TABLE public.game_features ENABLE ROW LEVEL SECURITY;

-- Seed predefined feature list
INSERT INTO public.features (name)
VALUES
  ('Single Player'),
  ('Multiplayer'),
  ('Co-op Gameplay'),
  ('PvP Combat'),
  ('PvE Combat'),
  ('Open World'),
  ('Instanced Dungeons'),
  ('Lobby Based'),
  ('Round Based'),
  ('Sandbox'),
  ('Character Progression'),
  ('Skill Tree'),
  ('Level System'),
  ('Equipment System'),
  ('Boss Battles'),
  ('Quest System'),
  ('Trading System'),
  ('Guilds / Clans'),
  ('Player Economy'),
  ('Chat System'),
  ('Leaderboards'),
  ('Private Servers'),
  ('Ranked'),
  ('Party System'),
  ('Matchmaking'),
  ('Public Servers'),
  ('Gamepasses'),
  ('Microtransactions'),
  ('Pay to Win Elements'),
  ('Cosmetic Shop'),
  ('PC Support'),
  ('Mobile Support'),
  ('Console Support'),
  ('Cross-platform Play'),
  ('Achievements')
ON CONFLICT (name) DO NOTHING;

-- Policies for features
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='features' AND policyname='Features viewable by everyone'
  ) THEN
    CREATE POLICY "Features viewable by everyone"
    ON public.features
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='features' AND policyname='Admins can manage features'
  ) THEN
    CREATE POLICY "Admins can manage features"
    ON public.features
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Policies for game_features
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='game_features' AND policyname='Game features viewable by everyone'
  ) THEN
    CREATE POLICY "Game features viewable by everyone"
    ON public.game_features
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='game_features' AND policyname='Users can add features for own submissions or admins'
  ) THEN
    CREATE POLICY "Users can add features for own submissions or admins"
    ON public.game_features
    FOR INSERT
    TO authenticated
    WITH CHECK (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1
        FROM public.games g
        WHERE g.id = game_features.game_id
          AND g.submitted_by = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='game_features' AND policyname='Admins can update game features'
  ) THEN
    CREATE POLICY "Admins can update game features"
    ON public.game_features
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='game_features' AND policyname='Admins can delete game features'
  ) THEN
    CREATE POLICY "Admins can delete game features"
    ON public.game_features
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;