# Module 02: Employee Management

## Status: `🔄 IN PROGRESS`

| Field | Value |
|-------|-------|
| **Priority** | HIGH |
| **Phase** | 1 (Weeks 3–4) |
| **Depends On** | Module 01 |
| **Started** | 2026-04-03 |

---

## Backend Tasks
- [ ] Migration: `employees` table
- [ ] Migration: `departments` table
- [ ] Migration: `positions` table
- [ ] Migration: `documents` table
- [ ] Migration: `employment_history` table
- [ ] `Employee` model (relationships, soft deletes)
- [ ] `Department` model
- [ ] `Position` model
- [ ] `EmployeeController` — CRUD + search/filter/paginate
- [ ] `DocumentController` — upload/list/delete
- [ ] Bulk CSV import endpoint
- [ ] Export to CSV endpoint
- [ ] Employment history tracking on update

## Frontend Tasks
- [ ] `/employees` — list page (table, search, filters, pagination)
- [ ] `/employees/create` — create form (multi-section)
- [ ] `/employees/{id}` — detail view (tabs: Overview, Documents, History)
- [ ] `/employees/{id}/edit` — edit form
- [ ] `EmployeeTable` component
- [ ] `EmployeeForm` component
- [ ] `EmployeeFilterPanel` component
- [ ] `DocumentManager` component

## Database Schema

```
employees (id, user_id, employee_id, first_name, last_name, email, phone,
           dob, gender, nationality, address, city, state, country, postal_code,
           department_id, position_id, reporting_manager_id, date_of_joining,
           contract_type, employment_status, salary, created_at, updated_at, deleted_at)

departments (id, name, description, head_id, parent_id, cost_center, created_at, updated_at)
positions   (id, name, description, department_id, level, salary_min, salary_max, created_at, updated_at)
documents   (id, employee_id, document_type, file_path, file_name, file_size, uploaded_by, upload_date, expiry_date)
employment_history (id, employee_id, field_name, old_value, new_value, changed_by, changed_at)
```

## API Endpoints
- `GET    /api/employees` — list with pagination + filters
- `POST   /api/employees` — create
- `GET    /api/employees/{id}` — detail
- `PUT    /api/employees/{id}` — update
- `DELETE /api/employees/{id}` — soft delete
- `POST   /api/employees/bulk-import` — CSV import
- `GET    /api/employees/export` — CSV/PDF export
- `POST   /api/employees/{id}/documents` — upload
- `GET    /api/employees/{id}/documents` — list
- `DELETE /api/employees/{id}/documents/{docId}` — delete
- `GET    /api/employees/{id}/history` — history log

## Acceptance Criteria
- [ ] Create employees with all fields + validation
- [ ] List with pagination, search, sort, filter
- [ ] Edit with change history tracked
- [ ] Soft delete
- [ ] Document upload/download/delete
- [ ] CSV export
- [ ] Bulk CSV import with report
- [ ] HR Manager + Admin can manage, employees view own profile only
