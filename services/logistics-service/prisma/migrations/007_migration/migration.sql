-- ============================================================================
-- Logix Database Migration: LOGISTICS-SERVICE - Step 007
-- ============================================================================

CREATE TABLE IF NOT EXISTS "logistics_entity_007" (
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

    CONSTRAINT "logistics_entity_007_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_logistics_007_tenant" ON "logistics_entity_007" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_logistics_007_code" ON "logistics_entity_007" ("code");
CREATE INDEX IF NOT EXISTS "idx_logistics_007_status" ON "logistics_entity_007" ("status");
CREATE INDEX IF NOT EXISTS "idx_logistics_007_created" ON "logistics_entity_007" ("created_at" DESC);
