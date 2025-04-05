-- 1. coupons tablosundaki user_id foreign key constraint'ini sil
ALTER TABLE "public"."coupons" DROP CONSTRAINT IF EXISTS coupons_user_id_fkey;

-- 2. custom_users tablosunu sil
DROP TABLE IF EXISTS custom_users;

-- 3. custom_users tablosunu yeniden oluştur
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS custom_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    memex_payment BOOLEAN,
    payment_made BOOLEAN,
    payment_method TEXT
);

-- 4. coupons tablosuna user_id sütununu foreign key olarak yeniden ekle
ALTER TABLE "public"."coupons" ADD COLUMN "user_id" UUID REFERENCES custom_users(id);
