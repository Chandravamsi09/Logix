-- ============================================================================
-- Logix Database Migration: ANALYTICS-SERVICE - Step 002
-- ============================================================================

CREATE TABLE IF NOT EXISTS "analytics_entity_002" (
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

    CONSTRAINT "analytics_entity_002_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_analytics_002_tenant" ON "analytics_entity_002" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_analytics_002_code" ON "analytics_entity_002" ("code");
CREATE INDEX IF NOT EXISTS "idx_analytics_002_status" ON "analytics_entity_002" ("status");
CREATE INDEX IF NOT EXISTS "idx_analytics_002_created" ON "analytics_entity_002" ("created_at" DESC);
