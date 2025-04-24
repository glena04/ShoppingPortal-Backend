# ShoppingPortal Backend

This is the backend server for the Shopping Portal POS system with authentication.

## Features

- Product management API
- User authentication with JWT
- Role-based access control (admin/cashier)
- SQLite database

## Quick Start

1. Install dependencies: `npm install`
2. Create admin user: `npm run create-admin`
3. Start server: `npm start` or `npm run dev`
4. Test auth system: `npm run test-auth`

## Authentication

- Admin can manage products and users
- Cashiers can view products and update quantities
- JWT tokens used for authentication
- Protected routes require Authorization header

## API Routes

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
- Products: `/api/products`, `/api/products/:id`

See code for complete API documentation.
