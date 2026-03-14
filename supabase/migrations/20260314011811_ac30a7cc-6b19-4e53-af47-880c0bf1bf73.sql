-- Comment votes table for Reddit-style upvote/downvote
CREATE TABLE public.comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment votes viewable by everyone" ON public.comment_votes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can vote on comments" ON public.comment_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comment vote" ON public.comment_votes FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment vote" ON public.comment_votes FOR DELETE TO public USING (auth.uid() = user_id);