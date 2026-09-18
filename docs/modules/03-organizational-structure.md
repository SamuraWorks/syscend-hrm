# Module 03: Organizational Structure

## Status: `⬜ NOT STARTED`

| Field | Value |
|-------|-------|
| **Priority** | HIGH |
| **Phase** | 1 (Weeks 4–5) |
| **Depends On** | Module 02 |

---

## Overview
Departments (nested hierarchy), positions, org chart visualization, team/reporting queries.

## Key Tasks
- Department CRUD + nested parent-child relationships
- Position CRUD linked to departments
- `/api/org-chart` — full hierarchy endpoint
- `/api/org-chart/manager/{id}` — direct reports
- Interactive org chart React component (expandable tree)
- Prevent circular parent references
- Block delete if employees assigned

## Acceptance Criteria
- [ ] Create/edit/delete departments and sub-departments
- [ ] Create/edit positions linked to departments
- [ ] View org chart visually (expandable/collapsible)
- [ ] View direct reports for any manager
- [ ] No circular relationships allowed
