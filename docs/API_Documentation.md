# Employee Hierarchy Management System - API Documentation

## 📋 Overview

This is a REST API for managing employee hierarchies in an organization. The system allows you to create, read, update, and delete employee data while maintaining proper reporting structures. It includes authentication, Gravatar integration, and comprehensive hierarchy management features.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (Supabase recommended)
- Postman or similar API testing tool

### Quick Start
1. Clone the repository
2. Navigate to `app-backend` directory
3. Install dependencies: `npm install`
4. Set up environment variables (see `.env.example`)
5. Run database migrations: `npm run db:migrate`
6. Start the server: `npm run dev`

The API will be available at: `http://localhost:5000`

## 🔧 Environment Setup

Create a `.env` file in the `app-backend` directory:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_super_secret_jwt_key"
PORT=5000
NODE_ENV=development
```

## 📚 API Reference

### Base URL
```
http://localhost:5000
```

---

## 🔐 Authentication Endpoints

### 1. Register User
Creates a new user account for accessing the system.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Admin",
  "email": "admin@company.com",
  "password": "password123",
  "role": "ADMIN"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "admin@company.com",
    "name": "John Admin",
    "role": "ADMIN"
  }
}
```

### 2. Login User
Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cuid123",
    "email": "admin@company.com",
    "name": "John Admin",
    "role": "ADMIN"
  }
}
```

### 3. Get Current User
Returns information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "id": "cuid123",
  "email": "admin@company.com",
  "name": "John Admin",
  "role": "ADMIN",
  "createdAt": "2025-10-17T12:00:00.000Z"
}
```

---

## 👥 Employee Management Endpoints

> **Note:** All employee endpoints require authentication. Include the JWT token in the Authorization header for all requests.

### 4. Get All Employees
Retrieves a list of all employees with optional filtering, searching, and pagination.

**Endpoint:** `GET /api/employees`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters (all optional):**
- `search` - Search by name, surname, employee number, email, or department
- `role` - Filter by specific role (CEO, MANAGER, etc.)
- `department` - Filter by department name
- `managerId` - Filter by manager ID
- `sortField` - Sort by field (name, salary, role, etc.)
- `sortDirection` - Sort direction (asc, desc)
- `page` - Page number for pagination (default: 1)
- `limit` - Number of results per page (default: 50)

**Example URLs:**
```
GET /api/employees
GET /api/employees?search=john
GET /api/employees?role=MANAGER
GET /api/employees?department=Engineering&sortField=salary&sortDirection=desc
```

**Response (200 OK):**
```json
{
  "employees": [
    {
      "id": 1,
      "employeeNumber": "CEO001",
      "name": "Sarah",
      "surname": "Johnson",
      "birthDate": "1975-03-20T00:00:00.000Z",
      "salary": "200000.00",
      "role": "CEO",
      "email": "sarah@company.com",
      "phoneNumber": "+1234567890",
      "department": "Executive",
      "managerId": null,
      "gravatarUrl": "https://www.gravatar.com/avatar/...",
      "manager": null,
      "subordinates": [
        {
          "id": 2,
          "name": "Michael",
          "surname": "Smith",
          "employeeNumber": "CTO001",
          "role": "CTO"
        }
      ],
      "createdAt": "2025-10-17T12:00:00.000Z",
      "updatedAt": "2025-10-17T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### 5. Get Employee by ID
Retrieves detailed information about a specific employee.

**Endpoint:** `GET /api/employees/{id}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "id": 1,
  "employeeNumber": "CEO001",
  "name": "Sarah",
  "surname": "Johnson",
  "birthDate": "1975-03-20T00:00:00.000Z",
  "salary": "200000.00",
  "role": "CEO",
  "email": "sarah@company.com",
  "phoneNumber": "+1234567890",
  "department": "Executive",
  "managerId": null,
  "gravatarUrl": "https://www.gravatar.com/avatar/...",
  "manager": null,
  "subordinates": [...],
  "user": null,
  "createdAt": "2025-10-17T12:00:00.000Z",
  "updatedAt": "2025-10-17T12:00:00.000Z"
}
```

### 6. Create Employee
Creates a new employee in the system.

**Endpoint:** `POST /api/employees`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "employeeNumber": "EMP001",
  "name": "John",
  "surname": "Doe",
  "birthDate": "1990-05-15",
  "salary": 75000,
  "role": "SENIOR_EMPLOYEE",
  "email": "john.doe@company.com",
  "phoneNumber": "+1234567890",
  "department": "Engineering",
  "managerId": 2
}
```

**Required Fields:**
- `employeeNumber` (must be unique)
- `name`
- `surname`
- `birthDate` (YYYY-MM-DD format)
- `salary` (numeric)
- `role` (must be one of the valid roles)

**Optional Fields:**
- `email` (must be unique if provided)
- `phoneNumber`
- `department`
- `profileUrl`
- `managerId` (ID of reporting manager)
- `userId` (linked user account)

**Response (201 Created):**
```json
{
  "id": 5,
  "employeeNumber": "EMP001",
  "name": "John",
  "surname": "Doe",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "salary": "75000.00",
  "role": "SENIOR_EMPLOYEE",
  "email": "john.doe@company.com",
  "gravatarUrl": "https://www.gravatar.com/avatar/...",
  "manager": {
    "id": 2,
    "name": "Michael",
    "surname": "Smith",
    "employeeNumber": "CTO001",
    "role": "CTO"
  },
  "createdAt": "2025-10-17T12:00:00.000Z",
  "updatedAt": "2025-10-17T12:00:00.000Z"
}
```

### 7. Update Employee
Updates an existing employee's information.

**Endpoint:** `PUT /api/employees/{id}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (partial update - only include fields to change):**
```json
{
  "salary": 85000,
  "role": "TEAM_LEAD",
  "department": "Senior Engineering",
  "managerId": 1
}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "employeeNumber": "EMP001",
  "name": "John",
  "surname": "Doe",
  "salary": "85000.00",
  "role": "TEAM_LEAD",
  "department": "Senior Engineering",
  "managerId": 1,
  "updatedAt": "2025-10-17T13:00:00.000Z"
}
```

### 8. Delete Employee
Removes an employee from the system.

**Endpoint:** `DELETE /api/employees/{id}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "message": "Employee deleted successfully"
}
```

**Error Response (400 Bad Request) - If employee has subordinates:**
```json
{
  "error": "Cannot delete employee with subordinates. Please reassign subordinates first.",
  "subordinateCount": 2,
  "subordinates": [
    {
      "id": 6,
      "name": "Alice",
      "surname": "Brown",
      "employeeNumber": "EMP002"
    }
  ]
}
```

---

## 🌳 Hierarchy Management Endpoints

### 9. Get Organization Hierarchy
Returns the complete organizational hierarchy as a tree structure.

**Endpoint:** `GET /api/employees/hierarchy`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Sarah",
    "surname": "Johnson",
    "role": "CEO",
    "department": "Executive",
    "gravatarUrl": "https://www.gravatar.com/avatar/...",
    "children": [
      {
        "id": 2,
        "name": "Michael",
        "surname": "Smith",
        "role": "CTO",
        "children": [
          {
            "id": 5,
            "name": "John",
            "surname": "Doe",
            "role": "TEAM_LEAD",
            "children": []
          }
        ]
      }
    ]
  }
]
```

### 10. Get Departments
Returns a list of all departments in the organization.

**Endpoint:** `GET /api/employees/departments`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
[
  "Engineering",
  "Executive",
  "Human Resources",
  "Marketing",
  "Sales",
  "Technology"
]
```

### 11. Get Potential Managers
Returns employees who can serve as managers (management-level roles only).

**Endpoint:** `GET /api/employees/potential-managers`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `excludeId` - Exclude specific employee ID (useful when editing an employee)

**Example:**
```
GET /api/employees/potential-managers?excludeId=5
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Sarah",
    "surname": "Johnson",
    "employeeNumber": "CEO001",
    "role": "CEO",
    "department": "Executive"
  },
  {
    "id": 2,
    "name": "Michael",
    "surname": "Smith",
    "employeeNumber": "CTO001",
    "role": "CTO",
    "department": "Technology"
  }
]
```

---

## 🔧 Utility Endpoints

### 12. Health Check
Checks if the API server is running properly.

**Endpoint:** `GET /health`

**No authentication required**

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-17T12:00:00.000Z",
  "environment": "development"
}
```

### 13. API Information
Returns API documentation and available endpoints.

**Endpoint:** `GET /api`

**No authentication required**

**Response (200 OK):**
```json
{
  "name": "Employee Hierarchy API",
  "version": "1.0.0",
  "endpoints": {
    "auth": {
      "register": "POST /api/auth/register",
      "login": "POST /api/auth/login"
    },
    "employees": {
      "list": "GET /api/employees",
      "hierarchy": "GET /api/employees/hierarchy",
      "getById": "GET /api/employees/:id",
      "create": "POST /api/employees",
      "update": "PUT /api/employees/:id",
      "delete": "DELETE /api/employees/:id"
    }
  }
}
```

---

## 📋 Valid Employee Roles

When creating or updating employees, use these exact role values:

- `CEO` - Chief Executive Officer
- `CTO` - Chief Technology Officer
- `DIRECTOR` - Director level
- `SENIOR_MANAGER` - Senior Manager
- `MANAGER` - Manager
- `TEAM_LEAD` - Team Lead
- `SENIOR_EMPLOYEE` - Senior Employee
- `JUNIOR_EMPLOYEE` - Junior Employee
- `INTERN` - Intern

---

## 🎨 Gravatar Integration

The API automatically integrates with Gravatar to provide profile pictures:

- If an employee has an email with a Gravatar account, the `gravatarUrl` field will be included in responses
- If no Gravatar exists for the email, the `gravatarUrl` field will be omitted
- Gravatar URLs are automatically generated using MD5 hash of the email address

---

## ⚠️ Error Responses

### Common HTTP Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data or business rule violation
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "details": "Additional error details (when available)"
}
```

### Common Validation Errors

- **Duplicate employee number**: `"Employee number already exists"`
- **Duplicate email**: `"Email already exists"`
- **Invalid manager**: `"Manager not found"`
- **Self-assignment**: `"Employee cannot be their own manager"`
- **Delete with subordinates**: `"Cannot delete employee with subordinates"`

---

## 🧪 Testing Guide

### 1. Authentication Flow
1. Register a user with `POST /api/auth/register`
2. Copy the JWT token from the response
3. Use the token in the `Authorization: Bearer {token}` header for all subsequent requests

### 2. Basic Employee Operations
1. Create a CEO (no manager): `POST /api/employees`
2. Create managers under CEO: `POST /api/employees` with `managerId`
3. Get all employees: `GET /api/employees`
4. View hierarchy: `GET /api/employees/hierarchy`

### 3. Postman Collection
For easy testing, create a Postman collection with:
- Environment variable `token` for JWT token
- Environment variable `base_url` set to `http://localhost:5000`
- Use `{{token}}` and `{{base_url}}` in your requests

---

## 🚀 Example Testing Workflow

```bash
# 1. Register user
POST {{base_url}}/api/auth/register
{
  "name": "Test Admin",
  "email": "admin@test.com", 
  "password": "password123"
}

# 2. Create CEO
POST {{base_url}}/api/employees
Authorization: Bearer {{token}}
{
  "employeeNumber": "CEO001",
  "name": "Sarah",
  "surname": "Johnson",
  "birthDate": "1975-03-20",
  "salary": 200000,
  "role": "CEO",
  "email": "sarah@company.com",
  "department": "Executive"
}

# 3. Create CTO under CEO
POST {{base_url}}/api/employees
Authorization: Bearer {{token}}
{
  "employeeNumber": "CTO001",
  "name": "Michael",
  "surname": "Smith",
  "birthDate": "1980-07-10",
  "salary": 180000,
  "role": "CTO",
  "email": "michael@company.com",
  "department": "Technology",
  "managerId": 1
}

# 4. View hierarchy
GET {{base_url}}/api/employees/hierarchy
Authorization: Bearer {{token}}
```

---


