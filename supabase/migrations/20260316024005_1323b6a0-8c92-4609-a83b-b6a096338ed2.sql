
CREATE TABLE public.game_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.game_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Game images viewable by everyone" ON public.game_images
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage game images" ON public.game_images
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
