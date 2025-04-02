-- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      telegram_username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      country TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable Row Level Security (RLS)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    -- Create policy for authenticated users to select their own data
    DROP POLICY IF EXISTS "Enable read access for users" ON users;
    CREATE POLICY "Enable read access for users" ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

    -- Create policy for users to insert their own data
    DROP POLICY IF EXISTS "Enable insert access for users" ON users;
    CREATE POLICY "Enable insert access for users" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = gen_random_uuid());

    -- Create policy for users to update their own data
    DROP POLICY IF EXISTS "Enable update access for users" ON users;
    CREATE POLICY "Enable update access for users" ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

    -- No delete policy as users shouldn't be able to delete their accounts directly
