-- 1. Insert Customers
INSERT INTO customer (customer_id, name, email, address, password, latitude, longitude, profile_pic_file_path) VALUES
('cust_01', 'Alice Waters', 'alice@example.com', '123 Berkeley Way', 'hash_pw_1', 37.8715, -122.2730, 'https://i.pravatar.cc/150?u=cust_01'),
('cust_02', 'David Chang', 'david@momofuku.com', '456 Noodle St', 'hash_pw_2', 40.7128, -74.0060, 'https://i.pravatar.cc/150?u=cust_02'),
('cust_03', 'Julia Child', 'julia@kitchen.org', '789 Butter Blvd', 'hash_pw_3', 42.3601, -71.0589, 'https://i.pravatar.cc/150?u=cust_03');

-- 2. Insert Chefs (mostly NYC, spread across boroughs)
INSERT INTO chef (chef_id, name, email, address, password, latitude, longitude, profile_pic_file_path) VALUES
-- Manhattan
('chef_01', 'Gordon Ramsay',      'gordon@hellskitchen.com',  '742 W 50th St, Manhattan',        'lamb_sauce',    40.7614, -73.9776, 'http://localhost:8000/images/chefs/chef_01.png'),
('chef_02', 'Ina Garten',         'ina@barefoot.com',         '310 W 72nd St, Manhattan',        'easy_is_fine',  40.7794, -73.9822, 'https://i.pravatar.cc/150?u=chef_02'),
('chef_03', 'Marcus Samuelsson',  'marcus@redrooster.com',    '310 Lenox Ave, Harlem',           'harlem_spice',  40.8089, -73.9468, 'https://i.pravatar.cc/150?u=chef_03'),
('chef_04', 'Gabrielle Hamilton', 'gab@prunerestaurant.com',  '54 E 1st St, East Village',       'prune_pw',      40.7252, -73.9876, 'https://i.pravatar.cc/150?u=chef_04'),
-- Brooklyn
('chef_05', 'Missy Robbins',      'missy@lilia.com',          '567 Union Ave, Williamsburg',     'pasta_queen',   40.7131, -73.9510, 'https://i.pravatar.cc/150?u=chef_05'),
('chef_06', 'Peter Luger',        'peter@luger.com',          '178 Broadway, Williamsburg',      'steak_pw',      40.7099, -73.9626, 'https://i.pravatar.cc/150?u=chef_06'),
('chef_07', 'Esther Choi',        'esther@mokbar.com',        '45 Atlantic Ave, Boerum Hill',    'korean_spice',  40.6889, -73.9900, 'https://i.pravatar.cc/150?u=chef_07'),
('chef_08', 'Flynn McGarry',      'flynn@gem.com',            '220 Flatbush Ave, Park Slope',    'gem_pw',        40.6710, -73.9772, 'https://i.pravatar.cc/150?u=chef_08'),
-- Queens
('chef_09', 'Eric Huang',         'eric@pecking.com',         '33-20 Prince St, Flushing',       'duck_pw',       40.7574, -73.8304, 'https://i.pravatar.cc/150?u=chef_09'),
('chef_10', 'King Phojanakong',   'king@kuma.com',            '78-20 Roosevelt Ave, Jackson Hts','kuma_pw',       40.7498, -73.8911, 'https://i.pravatar.cc/150?u=chef_10'),
('chef_11', 'Natalia Pereira',    'natalia@woodside.com',     '55 Skillman Ave, Woodside',       'churrasco_pw',  40.7443, -73.9068, 'https://i.pravatar.cc/150?u=chef_11'),
-- Bronx
('chef_12', 'Roberto Paciullo',   'roberto@roberto.com',      '603 Crescent Ave, Belmont',       'bronx_italian', 40.8548, -73.8880, 'https://i.pravatar.cc/150?u=chef_12'),
('chef_13', 'Pierre Thiam',       'pierre@teranga.com',       '890 Grand Concourse, Bronx',      'senegal_pw',    40.8448, -73.9271, 'https://i.pravatar.cc/150?u=chef_13'),
-- Staten Island
('chef_14', 'Silvia Testa',       'silvia@si.com',            '1 Bay St, St. George',            'si_pasta',      40.6438, -74.0738, 'https://i.pravatar.cc/150?u=chef_14'),
-- Out of town
('chef_15', 'José Andrés',        'jose@thinkfood.com',       '480 7th St NW, Washington DC',    'think_food',    38.8951, -77.0364, 'https://i.pravatar.cc/150?u=chef_15');

-- 3. Insert Customer Payment Info
INSERT INTO customer_payment_info (payment_id, customer_id, name_on_card, cc_number, exp_month, exp_year, cvc) VALUES
(101, 'cust_01', 'Alice Waters', '4111222233334444', 12, 2028, 123),
(102, 'cust_02', 'David Chang',  '5222333344445555', 05, 2027, 456);

-- 4. Insert Chef Bank Info
INSERT INTO chef_bank_info (bank_payment_id, chef_id, account_number, routing_number) VALUES
(501, 'chef_01', '987654321', 123456789),
(502, 'chef_02', '123456789', 987654321);

-- 5. Insert Requests
INSERT INTO request (request_id, customer_id, chef_id, accepted, date, price, summary) VALUES
(1001, 'cust_01', 'chef_01', TRUE,  '2026-05-01 18:00:00', 250.00, 'Beef Wellington for 4 people.'),
(1002, 'cust_02', 'chef_02', FALSE, '2026-05-05 12:00:00', 150.00, 'Roast chicken lunch party.'),
(1003, 'cust_03', 'chef_01', TRUE,  '2026-05-10 19:30:00', 300.00, 'French Omelette masterclass.');

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
(9001, 5, 'The Beef Wellington was perfection. Gordon didn''t even yell at me!', 'chef_01', 'cust_01', '2026-05-01 21:00:00'),
(9002, 4, 'Wonderful chicken, but a bit too much salt for my taste.',             'chef_02', 'cust_02', '2026-05-05 14:00:00');