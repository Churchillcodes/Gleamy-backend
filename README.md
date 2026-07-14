# Gleamy Baby Cots & Furniture Backend

Backend API for the Gleamy Baby Cots & Furniture Management System.

This backend powers the business operations behind the Gleamy platform by providing secure APIs for authentication, product management, inventory tracking, sales analytics, image management, and administrator operations.

---

## Overview

Gleamy Baby Cots & Furniture is a furniture manufacturing and retail business specializing in custom furniture and baby furniture products.

This system was developed to digitize business operations that were previously managed manually and provide a scalable foundation for future growth.

---

## Core Business Objectives

The platform enables the business to:

* Manage product catalogues
* Track inventory levels
* Monitor sales performance
* Upload and manage product images
* Generate business insights
* Secure administrative access
* Maintain accurate stock records

---

## Features

### Authentication & Authorization

* User Registration
* User Login
* JWT Access Tokens
* JWT Refresh Tokens
* Secure Cookie Authentication
* Password Hashing with bcrypt
* Role-Based Authorization
* Protected Admin Routes

---

### Product Management

* Create Products
* Retrieve Products
* Update Products
* Archive Products
* Restore Archived Products
* Product Search
* Product Filtering
* Low Stock Monitoring

---

### Inventory Management

* Stock Tracking
* Inventory Adjustments
* Stock Validation
* Low Stock Alerts
* Inventory-Safe Operations

---

### Image Management

Cloudinary Integration:

* Upload Product Images
* Delete Product Images
* Store Cloudinary URLs
* Store Public IDs
* Prevent Deletion of Final Product Image

---

### Sales Management

* Revenue Tracking
* Sales Records
* Product Sales History
* Sales Aggregation
* Business Performance Tracking

---

### Analytics

Dashboard analytics include:

* Revenue Summaries
* Product Performance Metrics
* Sales Insights
* Inventory Statistics
* Business Dashboard Reporting

---

### Development Utilities

* Database Seeding
* Sample Data Generation
* API Documentation
* Development Scripts

---

## Technology Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Authentication

* JWT
* bcrypt

### Cloud Storage

* Cloudinary
* Multer
* Multer Storage Cloudinary

### Development Tools

* Nodemon
* Git
* GitHub
* Postman

---

## Project Structure

```text
src/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
│
├── app.js
└── server.js

docs/
│
└── api-endpoints.md

seed/
│
├── sample-products.json
├── sample-orders.json
├── sample-sales.json
└── seeder.js
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Churchillcodes/gleamy-backend.git
```

Navigate into the project:

```bash
cd gleamy-backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URI=

ACCESS_TOKEN_SECRET=

REFRESH_TOKEN_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

## Running the Project

Development Mode:

```bash
npm run dev
```

Production Mode:

```bash
npm start
```

---

## API Documentation

Detailed API documentation can be found in:

```text
docs/api-endpoints.md
```

Includes:

* Authentication Routes
* Product Routes
* Sales Routes
* Analytics Routes
* Dashboard Routes
* Upload Routes

---

## Database Seeding

Development environments only.

Run:

```bash
npm run seed
```

### Warning

The seeding process removes existing:

* Products
* Sales Records

before generating sample development data.

Never run against production databases.

---

## Security Features

* Password Hashing
* JWT Authentication
* Refresh Token Rotation
* Secure Cookie Handling
* Role-Based Access Control
* Protected Routes
* Input Validation
* MongoDB Schema Validation

---

## Production Architecture

```text
Frontend (Netlify)
        │
        ▼
Backend API (Railway)
        │
        ▼
MongoDB Atlas
        │
        ▼
Cloudinary
```

---

## Current Roles

### User

Standard authenticated user.

### Admin

Administrators can:

* Manage Products
* Upload Images
* Monitor Analytics
* Access Dashboard Features
* Manage Inventory

---

## Future Enhancements

Planned Version 2 Features:

* MPesa Integration
* Shopping Cart
* Online Checkout
* Customer Accounts
* Employee Accounts
* Manufacturing Tracking
* Raw Material Tracking
* Advanced Reporting
* Expanded Role System

---

## Author

**Churchill**

Full Stack Developer

GitHub:

https://github.com/Churchillcodes

---

## License

This project is proprietary software developed for Gleamy Baby Cots & Furniture.
