# Employee Hierarchy Management System

## Overview
This application is a modern organizational management system for managing employees, organizational structure, and user access. It features a React (Vite) frontend, a Node.js (Express, Prisma) backend, and Supabase for authentication and file storage. The system supports employee CRUD, a modern org chart with live search and custom nodes, PDF credential generation, CSV import/export, and robust admin controls.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Key Features](#key-features)
4. [Using the Application](#using-the-application)
    - [Login & Registration](#login--registration)
    - [Dashboard](#dashboard)
    - [Employee Directory](#employee-directory)
    - [Organization Chart](#organization-chart)
    - [Create Employee](#create-employee)
    - [Account Settings](#account-settings)
    - [Export/Import CSV](#exportimport-csv)
5. [Admin Features](#admin-features)
6. [Troubleshooting](#troubleshooting)
7. [Deployment Notes](#deployment-notes)

---

## Getting Started
- **Frontend URL:** [https://main.d1vhlzr2b5j2uj.amplifyapp.com/]
- **Backend URL:** [epi-use-assessment-production.up.railway.app]
- **Login:** Use your company email and password. New users may register if allowed.

---

## User Roles
- **Admin:** Can create, update, and delete employees, promote users, reassign subordinates, and access all features.
- **Viewer:** Can view the org chart, directory, and their own profile.

---

## Key Features
- Modern, responsive UI with intuitive navigation
- Employee CRUD (Create, Read, Update, Delete)
- Organization chart with custom nodes, live search, and filtering
- Gravatar integration for profile images
- PDF credential generation for new employees (download after creation)
- CSV import/export for bulk employee management (with validation)
- Secure authentication (Supabase)
- Robust CORS and environment variable handling for production

---

## Using the Application

### Login & Registration
- Access the login page and enter your credentials.
- New users can register if registration is enabled.
- Forgotten passwords can be reset via Supabase (if configured).

### Dashboard
- View key statistics: total employees, departments, top managers, and recent hires.

### Employee Directory
- Browse all employees in a card/grid view.
- Click an employee to view their profile and Gravatar (if available).
- Use the search bar to filter by name, department, or role.

### Organization Chart
- Visualize the company hierarchy in a 2D org chart with custom nodes.
- Use the search bar to find employees by name or department.
- Zoom and pan controls for easy navigation.
- Click a node to view employee details.

### Create Employee
- Admins can add new employees via a form.
- After creation, download a PDF with the employee's login credentials.
- Option to "Create Another Employee" resets the form for quick entry.

### Account Settings
- Update your personal information and password.

### Export/Import CSV
- Export the employee list as a CSV file (with optional filters).
- Admins can import employees in bulk using a CSV template. Errors and duplicates are reported.

---

## Admin Features
- Only admins can create, update, or delete employees.
- Only admins can promote employees to higher roles.
- Admins can reassign subordinates when deleting a manager.
- All sensitive actions require authentication.

---

## Troubleshooting
- **CORS Errors:** Ensure the backend allows requests from your frontend domain (see CORS config in backend).
- **API Errors:** Check that the backend URL is correct in your environment variables (`VITE_API_BASE_URL`).
- **Login Issues:** Confirm your email and password are correct. Contact an admin if locked out.
- **CSV Import Errors:** Ensure your CSV matches the required format and has no duplicate emails.
- **Dependency Errors (local dev):** If you see missing module errors, delete `node_modules` and `package-lock.json`, then run `npm install`.

---

## Deployment Notes
- **Frontend:** Deploy on AWS Amplify or Vercel. Set environment variables (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Backend:** Deploy on Railway. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
- **Supabase:** Used for authentication and file storage. Keep your anon/public keys secure.
- **Environment Variables:** Always update your frontend `.env` for production URLs before deploying.
- **CORS:** Update backend CORS config to allow your frontend domain in production.

---

## Support
For further assistance, contact your system administrator or the development team.
