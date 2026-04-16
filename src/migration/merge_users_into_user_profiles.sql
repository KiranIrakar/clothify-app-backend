CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  "fullName" VARCHAR(255),
  email VARCHAR(255),
  "mobileNumber" VARCHAR(20),
  password VARCHAR(255),
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
  otp VARCHAR(20),
  otp_expiry TIMESTAMPTZ,
  temprory_phone VARCHAR(20),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS "fullName" VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS "mobileNumber" VARCHAR(20),
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
ADD COLUMN IF NOT EXISTS otp VARCHAR(20),
ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS temprory_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

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
    END IF;

    UPDATE public.user_profiles AS up
    SET
      "fullName" = COALESCE(up."fullName", u.name),
      email = COALESCE(up.email, u.email),
      "mobileNumber" = COALESCE(up."mobileNumber", u.phone),
      password = COALESCE(up.password, u.password),
      "isVerified" = COALESCE(up."isVerified", u.enabled, FALSE),
      role = COALESCE(NULLIF(up.role, ''), u.role::text, 'ROLE_USER'),
      otp = COALESCE(up.otp, u.otp),
      otp_expiry = COALESCE(up.otp_expiry, u.otp_expiry),
      temprory_phone = COALESCE(up.temprory_phone, u.temprory_phone),
      "createdAt" = COALESCE(up."createdAt", u.created_at, NOW()),
      "updatedAt" = COALESCE(u.updated_at, up."updatedAt", NOW())
    FROM public.users AS u
    WHERE up.id = u.id::uuid
      OR (u.email IS NOT NULL AND up.email = u.email)
      OR (u.phone IS NOT NULL AND up."mobileNumber" = u.phone);

    INSERT INTO public.user_profiles (
      id,
      "fullName",
      email,
      "mobileNumber",
      password,
      "isVerified",
      role,
      otp,
      otp_expiry,
      temprory_phone,
      "createdAt",
      "updatedAt"
    )
    SELECT
      u.id::uuid,
      u.name,
      u.email,
      u.phone,
      u.password,
      COALESCE(u.enabled, FALSE),
      COALESCE(u.role::text, 'ROLE_USER'),
      u.otp,
      u.otp_expiry,
      u.temprory_phone,
      COALESCE(u.created_at, NOW()),
      COALESCE(u.updated_at, NOW())
    FROM public.users AS u
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.user_profiles AS up
      WHERE up.id = u.id::uuid
        OR (u.email IS NOT NULL AND up.email = u.email)
        OR (u.phone IS NOT NULL AND up."mobileNumber" = u.phone)
    );

    DROP TABLE public.users;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'user_profiles_email_unique_idx'
  ) AND NOT EXISTS (
    SELECT email
    FROM public.user_profiles
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX user_profiles_email_unique_idx
    ON public.user_profiles (email)
    WHERE email IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'user_profiles_mobile_number_unique_idx'
  ) AND NOT EXISTS (
    SELECT "mobileNumber"
    FROM public.user_profiles
    WHERE "mobileNumber" IS NOT NULL
    GROUP BY "mobileNumber"
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX user_profiles_mobile_number_unique_idx
    ON public.user_profiles ("mobileNumber")
    WHERE "mobileNumber" IS NOT NULL;
  END IF;
END $$;
