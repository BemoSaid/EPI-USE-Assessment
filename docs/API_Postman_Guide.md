# Employee Hierarchy API – Postman Testing Guide

This guide helps you test the main API endpoints of the Employee Hierarchy backend using Postman. It includes example requests, required fields, and sample responses for each route.

---

## Base URL
```
https://your-backend-url.up.railway.app/api
```
(Replace with your actual Railway backend URL)

---

## Authentication
Most endpoints require a JWT token. First, log in to get a token, then add it to the `Authorization` header as `Bearer <token>` for subsequent requests.

### 1. Register a New User
**POST** `/auth/register`

**Body (JSON):**
```
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

**Success Response:**
```
{
  "message": "User registered successfully"
}
```

---

### 2. Login
**POST** `/auth/login`

**Body (JSON):**
```
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Success Response:**
```
{
  "token": "<JWT_TOKEN>",
  "user": { ... }
}
```

---

## Employee Endpoints

### 3. Get All Employees
**GET** `/employees`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Query Params (optional):**
- `search`, `role`, `department`, `managerId`, `page`, `limit`

**Example:**
```
GET /employees?search=John
```

**Success Response:**
```
{
  "employees": [ ... ],
  "pagination": { ... }
}
```

---

### 4. Get Employee by ID
**GET** `/employees/{id}`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Example:**
```
GET /employees/1
```

**Success Response:**
```
{
  "id": 1,
  "name": "John",
  "surname": "Doe",
  ...
}
```

---

### 5. Create Employee (Admin Only)
**POST** `/employees`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Body (JSON):**
```
{
  "name": "Jane",
  "surname": "Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "1234567890",
  "role": "MANAGER",
  "department": "Engineering",
  "managerId": 1,
  "birthDate": "1990-01-01",
  "salary": 60000
}
```

**Success Response:**
```
{
  "id": 2,
  "name": "Jane",
  ...
  "userCredentials": {
    "email": "jane.smith@example.com",
    "temporaryPassword": "smiE2!9",
    ...
  }
}
```

---

### 6. Update Employee
**PUT** `/employees/{id}`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Body (JSON):**
```
{
  "department": "Marketing",
  "phoneNumber": "0987654321"
}
```

**Success Response:**
```
{
  "id": 2,
  "department": "Marketing",
  ...
}
```

---

### 7. Delete Employee (Admin Only)
**DELETE** `/employees/{id}`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Success Response:**
- Status: 204 No Content

---

### 8. Export Employees as CSV
**GET** `/employees/export`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Query Params (optional):**
- `search`, `role`, `department`, etc.

**Response:**
- CSV file download

---

### 9. Import Employees from CSV (Admin Only)
**POST** `/employees/import`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: multipart/form-data`

**Body:**
- Form-data with a file field named `file` (CSV file)

**Success Response:**
```
{
  "created": 5,
  "updated": 2,
  "userCreated": 5,
  "errors": []
}
```

---

### 10. Get Organization Hierarchy
**GET** `/employees/hierarchy`

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Success Response:**
```
[
  {
    "id": 1,
    "name": "CEO",
    "children": [ ... ]
  },
  ...
]
```

---

## Notes
- Always include the JWT token in the `Authorization` header for protected routes.
- For CSV import, use the provided template and ensure all required fields are present.
- For more endpoints (dashboard stats, departments, etc.), see the API documentation or use `/api` for a list.

---

## Support
If you encounter issues, contact your system administrator or the development team.
