# Syscend-HRM — Module Tracker

> **Project:** Syscend-HRM | **Stack:** Laravel 13 + Inertia.js + React + TypeScript + shadcn/ui
> **DB:** MySQL | **Tenancy:** Single-tenant | **Market:** Global Core first
> **Last Updated:** 2026-04-03

---

## Status Legend

| Badge | Meaning |
|-------|---------|
| `✅ COMPLETED` | Done and accepted |
| `🔄 IN PROGRESS` | Currently being implemented |
| `⬜ NOT STARTED` | Work has not begun |
| `🔒 BLOCKED` | Waiting on a dependency |

---

## Module Status Overview

| # | Module | Status | Priority | Phase | Depends On | Doc |
|---|--------|--------|----------|-------|------------|-----|
| 00 | Laravel Core Setup | `✅ COMPLETED` | CRITICAL | 1 | — | [00-laravel-core-setup.md](modules/00-laravel-core-setup.md) |
| 01 | Authentication & Authorization | `✅ COMPLETED` | CRITICAL | 1 | 00 | [01-authentication.md](modules/01-authentication.md) |
| 02 | Employee Management | `✅ COMPLETED` | HIGH | 1 | 01 | [02-employee-management.md](modules/02-employee-management.md) |
| 03 | Organizational Structure | `✅ COMPLETED` | HIGH | 1 | 02 | [03-organizational-structure.md](modules/03-organizational-structure.md) |
| 04 | Attendance & Shift Management | `✅ COMPLETED` | HIGH | 2 | 02 | [04-attendance-shift.md](modules/04-attendance-shift.md) |
| 05 | Leave Management | `✅ COMPLETED` | HIGH | 2 | 02, 04 | [05-leave-management.md](modules/05-leave-management.md) |
| 06 | Recruitment & ATS | `✅ COMPLETED` | MEDIUM-HIGH | 3 | 01, 02 | [06-recruitment-ats.md](modules/06-recruitment-ats.md) |
| 07 | Payroll & Compensation | `✅ COMPLETED` | CRITICAL | 4 | 02, 04 | [07-payroll-compensation.md](modules/07-payroll-compensation.md) |
| 08 | Performance Management | `✅ COMPLETED` | MEDIUM | 5 | 02 | [08-performance-management.md](modules/08-performance-management.md) |
| 09 | Training & Development | `✅ COMPLETED` | LOW-MEDIUM | 5 | 02 | [09-training-development.md](modules/09-training-development.md) |
| 10 | Documents & Compliance | `✅ COMPLETED` | MEDIUM | 6 | 02 | [10-documents-compliance.md](modules/10-documents-compliance.md) |
| 11 | Reports & Analytics | `✅ COMPLETED` | HIGH | 6 | All | [11-reports-analytics.md](modules/11-reports-analytics.md) |
| 12 | System Administration | `✅ COMPLETED` | HIGH | 6 | 01 | [12-system-administration.md](modules/12-system-administration.md) |

---

## Development Phases

| Phase | Weeks | Modules | Goal |
|-------|-------|---------|------|
| **Phase 1** | 1–4 | 00 ✅, 01 ✅, 02 ✅, 03 🔄 | Foundation & Core HR |
| **Phase 2** | 5–8 | 04, 05 | Attendance & Leave Management |
| **Phase 3** | 9–12 | 06 | Recruitment & ATS |
| **Phase 4** | 13–16 | 07 | Payroll & Compensation |
| **Phase 5** | 17–20 | 08, 09 | Performance & Training |
| **Phase 6** | 21–24 | 10, 11, 12 | Admin, Compliance & Analytics |

---

## Completed — What Was Built

### Module 00 — Laravel Core Setup ✅
- Laravel 13 + Inertia.js + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- MySQL connected, Sanctum + spatie/permission migrated
- Full API route groups scaffolded (all 12 modules)
- Base `ApiController`, `BaseFormRequest`, `HandleInertiaRequests` middleware

### Module 01 — Authentication & Authorization ✅
- Session-based login/logout (Inertia web)
- 6 roles seeded: Admin, HR Manager, Manager, Employee, Recruiter, Finance
- 55 permissions across 11 modules
- Login page (dark theme, validation, show/hide password)
- Dashboard page with AppLayout (sidebar + header + user menu)
- 4 demo accounts: admin / hr / manager / employee @syscendhrm.test (Admin@1234)

### Module 02 — Employee Management ✅
- Full CRUD: create, view, edit, soft-delete (sets Terminated status first)
- Auto-generated employee IDs (EMP-001 format, gap-safe with withTrashed)
- Employment history auto-tracked via model observer (6 tracked fields)
- Documents table (employee_documents) — upload-ready schema
- Employee Index: paginated list, search (name/email/ID), filter (dept/position/status)
- Employee Show: tabbed view (Overview, Documents, History), confirm-delete flow
- Employee Form: reusable component, positions filtered by selected department
- Dark/light/system theme toggle in header (localStorage-persisted, flash-free)

### Module 07 — Payroll & Compensation ✅
- Salary components (earning / deduction / tax), calculation types: fixed, percentage_of_basic, percentage_of_gross
- Salary structures with component pivot (override_value per structure)
- Employee salary assignments with effective_date history
- PayrollService: 2-pass calculation (pass 1 = fixed + % of basic, pass 2 = % of gross)
- Payroll runs: draft → approve → paid workflow
- Payslip generation per employee with line items; regenerate support for draft runs
- Individual payslip view with professional layout, print + Download PDF (browser print dialog)
- Demo seeder: 10 components, 4 structures, salary assignments, 2 payroll runs

---

## Regional Features (Future — After Phase 4)

| Region | Key Features |
|--------|-------------|
| **Western (USA/EU)** | GDPR, CCPA, EEOC, ADA, FMLA, multi-state tax, 401k |
| **Middle East (GCC)** | Kafala, Visa, GOSI/NSSF, Arabic/RTL, Islamic calendar, EOS benefits |

---

## Quick Stats

- **Completed:** 13 / 13
- **In Progress:** 0 / 13
- **Not Started:** 0 / 13
