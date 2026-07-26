ALTER TABLE "stats" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "education" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "honors" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now() NOT NULL;
