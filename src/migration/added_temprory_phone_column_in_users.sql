DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS temprory_phone VARCHAR(20);

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'temporary_phone'
    ) THEN
      UPDATE public.users
      SET temprory_phone = COALESCE(temprory_phone, temporary_phone)
      WHERE temporary_phone IS NOT NULL;

      ALTER TABLE public.users
      DROP COLUMN IF EXISTS temporary_phone;
    END IF;
  END IF;
END $$;
