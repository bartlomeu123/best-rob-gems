
-- Add unique constraint on profiles.user_id for FK references
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Add FK from comments.user_id to profiles.user_id
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey_profiles
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Create comment_reports table
CREATE TABLE public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT 'inappropriate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(comment_id, reported_by)
);

ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can report
CREATE POLICY "Authenticated users can report comments"
  ON public.comment_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reported_by);

-- Admins can view all reports
CREATE POLICY "Admins can view reports"
  ON public.comment_reports FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can update/delete reports
CREATE POLICY "Admins can manage reports"
  ON public.comment_reports FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reports"
  ON public.comment_reports FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Users can see own reports
CREATE POLICY "Users can view own reports"
  ON public.comment_reports FOR SELECT TO authenticated
  USING (auth.uid() = reported_by);
