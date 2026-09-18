# Roles & Permissions

Syscend-HRM uses a role-based access control (RBAC) system. Every user is assigned one role, and each role has a set of permissions that determine which areas and actions they can access.

---

## Built-in Roles

Six roles ship with Syscend-HRM out of the box. They cannot be deleted, but their permissions can be customised.

| Role | Primary Purpose |
|------|----------------|
| **Admin** | Full system access — no restrictions |
| **HR Manager** | Manages all HR operations |
| **Manager** | Department-level oversight |
| **Employee** | Self-service access to own data |
| **Recruiter** | Manages recruitment pipeline |
| **Finance** | Payroll and compensation management |

---

## Role Permissions Matrix

### Admin

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Employees | ✅ | ✅ | ✅ | ✅ |
| Organization | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ | ✅ |
| Leave | ✅ | ✅ | ✅ | ✅ |
| Payroll | ✅ | ✅ | ✅ | ✅ |
| Recruitment | ✅ | ✅ | ✅ | ✅ |
| Performance | ✅ | ✅ | ✅ | ✅ |
| Training | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | — | — | — |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ |

### HR Manager

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Employees | ✅ | ✅ | ✅ | ❌ |
| Organization | ✅ | ✅ | ✅ | ❌ |
| Attendance | ✅ | ✅ | ✅ | ❌ |
| Leave | ✅ | ✅ | ✅ (approve/reject) | ❌ |
| Payroll | ✅ | ❌ | ❌ | ❌ |
| Recruitment | ✅ | ✅ | ✅ | ❌ |
| Performance | ✅ | ✅ | ✅ | ❌ |
| Training | ✅ | ✅ | ✅ | ❌ |
| Documents | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | — | — | — |
| Settings | ❌ | ❌ | ❌ | ❌ |
| Users | ❌ | ❌ | ❌ | ❌ |

### Manager

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Employees (dept) | ✅ | ❌ | ❌ | ❌ |
| Attendance (dept) | ✅ | ❌ | ❌ | ❌ |
| Leave (direct reports) | ✅ | ❌ | ✅ (approve/reject) | ❌ |
| Performance (direct reports) | ✅ | ❌ | ✅ (scoring) | ❌ |
| Reports (dept) | ✅ | — | — | — |

### Employee

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Own Profile | ✅ | ❌ | ✅ (limited) | ❌ |
| Own Attendance | ✅ | ❌ | ❌ | ❌ |
| Leave Requests | ✅ (own) | ✅ | ❌ | ❌ |
| Own Payslips | ✅ | ❌ | ❌ | ❌ |
| Own Performance | ✅ | ❌ | ✅ (self-assessment) | ❌ |
| Training (enroll) | ✅ | ✅ (enroll self) | ❌ | ❌ |
| Own Documents | ✅ | ❌ | ❌ | ❌ |

### Recruiter

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Recruitment | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ (view only) | ❌ | ❌ | ❌ |

### Finance

| Module | View | Create | Edit | Delete |
|--------|------|--------|------|--------|
| Payroll | ✅ | ✅ | ✅ | ❌ |
| Employees | ✅ (view only) | ❌ | ❌ | ❌ |
| Reports (payroll) | ✅ | — | — | — |

---

## Creating a Custom Role

In addition to the six built-in roles, administrators can create custom roles with precisely controlled permissions.

1. Navigate to **Admin Panel → Roles**
2. Click **Add Role**
3. Enter a **Role Name** (e.g., `Payroll Analyst`)
4. In the permissions matrix, toggle individual permissions:
   - Each module row has columns: `View`, `Create`, `Edit`, `Delete`
   - Check only the permissions this role should have
5. Click **Save Role**
6. Assign the new role to users via **Users → Edit User → Role**

### Available Permissions per Module

Each module exposes granular permissions:

| Permission Key | Description |
|---------------|-------------|
| `employees.view` | View employee list and profiles |
| `employees.create` | Add new employees |
| `employees.edit` | Edit employee data |
| `employees.delete` | Soft-delete employees |
| `payroll.run` | Start a payroll cycle |
| `payroll.approve` | Approve and finalise payroll |
| `leave.approve` | Approve or reject leave requests |
| `performance.finalise` | Finalise appraisal ratings |
| `settings.access` | Access system settings panel |
| `audit-log.view` | View the audit log |
| ... | More per module |

---

## Permission Inheritance

Permissions are not inherited between roles. Each role's permission set is independent. If you need a role that covers multiple job functions, create a custom role and select all required permissions explicitly.

---

## Checking Your Own Permissions

Any logged-in user can see what permissions they have by going to **Profile → My Permissions**. This is a read-only view showing which modules and actions are available to their role.

---

## Changing a User's Role

1. Go to **Admin Panel → Users**
2. Click **Edit** on the target user
3. Change the **Role** dropdown to the desired role
4. Click **Update User**

The new permissions take effect immediately. Active sessions are updated on the next page load.

::: warning
Downgrading a user's role (e.g., from Admin to Employee) takes effect immediately. If the user is currently logged in, they will lose access to restricted areas on their next navigation.
:::
