-- 1. Users (Customers)
INSERT INTO "user" (
    user_id, type_of_user, name, email, address,
    password_hash, latitude, longitude, profile_pic_file_path
) VALUES
('cust_01', 'customer', 'Alice Waters', 'alice@example.com', '123 Berkeley Way',
 'hash_pw_1', 37.8715, -122.2730, 'https://i.pravatar.cc/150?u=cust_01'),

('cust_02', 'customer', 'David Chang', 'david@momofuku.com', '456 Noodle St',
 'hash_pw_2', 40.7128, -74.0060, 'https://i.pravatar.cc/150?u=cust_02'),

('cust_03', 'customer', 'Julia Child', 'julia@kitchen.org', '789 Butter Blvd',
 'hash_pw_3', 42.3601, -71.0589, 'https://i.pravatar.cc/150?u=cust_03');

-- 1b. Admin user
INSERT INTO "user" (
    user_id, type_of_user, name, email, address,
    password_hash, latitude, longitude, profile_pic_file_path
) VALUES
('admin_01', 'admin', 'Admin User', 'admin', 'Platform HQ',
 'pass', 40.7128, -74.0060, 'https://i.pravatar.cc/150?u=admin_01');


-- 2. Users (Chefs)
INSERT INTO "user" (
    user_id, type_of_user, name, email, address,
    password_hash, latitude, longitude, profile_pic_file_path, description
) VALUES
('chef_01', 'chef', 'Gordon Ramsay', 'gordon@hellskitchen.com', '742 W 50th St, Manhattan',
 'lamb_sauce', 40.7614, -73.9776, 'http://localhost:8000/images/chefs/chef_01.png',
 'High intensity fine dining chef'),

('chef_02', 'chef', 'Ina Garten', 'ina@barefoot.com', '310 W 72nd St, Manhattan',
 'easy_is_fine', 40.7794, -73.9822, 'https://i.pravatar.cc/150?u=chef_02',
 'Simple elegant home cooking'),

('chef_03', 'chef', 'Marcus Samuelsson', 'marcus@redrooster.com', '310 Lenox Ave, Harlem',
 'harlem_spice', 40.8089, -73.9468, 'https://i.pravatar.cc/150?u=chef_03',
 'Harlem inspired cuisine'),

('chef_05', 'chef', 'Missy Robbins', 'missy@lilia.com', '567 Union Ave, Williamsburg',
 'pasta_queen', 40.7131, -73.9510, 'https://i.pravatar.cc/150?u=chef_05',
 'Pasta specialist'),

('chef_09', 'chef', 'Eric Huang', 'eric@pecking.com', '33-20 Prince St, Flushing',
 'duck_pw', 40.7574, -73.8304, 'https://i.pravatar.cc/150?u=chef_09',
 'Peking duck expert'),

('chef_15', 'chef', 'José Andrés', 'jose@thinkfood.com', '480 7th St NW, Washington DC',
 'think_food', 38.8951, -77.0364, 'https://i.pravatar.cc/150?u=chef_15',
 'Humanitarian chef');


-- 3. Chef Data (FIXED: chef_data instead of chef)
INSERT INTO chef_data (chef_id, sponsor_score, food_specialty) VALUES
('chef_01', 9.8, 'British Fine Dining'),
('chef_02', 9.2, 'Comfort Food'),
('chef_03', 9.5, 'African Fusion'),
('chef_05', 9.3, 'Italian'),
('chef_09', 8.9, 'Chinese'),
('chef_15', 10.0, 'Spanish Tapas');


-- 4. Payment Info (FIXED: added created_at)
INSERT INTO payment_info (
    payment_id, user_id, created_at, name_on_card, cc_number, exp_month, exp_year, cvc
) VALUES
(101, 'cust_01', '2026-05-01 10:00:00', 'Alice Waters', '4111222233334444', 12, 2028, 123),
(102, 'cust_02', '2026-05-02 11:00:00', 'David Chang', '5222333344445555', 5, 2027, 456),
(103, 'cust_03', '2025-11-02 09:15:00', 'Julia Child', '4333444455556666', 10, 2029, 321),
(104, 'chef_01', '2025-12-18 08:45:00', 'Gordon Ramsay', '4777888899990000', 7, 2028, 555),
(105, 'chef_03', '2025-11-09 14:20:00', 'Marcus Samuelsson', '5444333322221111', 9, 2027, 246),
(106, 'chef_05', '2026-02-01 12:10:00', 'Missy Robbins', '4012888899991111', 4, 2029, 642),
(107, 'chef_09', '2026-04-16 17:30:00', 'Eric Huang', '5105105105105100', 8, 2028, 369),
(108, 'chef_15', '2026-02-10 11:05:00', 'Jose Andres', '6011888811110000', 1, 2030, 753);


-- 5. Chef Bank Info (FIXED: added created_at)
INSERT INTO chef_bank_info (
    bank_payment_id, chef_id, created_at, account_number, routing_number
) VALUES
(501, 'chef_01', '2026-05-01 09:00:00', '987654321', '123456789'),
(502, 'chef_02', '2026-05-02 09:00:00', '123456789', '987654321');


-- 6. Chef Sponsorship (FIXED: added purchase_timestamp)
INSERT INTO chef_sponsorship (
    sponsorship_id, chef_id, price, purchase_timestamp, start_date, end_date, payment_info_used_id
) VALUES
(701, 'chef_05', 199.00, '2026-01-01 12:00:00', '2026-01-01', '2027-01-01', 101),
(702, 'chef_09', 149.00, '2026-03-15 12:00:00', '2026-03-15', '2026-09-15', 102),
(703, 'chef_03', 129.00, '2025-11-10 10:00:00', '2025-11-10', '2026-05-10', 105),
(704, 'chef_01', 249.00, '2025-12-20 15:30:00', '2025-12-20', '2026-12-20', 104),
(705, 'chef_15', 179.00, '2026-02-12 09:45:00', '2026-02-12', '2026-08-12', 108),
(706, 'chef_09', 159.00, '2026-04-18 11:25:00', '2026-04-18', '2026-10-18', 107),
(707, 'chef_05', 219.00, '2026-05-03 13:05:00', '2026-05-03', '2026-11-03', 106);


-- 7. Requests
INSERT INTO request (
    request_id, customer_id, chef_id, status, created_at, price, commission, summary
) VALUES
(1001, 'cust_01', 'chef_01', 'accepted', '2026-05-01 18:00:00', 250.00, 25.00, 'Beef Wellington for 4 people.'),
(1002, 'cust_02', NULL, 'pending', '2026-05-05 12:00:00', 150.00, 15.00, 'Roast chicken lunch party.'),
(1003, 'cust_03', 'chef_01', 'accepted', '2026-05-10 19:30:00', 300.00, 30.00, 'French Omelette masterclass.'),
(1004, 'cust_01', 'chef_02', 'completed', '2025-11-12 17:00:00', 180.00, 27.00, 'Family-style comfort dinner for six.'),
(1005, 'cust_02', 'chef_03', 'accepted', '2025-12-05 19:00:00', 220.00, 33.00, 'Harlem fusion tasting menu.'),
(1006, 'cust_03', 'chef_05', 'completed', '2026-01-08 18:30:00', 340.00, 51.00, 'Fresh pasta workshop and dinner.'),
(1007, 'cust_01', 'chef_09', 'completed', '2026-02-14 20:00:00', 275.00, 41.25, 'Lunar New Year banquet at home.'),
(1008, 'cust_02', 'chef_15', 'accepted', '2026-03-09 18:15:00', 410.00, 61.50, 'Spanish tapas event with paella.'),
(1009, 'cust_03', 'chef_03', 'completed', '2026-03-21 12:30:00', 195.00, 29.25, 'Weekend brunch with African-inspired dishes.'),
(1010, 'cust_01', 'chef_02', 'accepted', '2026-04-02 19:45:00', 260.00, 39.00, 'Cozy spring dinner and dessert spread.'),
(1011, 'cust_02', 'chef_05', 'completed', '2026-04-20 18:40:00', 355.00, 53.25, 'Private pasta and wine pairing night.'),
(1012, 'cust_03', 'chef_15', 'completed', '2026-05-06 18:50:00', 500.00, 75.00, 'Large birthday dinner with tapas stations.'),
(1013, 'cust_01', 'chef_01', 'accepted', '2026-05-08 18:10:00', 285.00, 42.75, 'Steakhouse-style dinner at home.'),
(1014, 'cust_02', NULL, 'pending', '2026-05-09 10:30:00', 165.00, 24.75, 'Weeknight meal prep for five days.');


-- 8. Request Equipment
INSERT INTO request_equipment (request_id, equipment_name) VALUES
(1001, 'Rolling Pin'),
(1001, 'Pastry Brush'),
(1003, 'Copper Skillet'),
(1004, 'Dutch Oven'),
(1005, 'Cast Iron Pan'),
(1006, 'Pasta Machine'),
(1007, 'Wok'),
(1008, 'Paella Pan'),
(1009, 'Blender'),
(1010, 'Sheet Pan'),
(1011, 'Stand Mixer'),
(1012, 'Serving Trays'),
(1013, 'Meat Thermometer');


-- 9. Request Ingredients
INSERT INTO request_ingredient (request_id, ingredient_name) VALUES
(1001, 'Beef Tenderloin'),
(1001, 'Puff Pastry'),
(1003, 'Farm Fresh Eggs'),
(1003, 'Unsalted Butter'),
(1004, 'Heritage Chicken'),
(1005, 'Harissa'),
(1006, '00 Flour'),
(1007, 'Duck'),
(1008, 'Saffron'),
(1009, 'Plantains'),
(1010, 'Asparagus'),
(1011, 'Ricotta'),
(1012, 'Chorizo'),
(1013, 'Ribeye');


-- 10. Reviews
INSERT INTO review (
    review_id, num_stars, review_content, reviewer_id, reviewee_id, created_at
) VALUES
(9001, 5, 'The Beef Wellington was perfection.', 'cust_01', 'chef_01', '2026-05-01 21:00:00'),
(9002, 4, 'Great food but slightly salty.', 'cust_02', 'chef_01', '2026-05-05 14:00:00');
