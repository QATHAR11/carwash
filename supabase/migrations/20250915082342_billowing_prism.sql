/*
  # Seed Sample Data for Car Wash System

  1. Demo Users
    - Admin user for dashboard access
    - Staff users for sales entry

  2. Sample Sales Data
    - Various services with realistic amounts
    - Different dates to show trends
    - Multiple staff members for comparison

  3. Notes
    - Passwords are hashed by Supabase Auth
    - Sample data spans last 30 days for demo purposes
*/

-- Note: Demo users must be created through the Supabase Auth system
-- This migration only creates sample sales data after users exist

-- Insert sample sales data (will be inserted after demo accounts are created)
INSERT INTO sales (service_id, staff_id, amount, date) 
SELECT 
  s.id as service_id,
  u.id as staff_id,
  CASE s.name
    WHEN 'Car Wash' THEN 500 + (RANDOM() * 300)::int
    WHEN 'Oil Change' THEN 1200 + (RANDOM() * 500)::int
    WHEN 'Tyres' THEN 3000 + (RANDOM() * 2000)::int
    WHEN 'Labour' THEN 800 + (RANDOM() * 700)::int
    WHEN 'Spare Parts' THEN 1500 + (RANDOM() * 1000)::int
    ELSE 600 + (RANDOM() * 400)::int
  END as amount,
  (CURRENT_DATE - (RANDOM() * 30)::int) as date
FROM services s
CROSS JOIN (
  SELECT id FROM users WHERE role = 'staff' LIMIT 2
) u
WHERE EXISTS (SELECT 1 FROM users WHERE role = 'staff')
AND RANDOM() < 0.7  -- 70% chance to create each combination
ON CONFLICT DO NOTHING;

-- Insert additional random sales for the current month
INSERT INTO sales (service_id, staff_id, amount, date)
SELECT 
  (SELECT id FROM services ORDER BY RANDOM() LIMIT 1) as service_id,
  (SELECT id FROM users WHERE role IN ('admin', 'staff') ORDER BY RANDOM() LIMIT 1) as staff_id,
  (300 + (RANDOM() * 2000)::int) as amount,
  (CURRENT_DATE - (RANDOM() * 15)::int) as date
FROM generate_series(1, 25)
WHERE EXISTS (SELECT 1 FROM users)
ON CONFLICT DO NOTHING;