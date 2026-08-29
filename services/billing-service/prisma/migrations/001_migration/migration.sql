-- ============================================================================
-- Logix Database Migration: BILLING-SERVICE - Step 001
-- ============================================================================

CREATE TABLE IF NOT EXISTS "billing_entity_001" (
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

    CONSTRAINT "billing_entity_001_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_billing_001_tenant" ON "billing_entity_001" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_billing_001_code" ON "billing_entity_001" ("code");
CREATE INDEX IF NOT EXISTS "idx_billing_001_status" ON "billing_entity_001" ("status");
CREATE INDEX IF NOT EXISTS "idx_billing_001_created" ON "billing_entity_001" ("created_at" DESC);
