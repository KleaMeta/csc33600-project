# Project Summary
A two-sided platform where users list kitchen spaces and cooking supplies, and cooks use those resources to provide meal-preparation services, with all bookings, inventory usage, and payments tracked through a relational database.


# Database Schema Overview

This database supports a platform where **customers request cooking services** and **chefs review and accept those requests**. The schema stores user information, locations, payment details, cooking requests, equipment/ingredient requirements, and reviews.

---

# Core User Tables

## Chefs

Stores information about chefs using the platform.

| Column | Type | Description |
|------|------|-------------|
| chef_id | varchar (PK) | Unique identifier for each chef |
| name | varchar | Chef's full name |
| email | varchar | Chef's email address |
| address | varchar | Chef's address |
| password | varchar | Chef account password |

---

## Customers

Stores information about customers requesting services.

| Column | Type | Description |
|------|------|-------------|
| customer_id | varchar (PK) | Unique identifier for each customer |
| name | varchar | Customer's name |
| email | varchar | Customer's email |
| address | varchar | Customer's address |
| password | varchar | Customer account password |

---

# Location Tables

These tables store geographic coordinates for users.

## Chef Location

| Column | Type | Description |
|------|------|-------------|
| chef_id | varchar (PK, FK → chefs) | Chef associated with this location |
| latitude | numeric | Chef latitude |
| longitude | numeric | Chef longitude |

---

## Customer Location

| Column | Type | Description |
|------|------|-------------|
| customer_id | varchar (PK, FK → customers) | Customer associated with this location |
| latitude | numeric | Customer latitude |
| longitude | numeric | Customer longitude |

---

# Payment Information

## Chef Bank Information

Stores bank details for chef payouts.

| Column | Type | Description |
|------|------|-------------|
| bank_payment_id | integer (PK) | Unique payment record ID |
| chef_id | varchar (FK → chefs) | Chef associated with this bank account |
| account_number | varchar | Bank account number |
| routing_number | varchar | Bank routing number |

---

## Customer Payment Information

Stores customer credit card details.

| Column | Type | Description |
|------|------|-------------|
| payment_id | integer (PK) | Unique payment record ID |
| customer_id | varchar (FK → customers) | Customer making payment |
| name_on_card | varchar | Cardholder name |
| cc_number | varchar | Credit card number |
| exp_month | integer | Expiration month |
| exp_year | integer | Expiration year |
| cvc | smallint | Card security code |

---

# Cooking Request System

## Request

Represents a cooking job request between a customer and a chef.

| Column | Type | Description |
|------|------|-------------|
| request_id | integer (PK) | Unique request ID |
| customer_id | varchar (FK → customers) | Customer making request |
| chef_id | varchar (FK → chefs) | Chef assigned to request |
| accepted | boolean | Whether the chef accepted the request |
| date | timestamp | Scheduled date for service |
| price | numeric | Agreed price for service |

---

# Equipment and Ingredients

These tables define the ingredients and euipmeent the customer has available.

## Equipment

| Column | Type | Description |
|------|------|-------------|
| equipment_id | integer (PK) | Equipment ID |
| equipment_name | varchar | Name of kitchen equipment |

---

## Ingredients

| Column | Type | Description |
|------|------|-------------|
| ingredient_id | integer (PK) | Ingredient ID |
| ingredient_name | varchar | Ingredient name |

---

# Request Requirements

Many-to-many relationship tables connecting requests with equipment and ingredients.

## Request Equipment

| Column | Type | Description |
|------|------|-------------|
| request_id | integer (FK → request) | Associated request |
| equipment_id | integer (FK → equipment) | Equipment |

---

## Request Ingredients

| Column | Type | Description |
|------|------|-------------|
| request_id | integer (FK → request) | Associated request |
| ingredient_id | integer (FK → ingredients) | Ingredient |

---

# Review System

The platform allows **mutual reviews between chefs and customers**.

---

## Reviews for Chefs

Customers review chefs after service.

| Column | Type | Description |
|------|------|-------------|
| review_chef_id | integer (PK) | Unique review ID |
| customer_id | varchar (FK → customers) | Customer writing review |
| chef_id | varchar (FK → chefs) | Chef being reviewed |
| num_stars | smallint | Star rating |
| review_content | varchar | Written review |

---

## Reviews for Customers

Chefs review customers after service.

| Column | Type | Description |
|------|------|-------------|
| review_cust_id | integer (PK) | Unique review ID |
| customer_id | varchar (FK → customers) | Customer being reviewed |
| chef_id | varchar (FK → chefs) | Chef writing review |
| num_stars | smallint | Star rating |
| review_content | varchar | Written review |

---

# Relationship Summary

- Customers create cooking requests.
- Chefs can accept or reject requests.
- Requests include ingredients and equipment that the customer has available.
- Customers pay chefs for completed services.
- Both chefs and customers can leave reviews after a job is completed.
- Future: Location data enables proximity-based matching between chefs and customers.