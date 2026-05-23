
CREATE TABLE public.devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  watts INTEGER NOT NULL DEFAULT 100,
  daily_hours NUMERIC NOT NULL DEFAULT 4,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own devices"
  ON public.devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert their own devices"
  ON public.devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own devices"
  ON public.devices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete their own devices"
  ON public.devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_devices_user ON public.devices(user_id);
