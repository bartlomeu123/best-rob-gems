CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));