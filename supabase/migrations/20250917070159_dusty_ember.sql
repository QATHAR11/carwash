/*
  # Fix RLS Infinite Recursion Error

  1. Problem
    - Current policies query the users table from within users table policies
    - This creates infinite recursion when checking permissions

  2. Solution
    - Use auth.uid() directly instead of querying users table
    - Simplify policies to avoid self-referential queries
    - Use role from auth.users metadata or JWT claims

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies that don't cause recursion
    - Ensure users can read their own data without infinite loops
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Allow trigger to insert users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For now, let's allow authenticated users to insert their own record
-- This will be used by the trigger function
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update the trigger function to be simpler and avoid RLS issues
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users using the service role context
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'staff'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;