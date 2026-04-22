DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS role VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER';
  END IF;
END $$;
