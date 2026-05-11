CREATE EXTENSION vector;

-- enums
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'completed');
CREATE TYPE user_type AS ENUM ('chef', 'customer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'deleted');
CREATE TYPE payment_info_status AS ENUM ('active', 'deleted', 'edited');

CREATE TABLE "user" (
    user_id varchar(255) PRIMARY KEY,
    type_of_user user_type NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    address varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    description text,
    profile_pic_file_path varchar(255) NOT NULL
);



CREATE TABLE chef_data (
    chef_id varchar(255) PRIMARY KEY NOT NULL,
    sponsor_score numeric,
    food_specialty varchar(255),
    embedding vector(768),
    FOREIGN KEY (chef_id) REFERENCES "user"(user_id)
);

CREATE TABLE chef_bank_info (
    bank_payment_id int PRIMARY KEY,
    chef_id varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    status payment_info_status NOT NULL DEFAULT 'active',
    account_number varchar(255) NOT NULL,
    routing_number varchar(10) NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES chef_data(chef_id)
);




CREATE TABLE payment_info (
    payment_id int PRIMARY KEY,
    user_id varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    status payment_info_status NOT NULL DEFAULT 'active',
    name_on_card varchar(255) NOT NULL,
    cc_number varchar(255) NOT NULL,
    exp_month smallint NOT NULL,
    exp_year smallint NOT NULL,
    cvc smallint NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "user"(user_id)
);

CREATE TABLE chef_sponsorship (
    sponsorship_id int PRIMARY KEY,
    chef_id varchar(255) NOT NULL,
    price numeric NOT NULL,
    purchase_timestamp timestamp NOT NULL,
    start_date timestamp NOT NULL,
    end_date timestamp NOT NULL,
    payment_info_used_id int NOT NULL,
    FOREIGN KEY (chef_id) REFERENCES chef_data(chef_id),
    FOREIGN KEY (payment_info_used_id) REFERENCES payment_info(payment_id)
);


CREATE TABLE review (
    review_id int PRIMARY KEY,
    num_stars smallint NOT NULL,
    review_content varchar(255) NOT NULL,
    reviewer_id varchar(255) NOT NULL,
    reviewee_id varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    embedding vector(768),
    FOREIGN KEY (reviewer_id) REFERENCES "user"(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES "user"(user_id)
);




CREATE TABLE request (
    request_id int PRIMARY KEY,
    customer_id varchar(255) NOT NULL,
    chef_id varchar(255),
    status request_status NOT NULL DEFAULT 'pending',
    created_at timestamp NOT NULL,
    price numeric NOT NULL,
    commission numeric,
    summary text,
    embedding vector(768),
    FOREIGN KEY (customer_id) REFERENCES "user"(user_id),
    FOREIGN KEY (chef_id) REFERENCES chef_data(chef_id)
);

CREATE TABLE request_ingredient (
    request_id int NOT NULL,
    ingredient_name varchar(255) NOT NULL,
    PRIMARY KEY (request_id, ingredient_name),
    FOREIGN KEY (request_id) REFERENCES request(request_id)
);

CREATE TABLE request_equipment (
    request_id int NOT NULL,
    equipment_name varchar(255) NOT NULL,
    PRIMARY KEY (request_id, equipment_name),
    FOREIGN KEY (request_id) REFERENCES request(request_id)
);

CREATE TABLE chef_monthly_payout (
    payout_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chef_id varchar(255) NOT NULL,
    payout_month date NOT NULL,
    gross_revenue numeric NOT NULL,
    total_commission numeric NOT NULL,
    net_payout numeric NOT NULL,
    request_count int NOT NULL,
    generated_at timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (chef_id) REFERENCES chef_data(chef_id),
    UNIQUE (chef_id, payout_month)
);


-- indexes so that RAG doesnt take forever

CREATE INDEX request_embedding_idx
ON request
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE request;

CREATE INDEX chef_embedding_idx
ON chef_data
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE chef_data;


CREATE INDEX review_embedding_idx
ON review
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

ANALYZE review;





CREATE OR REPLACE VIEW chef AS
SELECT
    u.user_id AS chef_id,
    u.name  AS name,
    u.email AS email,
    u.address AS address,
    u.latitude AS latitude,
    u.longitude AS longitude,
    u.description AS description,
    u.profile_pic_file_path AS profile_pic_file_path,
    c.sponsor_score AS sponsor_score,
    c.food_specialty AS food_specialty
FROM "user" u
JOIN chef_data c
    ON u.user_id = c.chef_id
WHERE u.type_of_user = 'chef';


CREATE OR REPLACE FUNCTION set_commission()
RETURNS TRIGGER AS $$
BEGIN
    NEW.commission := NEW.price * 0.15;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_commission
BEFORE INSERT OR UPDATE OF price
ON request
FOR EACH ROW
EXECUTE FUNCTION set_commission();


CREATE OR REPLACE FUNCTION enforce_chef_user_type()
RETURNS TRIGGER AS $$
DECLARE
    user_type_value user_type;
BEGIN
    SELECT type_of_user
    INTO user_type_value
    FROM "user"
    WHERE user_id = NEW.chef_id;

    IF user_type_value <> 'chef' THEN
        RAISE EXCEPTION 'User % is not a chef (type is %)', NEW.chef_id, user_type_value;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_enforce_chef_user_type
BEFORE INSERT OR UPDATE OF chef_id
ON chef_data
FOR EACH ROW
EXECUTE FUNCTION enforce_chef_user_type();


CREATE OR REPLACE PROCEDURE generate_chef_payouts(IN p_month date)
LANGUAGE plpgsql
AS $$
DECLARE
    month_start date;
    next_month_start date;
BEGIN
    month_start := DATE_TRUNC('month', p_month)::date;
    next_month_start := (month_start + INTERVAL '1 month')::date;

    DELETE FROM chef_monthly_payout
    WHERE payout_month = month_start;

    INSERT INTO chef_monthly_payout (
        chef_id,
        payout_month,
        gross_revenue,
        total_commission,
        net_payout,
        request_count
    )
    SELECT
        r.chef_id,
        month_start,
        COALESCE(SUM(r.price), 0) AS gross_revenue,
        COALESCE(SUM(r.commission), 0) AS total_commission,
        COALESCE(SUM(r.price - r.commission), 0) AS net_payout,
        COUNT(*) AS request_count
    FROM request r
    WHERE r.chef_id IS NOT NULL
      AND r.status IN ('accepted', 'completed')
      AND r.created_at >= month_start
      AND r.created_at < next_month_start
    GROUP BY r.chef_id;
END;
$$;
