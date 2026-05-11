# Project Summary

A two-sided marketplace where **customers submit cooking requests** and **chefs accept and fulfill them**.

The system supports:

* Role-based users (chef/customer)
* Request lifecycle tracking
* Payments + sponsorships
* Reviews with semantic embeddings
* Vector-based semantic search using `pgvector`
* Database-enforced integrity via triggers (commission + chef validation)

---

# Database Overview

## Extensions

```sql
CREATE EXTENSION vector;
```

---

## Enums

```sql
request_status: pending | accepted | rejected | expired | completed
user_type: chef | customer
user_status: active | deleted
payment_info_status: active | deleted | edited
```

---

# Core User System

## user

Base table for both chefs and customers.

| Column                | Type            | Notes            |
| --------------------- | --------------- | ---------------- |
| user_id               | varchar(255) PK | Unique ID        |
| type_of_user          | user_type       | chef or customer |
| status                | user_status     | default: active  |
| name                  | varchar(255)    | required         |
| email                 | varchar(255)    | unique           |
| address               | varchar(255)    | required         |
| password_hash         | varchar(255)    | required         |
| latitude              | numeric         | required         |
| longitude             | numeric         | required         |
| description           | text            | optional         |
| profile_pic_file_path | varchar(255)    | required         |

---

# Chef System

## chef_data

Extends `user` for chef-specific metadata.

| Column         | Type                      | Notes               |
| -------------- | ------------------------- | ------------------- |
| chef_id        | varchar(255) PK/FK → user | must be type = chef |
| sponsor_score  | numeric                   | ranking score       |
| food_specialty | varchar(255)              | specialty           |
| embedding      | vector(768)               | semantic search     |

---

## chef (VIEW)

Simplified join for frontend usage.

Includes:

* user identity fields
* location data
* chef metadata (sponsor_score, food_specialty)

---

## Chef Type Enforcement (IMPORTANT)

Enforced via trigger:

```sql
BEFORE INSERT OR UPDATE ON chef_data
```

Rule:

* `chef_data.chef_id` must reference a `user` where `type_of_user = 'chef'`
* Otherwise: exception is thrown

---

# Payments

## payment_info

Stores user payment methods.

| Column       | Type                | Notes                 |
| ------------ | ------------------- | --------------------- |
| payment_id   | int PK              | ID                    |
| user_id      | varchar(255) FK     | owner                 |
| created_at   | timestamp           | required              |
| status       | payment_info_status | active/deleted/edited |
| name_on_card | varchar(255)        | required              |
| cc_number    | varchar(255)        | required              |
| exp_month    | smallint            | required              |
| exp_year     | smallint            | required              |
| cvc          | smallint            | required              |

---

## chef_bank_info

Chef payout information.

| Column          | Type                | Notes          |
| --------------- | ------------------- | -------------- |
| bank_payment_id | int PK              | ID             |
| chef_id         | varchar(255) FK     | chef reference |
| created_at      | timestamp           | required       |
| status          | payment_info_status | default active |
| account_number  | varchar(255)        | required       |
| routing_number  | varchar(10)         | required       |

---

## chef_sponsorship

Paid promotion system for chefs.

| Column               | Type            | Notes          |
| -------------------- | --------------- | -------------- |
| sponsorship_id       | int PK          | ID             |
| chef_id              | varchar(255) FK | chef           |
| price                | numeric         | cost           |
| purchase_timestamp   | timestamp       | when purchased |
| start_date           | timestamp       | start          |
| end_date             | timestamp       | end            |
| payment_info_used_id | int FK          | payment method |

---

# Request System

## request

Core marketplace entity.

| Column      | Type                     | Notes           |
| ----------- | ------------------------ | --------------- |
| request_id  | int PK                   | ID              |
| customer_id | varchar(255) FK          | user            |
| chef_id     | varchar(255) FK nullable | assigned chef   |
| status      | request_status           | default pending |
| created_at  | timestamp                | required        |
| price       | numeric                  | base price      |
| commission  | numeric                  | auto-calculated |
| summary     | text                     | description     |
| embedding   | vector(768)              | semantic search |

---

### Commission Logic (Trigger)

Automatically set on insert/update:

```sql
commission = price * 0.15
```

Trigger:

```sql
BEFORE INSERT OR UPDATE OF price
```

---

## request_ingredient

| Column          | Type         | Notes      |
| --------------- | ------------ | ---------- |
| request_id      | int FK       | request    |
| ingredient_name | varchar(255) | ingredient |

Primary Key: `(request_id, ingredient_name)`

---

## request_equipment

| Column         | Type         | Notes     |
| -------------- | ------------ | --------- |
| request_id     | int FK       | request   |
| equipment_name | varchar(255) | equipment |

Primary Key: `(request_id, equipment_name)`

---

# Review System

## review

User-to-user feedback system.

| Column         | Type            | Notes           |
| -------------- | --------------- | --------------- |
| review_id      | int PK          | ID              |
| num_stars      | smallint        | 1–5             |
| review_content | varchar(255)    | text            |
| reviewer_id    | varchar(255) FK | author          |
| reviewee_id    | varchar(255) FK | target          |
| created_at     | timestamp       | required        |
| embedding      | vector(768)     | semantic search |

---

# Vector Search (pgvector)

Used for semantic retrieval across:

* request.embedding
* chef_data.embedding
* review.embedding

---

## Indexing Strategy

IVFFlat cosine indexes:

```sql
request_embedding_idx
chef_embedding_idx
review_embedding_idx
```

All configured with:

```sql
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100)
```

---

# Key Database Features

### Integrity & Logic Enforcement

* `request_status` lifecycle control
* automatic commission trigger
* chef-type validation trigger
* payment status tracking (`active | deleted | edited`)

---

### Semantic Search (RAG)

Embeddings enable similarity search for:

* chefs
* requests
* reviews

---

### Performance Optimization

* IVFFlat indexes for cosine similarity search
* ANALYZE after index creation for planner optimization

---

# Relationships Summary

* `user` → base entity (chef or customer)
* `chef_data` → extends chef users only (enforced by trigger)
* `request` → connects customer ↔ chef
* `review` → user ↔ user feedback
* `payment_info` → user payment methods
* `chef_bank_info` → chef payouts
* `chef_sponsorship` → paid chef promotion
* `request_*` tables → structured constraints
* vector fields → semantic matching layer

---

# Key Commands

## Reset DB

```bash
./reset.sh
```

Resets Docker DB and reloads schema + data.

---

## Backend

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## Frontend

```bash
npm install
npm run dev
```
