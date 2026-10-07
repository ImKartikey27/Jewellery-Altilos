-- Baseline migration.
--
-- The chain that preceded this one was written while the site was still being
-- built and then abandoned: schema changes were applied to the live database
-- with `prisma db push`, so by the time it mattered the migrations were six
-- changes behind the schema — among them Order.stripeSessionId (the key every
-- payment finalization looks an order up by) and a NOT NULL on Order.customerId
-- that no longer holds, since an Order is created before the customer is known.
-- A database built from that chain could not have taken a payment.
--
-- prisma/schema.prisma is the source of truth. This file is generated from it
-- (`prisma migrate diff --from-empty --to-schema`) and reproduces the live
-- database exactly. The existing database already contains all of it and must be
-- BASELINED (`prisma migrate resolve --applied 0_init`), never migrated.
--
-- From here on, schema changes go through `prisma migrate dev`, not `db push`.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OnboardingTokenDelivery" AS ENUM ('CONFIRMATION_CTA', 'EMAIL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "mobileNumber" TEXT,
    "stripeCustomerId" TEXT,
    "pipedrivePersonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "plan" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'inr',
    "addOns" JSONB,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "pipedriveDealId" INTEGER,
    "onboardingEmailSentAt" TIMESTAMP(3),
    "onboardingEmailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingAccessToken" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "delivery" "OnboardingTokenDelivery" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OnboardingAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingSubmission" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "workEmail" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "phoneNumber" TEXT,
    "researchBrief" JSONB NOT NULL,
    "termsAccepted" BOOLEAN NOT NULL,
    "payload" JSONB NOT NULL,
    "pipedriveSyncedAt" TIMESTAMP(3),
    "pipedriveSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "companyName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'email-gate',
    "pipedrivePersonId" INTEGER,
    "pipedriveSyncedAt" TIMESTAMP(3),
    "pipedriveSyncError" TEXT,
    "reportSentAt" TIMESTAMP(3),
    "reportSendError" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    "processingError" TEXT,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingAccessToken_tokenHash_key" ON "OnboardingAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "OnboardingAccessToken_orderId_idx" ON "OnboardingAccessToken"("orderId");

-- CreateIndex
CREATE INDEX "OnboardingAccessToken_expiresAt_idx" ON "OnboardingAccessToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingSubmission_orderId_key" ON "OnboardingSubmission"("orderId");

-- CreateIndex
CREATE INDEX "OnboardingSubmission_customerId_idx" ON "OnboardingSubmission"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_type_idx" ON "WebhookEvent"("type");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingAccessToken" ADD CONSTRAINT "OnboardingAccessToken_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSubmission" ADD CONSTRAINT "OnboardingSubmission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingSubmission" ADD CONSTRAINT "OnboardingSubmission_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

