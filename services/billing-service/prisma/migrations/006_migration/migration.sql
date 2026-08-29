-- ============================================================================
-- Logix Database Migration: BILLING-SERVICE - Step 006
-- ============================================================================

CREATE TABLE IF NOT EXISTS "billing_entity_006" (
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

    CONSTRAINT "billing_entity_006_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_billing_006_tenant" ON "billing_entity_006" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_billing_006_code" ON "billing_entity_006" ("code");
CREATE INDEX IF NOT EXISTS "idx_billing_006_status" ON "billing_entity_006" ("status");
CREATE INDEX IF NOT EXISTS "idx_billing_006_created" ON "billing_entity_006" ("created_at" DESC);
