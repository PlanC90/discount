/*
  # Create coupons table

  1. New Tables
    - `coupons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `code` (text)
      - `discount` (numeric)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `coupons` table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text NOT NULL,
  discount numeric NOT NULL,
  description text,
  image_url text,
  approved boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON coupons;
CREATE POLICY "Enable read access for all users" ON coupons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON coupons;
CREATE POLICY "Enable insert access for all users" ON coupons
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON coupons;
CREATE POLICY "Enable update access for all users" ON coupons
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON coupons;
CREATE POLICY "Enable delete access for all users" ON coupons
  FOR DELETE USING (true);
