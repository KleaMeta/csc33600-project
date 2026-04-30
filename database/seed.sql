BEGIN;

-- 1. Insert Customers
INSERT INTO customer (customer_id, name, email, address, password, latitude, longitude, profile_pic_file_path) VALUES
('cust_01', 'Alice Waters', 'alice@example.com', '123 Berkeley Way', 'hash_pw_1', 37.8715, -122.2730, '/images/alice.jpg'),
('cust_02', 'David Chang', 'david@momofuku.com', '456 Noodle St', 'hash_pw_2', 40.7128, -74.0060, '/images/david.jpg'),
('cust_03', 'Julia Child', 'julia@kitchen.org', '789 Butter Blvd', 'hash_pw_3', 42.3601, -71.0589, '/images/julia.jpg');

-- 2. Insert Chefs
INSERT INTO chef (chef_id, name, email, address, password, latitude, longitude, profile_pic_file_path) VALUES
('chef_01', 'Gordon Ramsay', 'gordon@hellskitchen.com', '10 Downing St', 'lamb_sauce', 51.5033, -0.1276, '/chefs/gordon.png'),
('chef_02', 'Ina Garten', 'ina@barefoot.com', '22 Hamptons Lane', 'easy_is_fine', 40.9634, -72.1848, '/chefs/ina.png');

-- 3. Insert Customer Payment Info
INSERT INTO customer_payment_info (payment_id, customer_id, name_on_card, cc_number, exp_month, exp_year, cvc) VALUES
(101, 'cust_01', 'Alice Waters', '4111222233334444', 12, 2028, 123),
(102, 'cust_02', 'David Chang', '5222333344445555', 05, 2027, 456);

-- 4. Insert Chef Bank Info
INSERT INTO chef_bank_info (bank_payment_id, chef_id, account_number, routing_number) VALUES
(501, 'chef_01', '987654321', 123456789),
(502, 'chef_02', '123456789', 987654321);

-- 5. Insert Requests
INSERT INTO request (request_id, customer_id, chef_id, accepted, date, price, summary) VALUES
(1001, 'cust_01', 'chef_01', TRUE, '2026-05-01 18:00:00', 250.00, 'Beef Wellington for 4 people.'),
(1002, 'cust_02', 'chef_02', FALSE, '2026-05-05 12:00:00', 150.00, 'Roast chicken lunch party.'),
(1003, 'cust_03', 'chef_01', TRUE, '2026-05-10 19:30:00', 300.00, 'French Omelette masterclass.');

-- 6. Insert Request Equipment
INSERT INTO request_equipment (request_id, equipment_name) VALUES
(1001, 'Rolling Pin'),
(1001, 'Pastry Brush'),
(1003, 'Copper Skillet');

-- 7. Insert Request Ingredients
INSERT INTO request_ingredient (request_id, ingredient_name) VALUES
(1001, 'Beef Tenderloin'),
(1001, 'Puff Pastry'),
(1003, 'Farm Fresh Eggs'),
(1003, 'Unsalted Butter');

-- 8. Insert Reviews
INSERT INTO review (review_id, num_stars, review_content, chef_id, customer_id, timestamp) VALUES
(9001, 5, 'The Beef Wellington was perfection. Gordon didn’t even yell at me!', 'chef_01', 'cust_01', '2026-05-01 21:00:00'),
(9002, 4, 'Wonderful chicken, but a bit too much salt for my taste.', 'chef_02', 'cust_02', '2026-05-05 14:00:00');

COMMIT;