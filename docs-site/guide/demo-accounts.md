# Demo Accounts

Syscend-HRM ships with pre-configured demo accounts for each built-in role. After running the demo seeder (`php artisan db:seed --class=DemoDataSeeder`), the following accounts are available immediately.

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@syscendhrm.test | Admin@1234 |
| **HR Manager** | hr@syscendhrm.test | Admin@1234 |
| **Manager** | manager@syscendhrm.test | Admin@1234 |
| **Employee** | employee@syscendhrm.test | Admin@1234 |
| **Recruiter** | recruiter@syscendhrm.test | Admin@1234 |
| **Finance** | finance@syscendhrm.test | Admin@1234 |

::: danger Change These in Production
These credentials are publicly documented. Change all default passwords immediately before going live.
:::

---

## Role Access Summary

### Admin
The Admin account has unrestricted access to every part of the system.

- Full access to all 12 modules
- Can create, edit, and delete employees, departments, and positions
- Manages users, roles, and permissions
- Accesses system settings (SMTP, SMS, branding, financial year)
- Views audit logs
- Runs payroll and approves leave

### HR Manager
The HR Manager handles day-to-day HR operations.

- Full access to the Employees module (create, edit, view)
- Manages attendance records
- Reviews and approves/rejects leave requests
- Creates and manages performance appraisal cycles
- Enrolls employees in training
- Accesses all HR reports
- Cannot access system settings or user management

### Manager
The Manager role is designed for department heads and team leads.

- Views employees within their department
- Submits leave approvals for direct reports
- Adds performance ratings for their team
- Views department-level attendance and leave reports
- Cannot manage payroll or system settings

### Employee
The Employee account represents a standard staff member.

- Views their own profile
- Submits leave requests
- Views their own attendance records and leave balances
- Downloads their own payslips
- Participates in performance self-assessments
- Accesses available training courses and enrolls

### Recruiter
The Recruiter account manages the hiring pipeline.

- Creates and manages job postings
- Views and processes applications
- Schedules interviews
- Manages candidate records
- Cannot access payroll or performance modules

### Finance
The Finance account handles compensation and payroll.

- Views and manages salary structures
- Runs payroll cycles
- Approves payroll and generates payslips
- Views payroll reports
- Cannot access recruitment, performance, or training modules

---

## Demo Data Included

The `DemoDataSeeder` creates:

| Data | Count |
|------|-------|
| Departments | 8 |
| Positions | 20 |
| Employees | 50 |
| Attendance records | 3 months of records for all employees |
| Leave types | 6 (Annual, Sick, Casual, Maternity, Paternity, Unpaid) |
| Leave requests | 30 (mix of pending, approved, rejected) |
| Salary components | 10 |
| Salary structures | 4 |
| Payroll runs | 3 completed runs |
| Performance cycles | 2 (one active, one completed) |
| Training courses | 8 |
| Training sessions | 12 |
| Company documents | 5 |

---

## Resetting Demo Data

To reset all demo data back to the original state:

```bash
php artisan migrate:fresh --seed
```

::: warning
This command drops all tables and re-creates them. All data will be lost. Only use this command on a development or demo environment — never on production.
:::
