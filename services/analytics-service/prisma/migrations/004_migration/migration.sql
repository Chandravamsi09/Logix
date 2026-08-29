-- ============================================================================
-- Logix Database Migration: ANALYTICS-SERVICE - Step 004
-- ============================================================================

CREATE TABLE IF NOT EXISTS "analytics_entity_004" (
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

    CONSTRAINT "analytics_entity_004_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_analytics_004_tenant" ON "analytics_entity_004" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_analytics_004_code" ON "analytics_entity_004" ("code");
CREATE INDEX IF NOT EXISTS "idx_analytics_004_status" ON "analytics_entity_004" ("status");
CREATE INDEX IF NOT EXISTS "idx_analytics_004_created" ON "analytics_entity_004" ("created_at" DESC);
