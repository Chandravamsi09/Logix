-- ============================================================================
-- Logix Database Migration: ORDER-SERVICE - Step 005
-- ============================================================================

CREATE TABLE IF NOT EXISTS "order_entity_005" (
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

    CONSTRAINT "order_entity_005_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_order_005_tenant" ON "order_entity_005" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_order_005_code" ON "order_entity_005" ("code");
CREATE INDEX IF NOT EXISTS "idx_order_005_status" ON "order_entity_005" ("status");
CREATE INDEX IF NOT EXISTS "idx_order_005_created" ON "order_entity_005" ("created_at" DESC);
