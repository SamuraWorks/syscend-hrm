# Introduction

Syscend-HRM is a fully open-source, enterprise-grade Human Resource Management System built for modern teams. It delivers a comprehensive suite of HR tools in a clean, modular architecture — enabling organisations of any size to manage their workforce with confidence.

Whether you are a small business with 10 employees or an enterprise managing hundreds, Syscend-HRM provides the tools to automate HR operations, enforce compliance, and gain data-driven insights into your workforce.

---

## What is Syscend-HRM?

Syscend-HRM is a **Laravel 13 + React 18 + TypeScript** web application that covers the full employee lifecycle — from recruitment and onboarding through performance management, payroll, and offboarding. It is built with a modular architecture using `nwidart/laravel-modules`, meaning each functional area (Employees, Payroll, Attendance, etc.) is an independent Laravel module that can be enabled, disabled, or extended without touching core code.

The system ships with **demo data seeders**, so you can evaluate every feature immediately after installation without manual data entry.

---

## Key Features

- **Complete Employee Lifecycle** — Hire, manage, and offboard employees with full audit trails
- **Modular Architecture** — 12 independent modules built on `nwidart/laravel-modules`
- **Role-Based Access Control** — 6 built-in roles with granular permission matrices
- **Payroll Engine** — Multi-component salary structures with 2-pass tax calculation
- **Attendance & Shift Management** — Manual and API-driven clock-in/out
- **Leave Approval Workflows** — Multi-step leave request and approval process
- **Recruitment (ATS)** — Job postings, application pipeline, interview scheduling
- **Performance Appraisals** — Configurable cycles with self-assessment and manager scoring
- **Training Management** — Courses, sessions, enrollments, completion tracking
- **Documents & Compliance** — Company and personal document management with acknowledgements
- **Analytics Dashboards** — KPI cards and charts for every module
- **RESTful API** — Full JSON API with Bearer token authentication
- **Audit Log** — Every action logged with user, IP, and timestamp
- **Multi-language Ready** — Laravel localisation support built in

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend Framework | Laravel 13 |
| Frontend Framework | React 18 |
| Language | TypeScript |
| Bridge | Inertia.js |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Database | MySQL 8.0+ |
| Module System | nwidart/laravel-modules |
| Build Tool | Vite |
| Authentication | Laravel Sanctum |
| PDF Generation | DomPDF / Barryvdh |
| Queue | Laravel Queue (database driver) |

---

## Module Overview

| Module | Description |
|--------|-------------|
| **Employees** | Full employee CRUD, profile management, employment history, document attachment |
| **Organization** | Departments, positions, reporting lines, org chart |
| **Attendance** | Clock-in/out, shift scheduling, attendance statuses, reports |
| **Leave** | Leave types, allowances, request submission, approval workflow, calendar |
| **Payroll** | Salary components, structures, payroll runs, payslips, PDF download |
| **Recruitment** | Job postings, candidate pipeline, interviews, offer management |
| **Performance** | Appraisal cycles, self/manager scores, finalised ratings, reports |
| **Training** | Courses, sessions, enrollments, completion and scoring |
| **Documents** | Company and personal documents, acknowledgement tracking |
| **Reports** | Unified analytics dashboard covering all modules |
| **Settings** | SMTP, SMS, branding, financial year, currency, timezone |
| **Users & RBAC** | User accounts, roles, granular permissions, audit log |

---

## Architecture Overview

Syscend-HRM follows a **modular monolith** pattern. All feature code lives inside `Modules/` — each module contains its own:

```
Modules/
  Employees/
    Config/
    Database/
      Migrations/
      Seeders/
    Http/
      Controllers/
      Requests/
      Resources/
    Models/
    Providers/
    Routes/
    resources/
      js/
        Pages/
        Components/
```

The React frontend communicates with Laravel via **Inertia.js** — no separate API server is needed for the UI. A dedicated RESTful JSON API layer (`/api/v1/`) is available for mobile apps or third-party integrations, secured via **Laravel Sanctum** Bearer tokens.

```
Browser (React + TypeScript)
      |
   Inertia.js
      |
Laravel 13 (Modules via nwidart)
      |
   MySQL 8
```

---

## Who Is Syscend-HRM For?

| Audience | Use Case |
|----------|----------|
| **HR Teams** | Replace spreadsheets with a structured, auditable system |
| **SMEs (10–500 employees)** | Full HR suite without enterprise licensing costs |
| **Enterprises** | Self-hosted, customisable, extensible via Laravel modules |
| **Developers** | Clean codebase as a starting point for custom HR solutions |
| **Consultancies** | White-label and deploy for clients |

---

## Quick Navigation

- [Installation Guide](/guide/installation) — Get up and running in minutes
- [Configuration](/guide/configuration) — Set up email, SMS, branding
- [Demo Accounts](/guide/demo-accounts) — Try every role out of the box
- [Module Docs](/modules/employees) — Deep-dive into each feature area
- [API Reference](/api/overview) — Integrate with your existing tools
