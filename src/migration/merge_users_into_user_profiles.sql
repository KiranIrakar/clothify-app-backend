CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" UUID PRIMARY KEY,
  "fullName" VARCHAR(255),
  "email" VARCHAR(255),
  "mobileNumber" VARCHAR(20),
  "password" VARCHAR(255),
  "isVerified" BOOLEAN DEFAULT FALSE,
  "role" VARCHAR(20) DEFAULT 'ROLE_USER',
  "otp" VARCHAR(20),
  "otp_expiry" TIMESTAMPTZ,
  "temprory_phone" VARCHAR(20),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) DEFAULT 'ROLE_USER',
  ADD COLUMN IF NOT EXISTS "otp" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "otp_expiry" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "temprory_phone" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE "user_profiles" ALTER COLUMN "fullName" DROP NOT NULL;
ALTER TABLE "user_profiles" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "user_profiles" ALTER COLUMN "mobileNumber" DROP NOT NULL;
ALTER TABLE "user_profiles" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "user_profiles" ALTER COLUMN "isVerified" SET DEFAULT FALSE;
ALTER TABLE "user_profiles" ALTER COLUMN "role" SET DEFAULT 'ROLE_USER';
ALTER TABLE "user_profiles" ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE "user_profiles" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'users'
  ) THEN
    UPDATE "user_profiles" AS up
    SET
      "fullName" = COALESCE(up."fullName", u."name"),
      "email" = COALESCE(up."email", u."email"),
      "mobileNumber" = COALESCE(up."mobileNumber", u."phone"),
      "password" = COALESCE(up."password", u."password"),
      "isVerified" = COALESCE(up."isVerified", u."enabled", FALSE),
      "role" = COALESCE(up."role", u."role", 'ROLE_USER'),
      "otp" = COALESCE(up."otp", u."otp"),
      "otp_expiry" = COALESCE(up."otp_expiry", u."otp_expiry"),
      "temprory_phone" = COALESCE(
        up."temprory_phone",
        to_jsonb(u) ->> 'temprory_phone',
        to_jsonb(u) ->> 'temporary_phone'
      ),
      "createdAt" = COALESCE(up."createdAt", u."created_at", NOW()),
      "updatedAt" = COALESCE(up."updatedAt", u."updated_at", NOW())
    FROM "users" AS u
    WHERE up."id" = u."id"
      OR (u."email" IS NOT NULL AND up."email" = u."email")
      OR (u."phone" IS NOT NULL AND up."mobileNumber" = u."phone");

    INSERT INTO "user_profiles" (
      "id",
      "fullName",
      "email",
      "mobileNumber",
      "password",
      "isVerified",
      "role",
      "otp",
      "otp_expiry",
      "temprory_phone",
      "createdAt",
      "updatedAt"
    )
    SELECT
      u."id",
      u."name",
      u."email",
      u."phone",
      u."password",
      COALESCE(u."enabled", FALSE),
      COALESCE(u."role", 'ROLE_USER'),
      u."otp",
      u."otp_expiry",
      COALESCE(
        to_jsonb(u) ->> 'temprory_phone',
        to_jsonb(u) ->> 'temporary_phone'
      ),
      COALESCE(u."created_at", NOW()),
      COALESCE(u."updated_at", NOW())
    FROM "users" AS u
    WHERE NOT EXISTS (
      SELECT 1
      FROM "user_profiles" AS up
      WHERE up."id" = u."id"
        OR (u."email" IS NOT NULL AND up."email" = u."email")
        OR (u."phone" IS NOT NULL AND up."mobileNumber" = u."phone")
    );

    DROP TABLE IF EXISTS "users";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND indexname = 'user_profiles_email_unique_idx'
  ) AND NOT EXISTS (
    SELECT 1
    FROM "user_profiles"
    WHERE "email" IS NOT NULL
    GROUP BY "email"
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX "user_profiles_email_unique_idx"
      ON "user_profiles" ("email")
      WHERE "email" IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND indexname = 'user_profiles_mobile_number_unique_idx'
  ) AND NOT EXISTS (
    SELECT 1
    FROM "user_profiles"
    WHERE "mobileNumber" IS NOT NULL
    GROUP BY "mobileNumber"
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX "user_profiles_mobile_number_unique_idx"
      ON "user_profiles" ("mobileNumber")
      WHERE "mobileNumber" IS NOT NULL;
  END IF;
END $$;
