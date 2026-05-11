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
(102, 'cust_02', '2026-05-02 11:00:00', 'David Chang', '5222333344445555', 5, 2027, 456);


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
(702, 'chef_09', 149.00, '2026-03-15 12:00:00', '2026-03-15', '2026-09-15', 102);


-- 7. Requests
INSERT INTO request (
    request_id, customer_id, chef_id, status, created_at, price, commission, summary
) VALUES
(1001, 'cust_01', 'chef_01', 'accepted', '2026-05-01 18:00:00', 250.00, 25.00, 'Beef Wellington for 4 people.'),
(1002, 'cust_02', NULL, 'pending', '2026-05-05 12:00:00', 150.00, 15.00, 'Roast chicken lunch party.'),
(1003, 'cust_03', 'chef_01', 'accepted', '2026-05-10 19:30:00', 300.00, 30.00, 'French Omelette masterclass.');


-- 8. Request Equipment
INSERT INTO request_equipment (request_id, equipment_name) VALUES
(1001, 'Rolling Pin'),
(1001, 'Pastry Brush'),
(1003, 'Copper Skillet');


-- 9. Request Ingredients
INSERT INTO request_ingredient (request_id, ingredient_name) VALUES
(1001, 'Beef Tenderloin'),
(1001, 'Puff Pastry'),
(1003, 'Farm Fresh Eggs'),
(1003, 'Unsalted Butter');


-- 10. Reviews
INSERT INTO review (
    review_id, num_stars, review_content, reviewer_id, reviewee_id, created_at
) VALUES
(9001, 5, 'The Beef Wellington was perfection.', 'cust_01', 'chef_01', '2026-05-01 21:00:00'),
(9002, 4, 'Great food but slightly salty.', 'cust_02', 'chef_01', '2026-05-05 14:00:00');