ALTER TABLE "public"."coupons" ADD COLUMN "user_id" UUID REFERENCES custom_users(id);
