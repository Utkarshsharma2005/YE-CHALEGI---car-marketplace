# The Motor Gazette — Vintage Classifieds Backend Service

Welcome to the backend server repository for **The Motor Gazette**, a vintage-inspired used cars marketplace that combines the styling of historic broadsheet print classifieds with modern dealer administration capabilities. 

This repository houses the complete backend system, comprising a Containerized MongoDB database service, an Express.js/Node.js REST API application layer, auto-incrementing lot number controllers, data validation systems, database seeding scripts, and integration testing verification frameworks.

---

## 1. Project Purpose & Architecture

The primary goal of this application is to serve as the backend data engine for a used cars marketplace. It provides full Create, Read, Update, and Delete (CRUD) routing over marketplace listings while implementing a vintage newspaper aesthetic where each car is represented as a sequential **Classified Auction Lot Ticket** rather than a typical modern software card.

### System Architecture
The backend uses a decoupled, three-tier architecture:
1. **Infrastructure Layer**: Containerized MongoDB database orchestration via Docker Compose.
2. **Data Access/Model Layer**: Mongoose schemas enforcing structured constraints, type validation, and pre-save sequential triggers.
3. **Application Routing Layer**: Express HTTP controllers parsing inputs, running validation filters, and managing RESTful resource access.

```
                  ┌─────────────────────────────────┐
                  │        HTTP Client Request      │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │    Express API Router & CORS    │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │      Request Validator Layer    │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │    Mongoose Pre-Save Lot Hook   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │      MongoDB Database Engine    │
                  └─────────────────────────────────┘
```

---

## 2. Technical Design Decisions

### A. Atomic Auto-Incrementing Lot Numbers (`lotNumber`)
Traditional relational databases (like PostgreSQL) support auto-incrementing serial primary keys out of the box, whereas document stores (like MongoDB) do not. To replicate the broadsheet listing system (e.g. `LOT 001`, `LOT 002`), we designed an atomic sequence generator:
- A dedicated `Counter` collection tracks current sequence values for distinct entities.
- A Mongoose **pre-save middleware hook** intercepts new car creations.
- It performs an atomic `findOneAndUpdate` operation with `$inc` on the sequence count.
- This guarantees sequence uniqueness and prevents race conditions under high concurrent insertion volumes.

### B. Dual-Identifier Routing
To maximize endpoint flexibility, controllers on detail endpoints (`GET`, `PUT`, `DELETE /api/cars/:id`) dynamically parse the parameters:
1. First, the parameter is validated as a potential **24-character hexadecimal MongoDB ObjectId** using `mongoose.Types.ObjectId.isValid()`.
2. If the check passes, the query targets the database record by `_id`.
3. If it fails, the query treats the input as an integer **Lot Number** (`lotNumber`), querying the records sequentially.
This design supports both typical system integrations (`/api/cars/60d5ec40f8...`) and clean, reader-friendly URLs (`/api/cars/3` for Lot 3).

### C. Validation Guardrails
A modular validation helper checks input payloads before they ever hit the database. It sanitizes inputs, enforces data type constraints (e.g. price and year must be positive numeric values), and returns explicit, structured JSON lists of all schema violations to the client on failure (HTTP `400 Bad Request`).

---

## 3. Database Schema

The database contains two collections: `counters` and `cars`.

### Car Model Schema (`cars`)
| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated | Unique database document identifier |
| `company` | String | Required, trimmed | Manufacturer name (e.g. "Premier") |
| `model` | String | Required, trimmed | Car model name (e.g. "Padmini Delux") |
| `price` | Number | Required, non-negative | Price of the listing in INR |
| `year` | Number | Required, Range: 1886 - Current+1 | Manufacturing year |
| `fuelType` | String | Required, trimmed | Fuel category (e.g. Petrol, Diesel, Electric) |
| `transmission` | String | Required, trimmed | Shift style (e.g. Manual, Automatic) |
| `kmDriven` | Number | Required, non-negative | Mileage count in kilometers |
| `imageUrl` | String | Required, trimmed | Link path to public image assets |
| `description` | String | Required, trimmed | High-level classified lot text description |
| `status` | String | Enum: `["available", "sold"]` | Inventory status (Default: `"available"`) |
| `lotNumber` | Number | Unique, auto-generated | Sequential classified publication catalog index |
| `createdAt` | Date | Default: `Date.now()` | Creation timestamp |

---

## 4. REST API Endpoint Catalog

All routes are prefixed with `/api/cars`.

### 1. Retrieve All Listings
* **Endpoint**: `GET /api/cars`
* **Response Code**: `200 OK`
* **Output Format**: Array of car documents, sorted chronologically with the newest listings first.

### 2. Retrieve Specific Listing
* **Endpoint**: `GET /api/cars/:id`
* **Parameters**: `:id` can be either the MongoDB Hexadecimal ObjectId or the integer `lotNumber`.
* **Response Codes**:
  - `200 OK` on success.
  - `404 Not Found` if the listing does not exist.
  - `400 Bad Request` if the `:id` parameter format is invalid.

### 3. Create a New Listing
* **Endpoint**: `POST /api/cars`
* **Request Header**: `Content-Type: application/json`
* **Body parameters**:
```json
{
  "company": "Standard",
  "model": "Vanguard",
  "price": 295000,
  "year": 1952,
  "fuelType": "Petrol",
  "transmission": "Manual",
  "kmDriven": 80000,
  "imageUrl": "https://images.unsplash.com/photo-1542282088-fe8426682b8f",
  "description": "Elegant post-war vintage cruiser."
}
```
* **Response Codes**:
  - `201 Created` returns the saved document with auto-assigned `lotNumber`.
  - `400 Bad Request` returns a JSON list of validation error strings.

### 4. Update an Existing Listing
* **Endpoint**: `PUT /api/cars/:id`
* **Parameters**: `:id` (ObjectId or `lotNumber`).
* **Body parameters**: Partial payload containing any valid fields to update.
* **Response Codes**:
  - `200 OK` returns the updated document.
  - `404 Not Found` if the resource does not exist.
  - `400 Bad Request` if parameter or payload types fail validation.

### 5. Delete a Listing
* **Endpoint**: `DELETE /api/cars/:id`
* **Parameters**: `:id` (ObjectId or `lotNumber`).
* **Response Codes**:
  - `200 OK` returns confirmation string.
  - `404 Not Found` if the listing does not exist.

---

## 5. Local Setup & Execution Guide

### Prerequisites
Ensure you have the following installed on your machine:
- Node.js (version 20+ or latest LTS)
- npm (Node Package Manager)
- Docker and Docker Compose

### Step 1: Clone and Infrastructure Boot
Clone this repository to your workspace and start the MongoDB database container:
```bash
# Boot the containerized MongoDB service
docker compose up -d

# Verify MongoDB is running on port 27017
docker ps
```

### Step 2: Install Server Dependencies
Navigate to the `/server` subdirectory and install the required modules:
```bash
cd server
npm install
```

### Step 3: Configure Environment
Create a copy of `.env.example` as `.env` and adjust the variables if needed (the defaults match local settings):
```bash
cp .env.example .env
```

### Step 4: Seed the Database
Run the seed script to wipe any stale data, initialize the sequence counters, and populate the database with 12 mock classified car lots:
```bash
npm run seed
```

### Step 5: Start the Development Server
Launch the Express application:
```bash
# Runs the server with Nodemon watcher active
npm run dev
```
The server will start up and listen for requests at `http://localhost:5000`.

---

## 6. Verification and Testing

We have built a dedicated end-to-end integration test runner script that tests the API server against its core routes.

To run the integration verification test suite:
1. Ensure the Express server is running (`npm run dev`).
2. Run the test runner script using:
```bash
node ../.gemini/antigravity-ide/brain/d3f1b638-50a8-4854-b951-77913a62b5cd/scratch/test_endpoints.js
```
The script will perform a full suite of API requests (querying listings, fetching by ID/Lot, creating Lot 13, updating values, deleting, and verifying 404 handler states) and output execution results.
