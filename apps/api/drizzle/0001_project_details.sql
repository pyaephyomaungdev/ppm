ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "body" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "period" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "tech_stack" jsonb DEFAULT '[]'::jsonb NOT NULL;
