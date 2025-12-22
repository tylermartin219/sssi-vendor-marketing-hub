-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- Step 1: Create companies from unique user.company values
-- Using a simple approach: create companies with cuid-like IDs
INSERT INTO "Company" ("id", "name", "createdAt", "updatedAt")
SELECT 
    'comp_' || md5("company" || NOW()::text || RANDOM()::text) as id,
    "company" as name,
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "User"
WHERE "company" IS NOT NULL AND "company" != ''
GROUP BY "company";

-- Step 2: Add companyId column to User (nullable for now)
ALTER TABLE "User" ADD COLUMN "companyId" TEXT;

-- Step 3: Update User records to set companyId
UPDATE "User" u
SET "companyId" = c."id"
FROM "Company" c
WHERE u."company" = c."name" AND u."company" IS NOT NULL;

-- Step 4: Add foreign key constraint for User.companyId
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Update Invoice table - add companyId, remove userId
ALTER TABLE "Invoice" ADD COLUMN "companyId" TEXT;

-- Step 6: Migrate invoice companyId from user's company
UPDATE "Invoice" i
SET "companyId" = u."companyId"
FROM "User" u
WHERE i."userId" = u."id" AND u."companyId" IS NOT NULL;

-- Step 7: Remove old Invoice columns and add foreign key
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";
ALTER TABLE "Invoice" DROP COLUMN "userId";
ALTER TABLE "Invoice" DROP COLUMN "dueDate";
ALTER TABLE "Invoice" DROP COLUMN "billingAddress";
ALTER TABLE "Invoice" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Remove productId from InvoiceItem
ALTER TABLE "InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_productId_fkey";
ALTER TABLE "InvoiceItem" DROP COLUMN IF EXISTS "productId";

-- Step 9: Remove company string column from User
ALTER TABLE "User" DROP COLUMN "company";

-- Step 10: Remove product relation from Product model (already done in schema, but ensure InvoiceItem doesn't reference it)
-- This is handled by the schema change

