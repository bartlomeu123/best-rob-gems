
-- Ensure user_id has a unique constraint for upsert support
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Re-create FK: comments.user_id → profiles.user_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_id_fkey_profiles'
  ) THEN
    ALTER TABLE public.comments
      ADD CONSTRAINT comments_user_id_fkey_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: comments.game_id → games.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_game_id_fkey'
  ) THEN
    ALTER TABLE public.comments
      ADD CONSTRAINT comments_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: comments.parent_id → comments.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_parent_id_fkey'
  ) THEN
    ALTER TABLE public.comments
      ADD CONSTRAINT comments_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: comment_reports.comment_id → comments.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comment_reports_comment_id_fkey'
  ) THEN
    ALTER TABLE public.comment_reports
      ADD CONSTRAINT comment_reports_comment_id_fkey
      FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: comment_votes.comment_id → comments.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comment_votes_comment_id_fkey'
  ) THEN
    ALTER TABLE public.comment_votes
      ADD CONSTRAINT comment_votes_comment_id_fkey
      FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: favorites.game_id → games.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'favorites_game_id_fkey'
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: votes.game_id → games.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'votes_game_id_fkey'
  ) THEN
    ALTER TABLE public.votes
      ADD CONSTRAINT votes_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: game_features.game_id → games.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_features_game_id_fkey'
  ) THEN
    ALTER TABLE public.game_features
      ADD CONSTRAINT game_features_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: game_features.feature_id → features.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_features_feature_id_fkey'
  ) THEN
    ALTER TABLE public.game_features
      ADD CONSTRAINT game_features_feature_id_fkey
      FOREIGN KEY (feature_id) REFERENCES public.features(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Re-create FK: game_images.game_id → games.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_images_game_id_fkey'
  ) THEN
    ALTER TABLE public.game_images
      ADD CONSTRAINT game_images_game_id_fkey
      FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;
  END IF;
END $$;
