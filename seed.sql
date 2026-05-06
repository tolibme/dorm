-- Seed data for University Dormitory Management System

-- Staff (4 members)
INSERT INTO staff (full_name, role, email, phone) VALUES
  ('Alice Johnson',  'Manager',    'alice.johnson@uni.edu',   '+1-555-0101'),
  ('Bob Williams',   'Supervisor', 'bob.williams@uni.edu',    '+1-555-0102'),
  ('Carol Davis',    'Technician', 'carol.davis@uni.edu',     '+1-555-0103'),
  ('David Martinez', 'Security',   'david.martinez@uni.edu',  '+1-555-0104');

-- Dormitories (3: mixed, male, female)
INSERT INTO dormitories (name, address, type, total_rooms, staff_id) VALUES
  ('Sunrise Hall',    '100 Campus Blvd, Block A', 'mixed',  10, 1),
  ('Oak Residence',   '200 Campus Blvd, Block B', 'male',   10, 2),
  ('Maple Residence', '300 Campus Blvd, Block C', 'female', 10, 1);

-- Rooms: 10 per dorm (30 total), varying types and fees
-- Dorm 1 - Sunrise Hall (mixed)
INSERT INTO rooms (dorm_id, room_number, room_type, capacity, current_occupancy, monthly_fee, status) VALUES
  (1, '101', 'single', 1, 1, 350.00, 'full'),
  (1, '102', 'double', 2, 1, 250.00, 'available'),
  (1, '103', 'double', 2, 2, 250.00, 'full'),
  (1, '104', 'triple', 3, 1, 200.00, 'available'),
  (1, '105', 'single', 1, 0, 350.00, 'available'),
  (1, '106', 'double', 2, 0, 250.00, 'available'),
  (1, '107', 'triple', 3, 2, 200.00, 'available'),
  (1, '108', 'single', 1, 0, 350.00, 'maintenance'),
  (1, '109', 'double', 2, 1, 250.00, 'available'),
  (1, '110', 'triple', 3, 0, 200.00, 'available');

-- Dorm 2 - Oak Residence (male)
INSERT INTO rooms (dorm_id, room_number, room_type, capacity, current_occupancy, monthly_fee, status) VALUES
  (2, '201', 'single', 1, 1, 320.00, 'full'),
  (2, '202', 'double', 2, 1, 230.00, 'available'),
  (2, '203', 'triple', 3, 3, 180.00, 'full'),
  (2, '204', 'single', 1, 0, 320.00, 'available'),
  (2, '205', 'double', 2, 1, 230.00, 'available'),
  (2, '206', 'triple', 3, 0, 180.00, 'available'),
  (2, '207', 'double', 2, 2, 230.00, 'full'),
  (2, '208', 'single', 1, 0, 320.00, 'available'),
  (2, '209', 'triple', 3, 1, 180.00, 'available'),
  (2, '210', 'double', 2, 0, 230.00, 'available');

-- Dorm 3 - Maple Residence (female)
INSERT INTO rooms (dorm_id, room_number, room_type, capacity, current_occupancy, monthly_fee, status) VALUES
  (3, '301', 'single', 1, 1, 370.00, 'full'),
  (3, '302', 'double', 2, 2, 270.00, 'full'),
  (3, '303', 'triple', 3, 1, 210.00, 'available'),
  (3, '304', 'single', 1, 0, 370.00, 'available'),
  (3, '305', 'double', 2, 1, 270.00, 'available'),
  (3, '306', 'triple', 3, 0, 210.00, 'available'),
  (3, '307', 'single', 1, 0, 370.00, 'available'),
  (3, '308', 'double', 2, 0, 270.00, 'available'),
  (3, '309', 'triple', 3, 2, 210.00, 'available'),
  (3, '310', 'double', 2, 0, 270.00, 'maintenance');

-- Students (20)
INSERT INTO students (full_name, email, phone, national_id, date_of_birth, gender, faculty, year_of_study) VALUES
  ('Ethan Brown',      'ethan.brown@student.edu',      '+1-555-1001', 'NID100001', '2003-04-12', 'male',   'Engineering',       2),
  ('Sophia Clark',     'sophia.clark@student.edu',     '+1-555-1002', 'NID100002', '2002-07-23', 'female', 'Science',           3),
  ('Liam Wilson',      'liam.wilson@student.edu',      '+1-555-1003', 'NID100003', '2004-01-05', 'male',   'Business',          1),
  ('Olivia Lewis',     'olivia.lewis@student.edu',     '+1-555-1004', 'NID100004', '2003-09-18', 'female', 'Arts',              2),
  ('Noah Anderson',    'noah.anderson@student.edu',    '+1-555-1005', 'NID100005', '2002-11-30', 'male',   'Engineering',       3),
  ('Emma Thomas',      'emma.thomas@student.edu',      '+1-555-1006', 'NID100006', '2004-03-14', 'female', 'Medicine',          1),
  ('Oliver Jackson',   'oliver.jackson@student.edu',   '+1-555-1007', 'NID100007', '2003-06-22', 'male',   'Law',               2),
  ('Ava White',        'ava.white@student.edu',        '+1-555-1008', 'NID100008', '2002-12-08', 'female', 'Science',           3),
  ('James Harris',     'james.harris@student.edu',     '+1-555-1009', 'NID100009', '2004-05-17', 'male',   'IT',                1),
  ('Isabella Martin',  'isabella.martin@student.edu',  '+1-555-1010', 'NID100010', '2003-08-25', 'female', 'Education',         2),
  ('Benjamin Garcia',  'benjamin.garcia@student.edu',  '+1-555-1011', 'NID100011', '2002-02-11', 'male',   'Engineering',       4),
  ('Mia Rodriguez',    'mia.rodriguez@student.edu',    '+1-555-1012', 'NID100012', '2004-10-03', 'female', 'Arts',              1),
  ('Elijah Martinez',  'elijah.martinez@student.edu',  '+1-555-1013', 'NID100013', '2003-07-29', 'male',   'Business',          2),
  ('Charlotte Lee',    'charlotte.lee@student.edu',    '+1-555-1014', 'NID100014', '2002-04-16', 'female', 'Medicine',          3),
  ('Lucas Thompson',   'lucas.thompson@student.edu',   '+1-555-1015', 'NID100015', '2004-09-07', 'male',   'Science',           1),
  ('Amelia Walker',    'amelia.walker@student.edu',    '+1-555-1016', 'NID100016', '2003-03-21', 'female', 'Law',               2),
  ('Mason Hall',       'mason.hall@student.edu',       '+1-555-1017', 'NID100017', '2002-08-14', 'male',   'IT',                4),
  ('Harper Allen',     'harper.allen@student.edu',     '+1-555-1018', 'NID100018', '2004-06-30', 'female', 'Education',         1),
  ('Logan Young',      'logan.young@student.edu',      '+1-555-1019', 'NID100019', '2003-01-09', 'male',   'Engineering',       2),
  ('Evelyn King',      'evelyn.king@student.edu',      '+1-555-1020', 'NID100020', '2002-05-26', 'female', 'Science',           3);

-- Applications (15: mixed statuses)
INSERT INTO applications (student_id, dorm_id, preferred_move_in, room_preference, status, applied_at, reviewed_at, reviewed_by) VALUES
  (1,  1, '2025-09-01', 'single', 'approved',  '2025-08-01 09:00', '2025-08-05 14:00', 1),
  (2,  3, '2025-09-01', 'double', 'approved',  '2025-08-02 10:00', '2025-08-06 11:00', 2),
  (3,  2, '2025-09-01', 'double', 'approved',  '2025-08-03 11:00', '2025-08-07 09:00', 1),
  (4,  3, '2025-09-01', 'single', 'approved',  '2025-08-04 08:00', '2025-08-08 16:00', 2),
  (5,  2, '2025-09-01', 'triple', 'approved',  '2025-08-05 13:00', '2025-08-09 10:00', 1),
  (6,  3, '2025-09-01', 'double', 'approved',  '2025-08-06 15:00', '2025-08-10 14:00', 2),
  (7,  1, '2025-09-01', 'double', 'approved',  '2025-08-07 09:30', '2025-08-11 11:00', 1),
  (8,  3, '2025-09-01', 'triple', 'approved',  '2025-08-08 14:00', '2025-08-12 09:00', 2),
  (9,  2, '2025-09-01', 'single', 'approved',  '2025-08-09 10:30', '2025-08-13 15:00', 1),
  (10, 1, '2025-09-01', 'double', 'approved',  '2025-08-10 11:00', '2025-08-14 10:00', 2),
  (11, 2, '2025-09-01', 'triple', 'rejected',  '2025-08-11 09:00', '2025-08-15 11:00', 1),
  (12, 3, '2025-09-01', 'single', 'rejected',  '2025-08-12 14:00', '2025-08-16 09:00', 2),
  (13, 1, '2025-10-01', 'double', 'pending',   '2025-09-01 10:00', NULL, NULL),
  (14, 3, '2025-10-01', 'single', 'pending',   '2025-09-02 11:00', NULL, NULL),
  (15, 2, '2025-10-01', 'triple', 'pending',   '2025-09-03 12:00', NULL, NULL);

-- Assignments (10 active — matching approved applications)
INSERT INTO assignments (student_id, room_id, application_id, check_in_date, check_out_date, status) VALUES
  (1,   1,  1,  '2025-09-01', '2026-06-30', 'active'),
  (2,  21,  2,  '2025-09-01', '2026-06-30', 'active'),
  (3,  12,  3,  '2025-09-01', '2026-06-30', 'active'),
  (4,  22,  4,  '2025-09-01', '2026-06-30', 'active'),
  (5,  13,  5,  '2025-09-01', '2026-06-30', 'active'),
  (6,  23,  6,  '2025-09-01', '2026-06-30', 'active'),
  (7,   2,  7,  '2025-09-01', '2026-06-30', 'active'),
  (8,  24,  8,  '2025-09-01', '2026-06-30', 'active'),
  (9,  11,  9,  '2025-09-01', '2026-06-30', 'active'),
  (10,  3, 10, '2025-09-01', '2026-06-30', 'active');

-- Payments (30 records — 3 per assignment, mixed statuses)
INSERT INTO payments (student_id, assignment_id, amount, payment_type, status, due_date, paid_date, receipt_number) VALUES
  -- Assignment 1 (student 1, room 1 — $350)
  (1, 1, 350.00, 'monthly', 'paid',    '2025-09-01', '2025-09-01', 'RCP-0001'),
  (1, 1, 350.00, 'monthly', 'paid',    '2025-10-01', '2025-10-03', 'RCP-0002'),
  (1, 1, 350.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 2 (student 2, room 21 — $370)
  (2, 2, 370.00, 'monthly', 'paid',    '2025-09-01', '2025-09-02', 'RCP-0003'),
  (2, 2, 370.00, 'monthly', 'overdue', '2025-10-01', NULL, NULL),
  (2, 2, 370.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 3 (student 3, room 12 — $230)
  (3, 3, 230.00, 'monthly', 'paid',    '2025-09-01', '2025-09-05', 'RCP-0004'),
  (3, 3, 230.00, 'monthly', 'paid',    '2025-10-01', '2025-10-02', 'RCP-0005'),
  (3, 3, 230.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 4 (student 4, room 22 — $270)
  (4, 4, 270.00, 'monthly', 'paid',    '2025-09-01', '2025-09-03', 'RCP-0006'),
  (4, 4, 270.00, 'monthly', 'overdue', '2025-10-01', NULL, NULL),
  (4, 4, 270.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 5 (student 5, room 13 — $180)
  (5, 5, 180.00, 'monthly', 'paid',    '2025-09-01', '2025-09-01', 'RCP-0007'),
  (5, 5, 180.00, 'monthly', 'paid',    '2025-10-01', '2025-10-04', 'RCP-0008'),
  (5, 5, 180.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 6 (student 6, room 23 — $210)
  (6, 6, 210.00, 'monthly', 'paid',    '2025-09-01', '2025-09-02', 'RCP-0009'),
  (6, 6, 210.00, 'monthly', 'overdue', '2025-10-01', NULL, NULL),
  (6, 6, 210.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 7 (student 7, room 2 — $250)
  (7, 7, 250.00, 'monthly', 'paid',    '2025-09-01', '2025-09-01', 'RCP-0010'),
  (7, 7, 250.00, 'monthly', 'paid',    '2025-10-01', '2025-10-01', 'RCP-0011'),
  (7, 7, 250.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 8 (student 8, room 24 — $270)
  (8, 8, 270.00, 'monthly', 'paid',    '2025-09-01', '2025-09-06', 'RCP-0012'),
  (8, 8, 270.00, 'monthly', 'overdue', '2025-10-01', NULL, NULL),
  (8, 8, 270.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 9 (student 9, room 11 — $320)
  (9, 9, 320.00, 'monthly', 'paid',    '2025-09-01', '2025-09-03', 'RCP-0013'),
  (9, 9, 320.00, 'monthly', 'paid',    '2025-10-01', '2025-10-05', 'RCP-0014'),
  (9, 9, 320.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL),

  -- Assignment 10 (student 10, room 3 — $250)
  (10, 10, 250.00, 'monthly', 'paid',    '2025-09-01', '2025-09-01', 'RCP-0015'),
  (10, 10, 250.00, 'monthly', 'overdue', '2025-10-01', NULL, NULL),
  (10, 10, 250.00, 'monthly', 'unpaid',  '2025-11-01', NULL, NULL);

-- Maintenance Requests (12: mixed statuses and dorms)
INSERT INTO maintenance_requests (room_id, student_id, assigned_to, category, description, priority, status, submitted_at, resolved_at) VALUES
  (1,  1,  3, 'Plumbing',    'Leaking faucet in bathroom',                 'high',   'resolved',    '2025-09-05 09:00', '2025-09-06 14:00'),
  (2,  7,  3, 'Electrical',  'Flickering lights in the room',              'medium', 'in_progress', '2025-09-10 11:00', NULL),
  (3,  10, 3, 'Furniture',   'Broken desk chair',                          'low',    'open',        '2025-09-12 08:30', NULL),
  (11, 9,  3, 'Plumbing',    'Shower drain clogged',                       'high',   'resolved',    '2025-09-07 10:00', '2025-09-08 15:00'),
  (12, 3,  3, 'HVAC',        'Air conditioning not working',               'urgent', 'in_progress', '2025-09-15 13:00', NULL),
  (13, 5,  3, 'Electrical',  'Power outlet not functioning',               'medium', 'open',        '2025-09-18 09:30', NULL),
  (21, 2,  3, 'Furniture',   'Wardrobe door hinge broken',                 'low',    'resolved',    '2025-09-08 14:00', '2025-09-10 11:00'),
  (22, 4,  3, 'Plumbing',    'Hot water not available',                    'urgent', 'in_progress', '2025-09-20 07:45', NULL),
  (23, 6,  3, 'General',     'Window latch broken, cannot close properly', 'medium', 'open',        '2025-09-22 16:00', NULL),
  (24, 8,  3, 'Electrical',  'Room has no lighting after 10pm',            'high',   'open',        '2025-09-25 20:00', NULL),
  (1,  1,  3, 'General',     'Ceiling paint peeling',                      'low',    'resolved',    '2025-10-01 10:00', '2025-10-03 09:00'),
  (3,  10, 3, 'HVAC',        'Heater making loud noise',                   'medium', 'open',        '2025-10-05 08:00', NULL);
