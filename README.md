# Employee Hierarchy Management System

![alt text](app-frontend/public/EH.png)

<table>
  <tr>
    <td align="center"><b>User Manual</b></td>
    <td align="center"><b>Technical Document</b></td>
  </tr>
  <tr>
    <td align="center"><a href="docs/UserManual.pdf">User Manual PDF</a></td>
    <td align="center"><a href="docs/TechnicalDocument.pdf">Technical Document PDF</a></td>
  </tr>
</table>

---

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS%20Amplify-FF9900?style=for-the-badge&logo=awsamplify&logoColor=white" />
  <img src="https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
</p>

---

## Overview
A modern, full-stack organizational management system for managing employees, roles, and company structure. Features a modern UI, robust backend, and seamless deployment.

---

## Features
- 🏢 Interactive org chart with live search, custom nodes, and modern design
- 👤 Employee directory with Gravatar integration
- ➕ Admins can add, update, and delete employees
- 📄 PDF credential generation for new employees
- 📊 Dashboard with key company stats
- 📥 CSV import/export for bulk management
- 🔒 Secure authentication (Supabase)
- 🚀 Easy deployment (Amplify, Railway)

---

## Quick Start
1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/EPI-USE-Assessment.git
   ```
2. **Install dependencies:**
   ```bash
   cd app-frontend && npm install
   cd ../app-backend && npm install
   ```
3. **Set up environment variables:**
   - See `.env.example` in each folder for required variables.
4. **Run locally:**
   - Frontend: `npm run dev` (in `app-frontend`)
   - Backend: `npm run dev` (in `app-backend`)

---

## Deployment
- **Frontend:** Deploy on AWS Amplify or Vercel. Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- **Backend:** Deploy on Railway. Set `DATABASE_URL`, `JWT_SECRET`, etc.
- **CORS:** Ensure backend allows requests from your frontend domain.

---

## Documentation
- 📖 [User Manual (Markdown)](docs/USER_MANUAL.md)
- 📬 [API Postman Guide (Markdown)](docs/API_Postman_Guide.md)

