-- This SQL code modifies the coupons table to handle empty strings for the discount field.
-- It sets the default value of the discount column to 0.

ALTER TABLE "public"."coupons"
ALTER COLUMN "discount" SET DEFAULT 0;
