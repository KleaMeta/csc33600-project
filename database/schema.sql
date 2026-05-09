-- Customer
CREATE TABLE customer (
    customer_id           VARCHAR(255) NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    address               VARCHAR(255) NOT NULL,
    password              VARCHAR(255) NOT NULL,
    latitude              NUMERIC NOT NULL,
    longitude             NUMERIC NOT NULL,
    profile_pic_file_path VARCHAR(255) NOT NULL,
    PRIMARY KEY (customer_id)
);

-- Chef
CREATE TABLE chef (
    chef_id               VARCHAR(255) NOT NULL,
    name                  VARCHAR(255) NOT NULL,
    email                 VARCHAR(255) NOT NULL,
    address               VARCHAR(255) NOT NULL,
    password              VARCHAR(255) NOT NULL,
    latitude              NUMERIC NOT NULL,
    longitude             NUMERIC NOT NULL,
    profile_pic_file_path VARCHAR(255) NOT NULL,
    PRIMARY KEY (chef_id)
);


-- Customer Payment Info
CREATE TABLE customer_payment_info (
    payment_id    INTEGER NOT NULL,
    customer_id   VARCHAR(255) NOT NULL,
    name_on_card  VARCHAR(255) NOT NULL,
    cc_number     VARCHAR(255) NOT NULL,
    exp_month     SMALLINT NOT NULL,
    exp_year      SMALLINT NOT NULL,
    cvc           SMALLINT NOT NULL,
    PRIMARY KEY (payment_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);


-- Chef Bank Info
CREATE TABLE chef_bank_info (
    bank_payment_id INTEGER NOT NULL,
    chef_id         VARCHAR(255) NOT NULL,
    account_number  VARCHAR(255) NOT NULL,
    routing_number  INTEGER NOT NULL,
    PRIMARY KEY (bank_payment_id),
    FOREIGN KEY (chef_id) REFERENCES chef(chef_id)
);

-- Request
CREATE TABLE request (
    request_id  INTEGER NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    chef_id     VARCHAR(255),
    accepted    BOOLEAN NOT NULL,
    date        TIMESTAMP NOT NULL,
    price       NUMERIC NOT NULL,
    summary     TEXT,
    PRIMARY KEY (request_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (chef_id)     REFERENCES chef(chef_id)
);

-- Request Equipment
CREATE TABLE request_equipment (
    request_id     INTEGER NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (request_id, equipment_name),
    FOREIGN KEY (request_id) REFERENCES request(request_id)
);

-- Request Ingredient
CREATE TABLE request_ingredient (
    request_id      INTEGER NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (request_id, ingredient_name),
    FOREIGN KEY (request_id) REFERENCES request(request_id)
);

-- Sponsor
-- Chefs pay to be ranked higher in listings while their sponsorship window is active.
CREATE TABLE sponsor (
    sponsor_id  INTEGER NOT NULL,
    chef_id     VARCHAR(255) NOT NULL,
    amount_paid NUMERIC NOT NULL,
    start_date  TIMESTAMP NOT NULL,
    end_date    TIMESTAMP NOT NULL,
    PRIMARY KEY (sponsor_id),
    FOREIGN KEY (chef_id) REFERENCES chef(chef_id)
);

-- Review
CREATE TABLE review (
    review_id      INTEGER NOT NULL,
    num_stars      SMALLINT NOT NULL,
    review_content VARCHAR(255) NOT NULL,
    chef_id        VARCHAR(255) NOT NULL,
    customer_id    VARCHAR(255) NOT NULL,
    timestamp      TIMESTAMP NOT NULL,
    PRIMARY KEY (review_id),
    FOREIGN KEY (chef_id)     REFERENCES chef(chef_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);