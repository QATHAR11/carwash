/*
  # Add Sales Recording Functionality

  1. New Features
    - Staff can record sales and view their own sales
    - Admin can view all sales from all staff members
    - Currency changed from $ to KSh throughout the system
    - Users can update their own credentials

  2. Security
    - RLS policies ensure staff only see their own sales
    - Admin can see all sales
    - Users can only update their own profile data

  3. Database Changes
    - Sales table already exists, just need to ensure proper policies
    - Add profile update capabilities
*/

-- Ensure sales table has proper RLS policies for the new requirements
DROP POLICY IF EXISTS "Staff can read own sales" ON sales;
DROP POLICY IF EXISTS "Admins can read all sales" ON sales;
DROP POLICY IF EXISTS "Staff can create own sales" ON sales;
DROP POLICY IF EXISTS "Users can create sales" ON sales;
DROP POLICY IF EXISTS "Admins can manage all sales" ON sales;

-- Create new comprehensive sales policies
CREATE POLICY "Staff can view own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (staff_id = auth.uid());

CREATE POLICY "Admin can view all sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Staff can record sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "Admin can manage all sales"
  ON sales
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Add policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a view for sales with service and staff names for easier querying
CREATE OR REPLACE VIEW sales_with_details AS
SELECT 
  s.id,
  s.service_id,
  s.staff_id,
  s.amount,
  s.date,
  s.created_at,
  srv.name as service_name,
  u.name as staff_name
FROM sales s
LEFT JOIN services srv ON s.service_id = srv.id
LEFT JOIN users u ON s.staff_id = u.id;

-- Grant access to the view
GRANT SELECT ON sales_with_details TO authenticated;