# Module 01: Authentication & Authorization System

## Status: `✅ COMPLETED`

| Field | Value |
|-------|-------|
| **Priority** | CRITICAL |
| **Phase** | 1 (Weeks 1–2) |
| **Completed** | 2026-04-03 |

---

## What Was Built

### Backend
- `AuthController` — session-based login, logout (Inertia web)
- `User` model updated with `HasRoles` (spatie)
- `HandleInertiaRequests` middleware shares `auth.user` (name, email, roles, permissions) + flash messages

### Roles & Permissions Seeded
| Role | Key Permissions |
|------|----------------|
| Admin | All permissions |
| HR Manager | employees, departments, leaves, recruitment, reports |
| Manager | view employees, approve/reject leaves, view attendance |
| Employee | view self, apply leave, check-in/out |
| Recruiter | manage recruitment |
| Finance | view/process/approve payroll |

### Frontend
- `resources/js/pages/auth/Login.tsx` — dark themed login page
- `resources/js/components/layout/AppLayout.tsx` — sidebar + header + user dropdown
- `resources/js/pages/Dashboard.tsx` — role-based dashboard with stat cards and quick actions

### Demo Accounts (password: `Admin@1234`)
- admin@syscendhrm.test → Admin
- hr@syscendhrm.test → HR Manager
- manager@syscendhrm.test → Manager
- employee@syscendhrm.test → Employee

### Not Implemented (deferred)
- MFA / TOTP (Module 12 - System Admin enhancement)
- Password reset email flow (needs mail config)
- API token auth (Sanctum tokens — needed when building mobile/external API)
