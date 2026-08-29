-- ============================================================================
-- Logix Database Migration: AUTH-SERVICE - Step 009
-- ============================================================================

CREATE TABLE IF NOT EXISTS "auth_entity_009" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "priority_score" INTEGER NOT NULL DEFAULT 100,
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_entity_009_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_auth_009_tenant" ON "auth_entity_009" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_auth_009_code" ON "auth_entity_009" ("code");
CREATE INDEX IF NOT EXISTS "idx_auth_009_status" ON "auth_entity_009" ("status");
CREATE INDEX IF NOT EXISTS "idx_auth_009_created" ON "auth_entity_009" ("created_at" DESC);
