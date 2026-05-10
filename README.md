# Project Summary

A two-sided marketplace where **customers submit cooking requests** and **chefs accept and fulfill them**. The system tracks users, chef-specific metadata, requests with structured requirements, payments, reviews, and supports semantic search using vector embeddings (`pgvector`).

---

# Database Schema Overview

This schema is centered around a unified `user` table with role-based extension for chefs, along with request, payment, and review workflows.

It also includes:

* Geolocation-based matching
* Vector embeddings for RAG/search
* Request status lifecycle tracking
* Automatic commission calculation via trigger

---

# Core User System

## user

Stores both chefs and customers (distinguished by `type_of_user`).

| Column                | Type                | Description                 |
| --------------------- | ------------------- | --------------------------- |
| user_id               | VARCHAR(255) PK     | Unique user identifier      |
| type_of_user          | user_type           | Either `chef` or `customer` |
| name                  | VARCHAR(255)        | Full name                   |
| email                 | VARCHAR(255) UNIQUE | Email address               |
| address               | VARCHAR(255)        | Physical address            |
| password_hash         | VARCHAR(255)        | Hashed password             |
| latitude              | NUMERIC             | User latitude               |
| longitude             | NUMERIC             | User longitude              |
| description           | TEXT                | Optional bio/description    |
| profile_pic_file_path | VARCHAR(255)        | Profile image path          |

---

## chef_data

Extension table for chef-specific attributes.

| Column         | Type                      | Description                   |
| -------------- | ------------------------- | ----------------------------- |
| chef_id        | VARCHAR(255) PK/FK → user | Chef user reference           |
| sponsor_score  | NUMERIC                   | Sponsorship ranking score     |
| food_specialty | VARCHAR(255)              | Culinary specialty            |
| embedding      | VECTOR(768)               | Semantic embedding for search |

---

It’s missing from your rewritten README because it got dropped in the rewrite, not because it’s gone from the schema.

From your actual schema, the table is:

---

## chef_sponsorship

Tracks paid sponsorships for chefs that pay to show up higher in search rankings.

| Column               | Type                        | Description           |
| -------------------- | --------------------------- | --------------------- |
| sponsorship_id       | NUMERIC PK                  | Unique sponsorship ID |
| chef_id              | VARCHAR(255) FK → chef_data | Sponsored chef        |
| price                | NUMERIC                     | Sponsorship cost      |
| start_date           | DATE                        | Sponsorship start     |
| end_date             | DATE                        | Sponsorship end       |
| payment_info_used_id | INT FK → payment_info       | Payment method used   |

---

## chef (VIEW)

View joining `user` + `chef_data` to make front-end querying easier.

Exposes:

* identity fields (name, email, address)
* location fields
* chef metadata (sponsor_score, food_specialty)

---

# Payments

## payment_info

Stores customer payment methods and chef payment methods for when they are purchasing sponsorship.

| Column       | Type                   | Description       |
| ------------ | ---------------------- | ----------------- |
| payment_id   | INT PK                 | Payment record ID |
| user_id      | VARCHAR(255) FK → user | Owner of card     |
| name_on_card | VARCHAR(255)           | Cardholder name   |
| cc_number    | VARCHAR(255)           | Card number       |
| exp_month    | SMALLINT               | Expiration month  |
| exp_year     | SMALLINT               | Expiration year   |
| cvc          | SMALLINT               | Security code     |

---

## chef_bank_info

Stores chef payout banking details.

| Column          | Type                        | Description    |
| --------------- | --------------------------- | -------------- |
| bank_payment_id | INT PK                      | Bank record ID |
| chef_id         | VARCHAR(255) FK → chef_data | Chef reference |
| account_number  | VARCHAR(255)                | Bank account   |
| routing_number  | VARCHAR(10)                 | Routing number |

---

# Requests System

## request

Core service request entity.

| Column      | Type                        | Description                                                                 |
| ----------- | --------------------------- | --------------------------------------------------------------------------- |
| request_id  | INT PK                      | Request ID                                                                  |
| customer_id | VARCHAR(255) FK → user      | Requesting customer                                                         |
| chef_id     | VARCHAR(255) FK → chef_data | Assigned chef (nullable)                                                    |
| status      | request_status              | Lifecycle state (`pending`, `accepted`, `rejected`, `expired`, `completed`) |
| created_at  | TIMESTAMP                   | Creation timestamp                                                          |
| price       | NUMERIC                     | Base price                                                                  |
| commission  | NUMERIC                     | Auto-calculated (15%)                                                       |
| summary     | TEXT                        | Request description                                                         |
| embedding   | VECTOR(768)                 | Semantic representation                                                     |

### Commission Logic

Automatically computed via trigger:

```sql
commission = price * 0.15
```

---

## request_ingredient

Ingredients provided or required for a request.

| Column          | Type             | Description       |
| --------------- | ---------------- | ----------------- |
| request_id      | INT FK → request | Request reference |
| ingredient_name | VARCHAR(255)     | Ingredient name   |

Primary key: `(request_id, ingredient_name)`

---

## request_equipment

Kitchen equipment associated with a request.

| Column         | Type             | Description       |
| -------------- | ---------------- | ----------------- |
| request_id     | INT FK → request | Request reference |
| equipment_name | VARCHAR(255)     | Equipment name    |

Primary key: `(request_id, equipment_name)`

---

# Review System

## review

Stores feedback between users (customer ↔ chef and chef -> customer).

| Column         | Type                   | Description        |
| -------------- | ---------------------- | ------------------ |
| review_id      | INT PK                 | Review ID          |
| num_stars      | SMALLINT               | Rating (1–5)       |
| review_content | VARCHAR(255)           | Review text        |
| reviewer_id    | VARCHAR(255) FK → user | Author of review   |
| reviewee_id    | VARCHAR(255) FK → user | Target of review   |
| created_at     | TIMESTAMP              | Timestamp          |
| embedding      | VECTOR(768)            | Semantic embedding |

---

# Vector Search (RAG Support)

The system uses `pgvector` for semantic retrieval across:

* request.embedding
* chef_data.embedding
* review.embedding

### Indexing Strategy

IVFFlat indexes with cosine similarity:

* request_embedding_idx
* chef_embedding_idx
* review_embedding_idx

Each uses:

```sql
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100)
```

---

# Relationships Summary

* `user` is the base entity for both chefs and customers
* `chef_data` extends users with chef-specific metadata
* `request` connects customers → chefs with status tracking
* `request_ingredient` and `request_equipment` define constraints/resources per request
* `payment_info` supports customer transactions
* `chef_bank_info` supports payouts to chefs
* `review` connects any two users (chef/customer)
* `chef_sponsorship` entries are linked to a chef and payment method
* Payment is tied back to `payment_info`


* embeddings enable semantic matching across requests, chefs, and reviews

---

# Key Database Features

* Request lifecycle via `request_status` enum
* Automatic commission calculation via trigger
* Vector embeddings for semantic search (RAG)
* Efficient similarity search via IVFFlat indexes
* Chef view for easier querying

---

# Key Commands

* `./reset.sh`

  * Resets Docker DB and reloads schema/data. Use whenever you want to start or reload the database.

* `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

  * Starts backend server

* `npm install`

  * Installs frontend dependencies

* `npm run dev`

  * Starts frontend development server
