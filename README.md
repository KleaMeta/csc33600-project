# Project Summary
A two-sided platform where users list kitchen spaces and cooking supplies, and cooks use those resources to provide meal-preparation services, with all bookings, inventory usage, and payments tracked through a relational database.


# Database Schema Overview

This database supports a platform where **customers request cooking services** and **chefs review and accept those requests**. The schema stores user information, locations, payment details, cooking requests, equipment/ingredient requirements, and reviews.

---

# Core User Tables

## Customer

Stores information about customers requesting services.

| Column | Type | Description |
|---|---|---|
| customer_id | VARCHAR(255) PK | Unique identifier for each customer |
| name | VARCHAR(255) | Customer's full name |
| email | VARCHAR(255) | Customer's email address |
| address | VARCHAR(255) | Customer's address |
| password | VARCHAR(255) | Customer account password |
| latitude | NUMERIC | Customer's latitude coordinate |
| longitude | NUMERIC | Customer's longitude coordinate |
| profile_pic_file_path | VARCHAR(255) | Path or URL to profile picture |

---

## Chef

Stores information about chefs using the platform.

| Column | Type | Description |
|---|---|---|
| chef_id | VARCHAR(255) PK | Unique identifier for each chef |
| name | VARCHAR(255) | Chef's full name |
| email | VARCHAR(255) | Chef's email address |
| address | VARCHAR(255) | Chef's address |
| password | VARCHAR(255) | Chef account password |
| latitude | NUMERIC | Chef's latitude coordinate |
| longitude | NUMERIC | Chef's longitude coordinate |
| profile_pic_file_path | VARCHAR(255) | Path or URL to profile picture |

---

# Payment Information

## Customer Payment Info

Stores customer credit card details.

| Column | Type | Description |
|---|---|---|
| payment_id | INTEGER PK | Unique payment record ID |
| customer_id | VARCHAR(255) FK → customer | Customer making payment |
| name_on_card | VARCHAR(255) | Cardholder name |
| cc_number | VARCHAR(255) | Credit card number |
| exp_month | SMALLINT | Expiration month |
| exp_year | SMALLINT | Expiration year |
| cvc | SMALLINT | Card security code |

---

## Chef Bank Info

Stores bank details for chef payouts.

| Column | Type | Description |
|---|---|---|
| bank_payment_id | INTEGER PK | Unique payment record ID |
| chef_id | VARCHAR(255) FK → chef | Chef associated with this bank account |
| account_number | VARCHAR(255) | Bank account number |
| routing_number | INTEGER | Bank routing number |

---

# Cooking Request System

## Request

Represents a cooking job request from a customer to a chef.

| Column | Type | Description |
|---|---|---|
| request_id | INTEGER PK | Unique request ID |
| customer_id | VARCHAR(255) FK → customer | Customer making the request |
| chef_id | VARCHAR(255) FK → chef | Chef assigned to the request (nullable until assigned) |
| accepted | BOOLEAN | Whether the chef has accepted the request |
| date | TIMESTAMP | Scheduled date and time for service |
| price | NUMERIC | Agreed price for the service |
| summary | TEXT | Optional description of the request |

---

## Request Equipment

Equipment the customer has available for the request.

| Column | Type | Description |
|---|---|---|
| request_id | INTEGER FK → request | Associated request |
| equipment_name | VARCHAR(255) | Name of the kitchen equipment |

Primary key is `(request_id, equipment_name)`.

---

## Request Ingredient

Ingredients the customer has available for the request.

| Column | Type | Description |
|---|---|---|
| request_id | INTEGER FK → request | Associated request |
| ingredient_name | VARCHAR(255) | Name of the ingredient |

Primary key is `(request_id, ingredient_name)`.

---

# Review System

Customers and chefs can leave reviews after a service is completed.

## Review

| Column | Type | Description |
|---|---|---|
| review_id | INTEGER PK | Unique review ID |
| num_stars | SMALLINT | Star rating |
| review_content | VARCHAR(255) | Written review content |
| chef_id | VARCHAR(255) FK → chef | Chef involved in the reviewed service |
| customer_id | VARCHAR(255) FK → customer | Customer involved in the reviewed service |
| timestamp | TIMESTAMP | When the review was submitted |

---

# Relationship Summary

- Customers create cooking requests specifying a price, date, summary, and the ingredients and equipment they have on hand.
- Chefs can be assigned to and accept requests.
- Both chefs and customers store geographic coordinates enabling proximity-based matching.
- Customers pay chefs for completed services via stored payment info.
- Reviews are left after a job is completed, linked to both the chef and customer involved.

# Key Commands 
- ./reset.sh
  - run from root directory 
  - run whenever you want to refresh the data
  - resets the docker db 
- docker compose up
  - run from root directory 
  - run whenever you start the app
  - starts the docker
- uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  - run from backend/
  - run whenever you start the app
  - starts the backend 
- npm install 
  - run from frontend_files/ 
  - run the first time you run the app on your machine 
  - installs dependencies for frontend 
- npm run dev
  - run from frontend_files/
  - run whenever you run the app 
  - starts the frontend