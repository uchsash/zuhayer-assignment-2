# Vehicle Rental System API
A robust, backend-driven vehicle rental management system built with Node.js, Express, and PostgreSQL. This system manages role-based access for admins and customers, featuring automated booking cleanup and race-condition prevention during rentals.
- Live URL: [https://assignment-2-five-beryl.vercel.app](https://assignment-2-five-beryl.vercel.app/)
___
## Features
-	Role-Based Access Control (RBAC): Distinct permissions for Admin (manage customers and vehicles, view all bookings) and Customer (book vehicles, view personal history etc).
-	Atomic Booking Logic: Prevents double-booking of the same vehicle tactfully.
-	Automatic Expiry System: A helper utility that dynamically updates expired "active" bookings to "returned" status and frees up vehicles during GET requests.
-	Safe Deletion: Users and Vehicles can only be deleted if they have no current "active" bookings to ensure data integrity.
-	Dynamic Price Calculation: Automatically calculates the total_price based on the number of days between the start and end dates.
-	Secure Authentication: Password hashing using bcrypt and secure sessions via JWT (JSON Web Tokens).
___
## Technology Stack
-	Runtime: Node.js
-	Language: TypeScript
-	Framework: Express.js
-	Database: PostgreSQL (Neon DB)
-	Authentication: JWT & Bcrypt
-	Deployment: Vercel
___
## Setup & Usage Instructions
### 1. Prerequisites
  -	Node.js (v18 or higher)
  -	PostgreSQL database instance
### 2. Installation
Clone the repository and install dependencies:
```
git clone https://github.com/uchsash/zuhayer-assignment-2
cd zuhayer-assignment-2
npm install
```
### 3. Environment Configuration
Create a .env file in the root directory and add the following:

    - PORT=5000
    - DATABASE_URL= postgres://username:password@hostname:port/database
    - JWT_SECRET=jwt_secret_key

### 4. Database Initialization
The project includes an <kbd>initDB</kbd> utility that creates all necessary tables (users, vehicles, bookings) and constraints automatically on the first run.
### 5. Running the Project
Development Mode:
Bash
```
npm run dev
```
Production Build:
Bash
```
npm run build
npm start
```
### 6. API Endpoints
**Authentication**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Register a new user account | Public |
| `POST` | `/api/v1/auth/signin` | Login and receive a JWT access token | Public |

**Users**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | Get a list of all registered users | Admin |
| `PUT` | `/api/v1/users/:userId` | Update user information | Admin/Owner |
| `DELETE` | `/api/v1/users/:userId` | Delete user (Only if no active bookings exist) | Admin |

**Vehicles**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/vehicles` | Get all vehicles | Public |
| `GET` | `/api/v1/vehicles/:vehicleId` | Get details of a single vehicle | Public |
| `POST` | `/api/v1/vehicles` | Add a new vehicle to the fleet | Admin |
| `PUT` | `/api/v1/vehicles/:vehicleId` | Update vehicle details or availability | Admin |
| `DELETE` | `/api/v1/vehicles/:vehicleId` | Remove a vehicle from the system (Only if no active bookings exist) | Admin |

**Bookings**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | Create a booking (Prevents double-booking) | Customer/Admin |
| `GET` | `/api/v1/bookings` | Get all bookings (Admin) or personal history (Customer) | Authenticated |
| `PUT` | `/api/v1/bookings/:bookingId` | Cancel before booking date (Owner) or Mark as Returned (Admin) | Owner/Admin |
