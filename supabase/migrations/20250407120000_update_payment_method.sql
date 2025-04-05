ALTER TABLE custom_users
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255) DEFAULT 'Memex';

ALTER TABLE custom_users
ALTER COLUMN payment_method SET DEFAULT 'Memex';

UPDATE custom_users
SET payment_made = TRUE
WHERE payment_method = 'Memex';
