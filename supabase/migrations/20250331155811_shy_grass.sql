/*
  # Fix contacts table schema

  1. Changes
    - Update column names to match application expectations:
      - 'name' -> 'first_name'
      - 'surname' -> 'last_name'
    - Add created_at column for sorting

  2. Security
    - Maintain existing RLS policies
*/

-- Rename existing columns
ALTER TABLE contacts 
RENAME COLUMN name TO first_name;

ALTER TABLE contacts 
RENAME COLUMN surname TO last_name;

-- Add created_at column
ALTER TABLE contacts 
ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
