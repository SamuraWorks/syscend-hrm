# System Administration

The System Administration module is the control centre of Syscend-HRM. It provides super-admin and HR Manager level access to manage users, define roles and permissions, configure system-wide settings (branding, SMTP, SMS), and review a full audit trail of all actions taken across the platform.

Navigate to **Administration** in the left sidebar to access all four sections.

---

## User Management

**URL:** `/admin/users`  
**Access:** Admin only

User Management allows you to control who can log in to Syscend-HRM and what role they hold.

### User List

The user index displays all system accounts in a searchable, filterable table:

| Column | Description |
|--------|-------------|
| Name | Full name of the user |
| Email | Login email address |
| Role | Assigned Spatie role badge |
| Status | Active (green) or Inactive (red) |
| Actions | Edit, Toggle Active, Reset Password |

Use the **Search** field to find users by name or email. Use the **Role** dropdown to filter by role.

### Creating a User

1. Click **Add User** (top-right).
2. Fill in the form:
   - **Name** — full name
   - **Email** — must be unique
   - **Password** — minimum 8 characters (shown/hidden toggle)
   - **Role** — select from available roles
3. Click **Create User**.

The new user can immediately log in at `/login`.

::: tip Linking to an Employee
After creating a user account, link it to the corresponding employee record by editing the employee and assigning the `user_id`. This enables features like self-service leave requests and payslip access.
:::

### Editing a User

Click **Edit** on any user row. You can update:
- Name and email
- Role assignment
- Password (leave blank to keep existing password)

### Activating / Deactivating Users

Click **Toggle Active** on any user row. A confirmation modal appears before the change is applied.

- **Deactivated users** cannot log in but their data is preserved.
- All their historical records (audit logs, payslips, leave requests) remain intact.

::: warning Core Account Protection
The primary Admin account cannot be deactivated. Attempting to do so will return a permission error.
:::

### Resetting Passwords

Click **Reset Password** on any user row. After confirmation, the user's password is reset to the system default: `Admin@1234`.

Instruct the user to change their password immediately after next login.

---

## Roles & Permissions

**URL:** `/admin/roles`  
**Access:** Admin only

Syscend-HRM uses Spatie's role-permission package. Roles are assigned to users, and permissions are assigned to roles. The Roles & Permissions page provides a visual matrix to manage this.

### Built-in Roles

Six core roles are pre-configured and cannot be renamed or deleted:

| Role | Typical User | Access Level |
|------|-------------|--------------|
| **Admin** | System administrator | Full access to all modules and settings |
| **HR Manager** | Head of HR department | Full HR access; no system settings |
| **Manager** | Department/team lead | View own team; approve leaves/attendance |
| **Employee** | Regular staff member | Self-service only (own profile, payslip, leave) |
| **Recruiter** | Recruitment specialist | Recruitment & ATS module only |
| **Finance** | Finance/payroll team | Payroll and compensation module |

Core roles display a **lock icon** — their names cannot be edited and they cannot be deleted.

### Permission Categories

Permissions are grouped by module prefix. Each permission follows the naming convention `module.action`:

| Prefix | Example Permissions |
|--------|-------------------|
| `employees` | `employees.view`, `employees.create`, `employees.edit`, `employees.delete` |
| `payroll` | `payroll.view`, `payroll.run`, `payroll.approve` |
| `leave` | `leave.view`, `leave.approve`, `leave.manage` |
| `attendance` | `attendance.view`, `attendance.manage` |
| `recruitment` | `recruitment.view`, `recruitment.manage` |
| `performance` | `performance.view`, `performance.manage`, `performance.finalise` |
| `training` | `training.view`, `training.manage` |
| `documents` | `documents.view`, `documents.manage` |
| `reports` | `reports.view` |
| `admin` | `admin.users`, `admin.roles`, `admin.settings` |

### Permission Matrix

The right panel of the Roles page shows a permission matrix:

1. **Select a role** from the left panel.
2. The right panel loads all permissions grouped by module.
3. Each module group has a **Select All** checkbox at the top.
4. Check/uncheck individual permissions.
5. Click **Save Permissions** to apply.

Changes take effect immediately — no server restart required.

### Creating Custom Roles

1. Click **Add Role** (top of the left panel).
2. Enter a role name (e.g. `Accountant`, `Intern`, `Payroll Clerk`).
3. Click **Create**.
4. The new role appears in the list — click it to assign permissions.

### Deleting Custom Roles

Custom roles (non-core) can be deleted if they have **zero users** assigned. Click the delete icon next to the role name. A confirmation modal appears before deletion.

::: warning
Deleting a role with users assigned will fail. Reassign all users to a different role first.
:::

---

## System Settings

**URL:** `/admin/settings`  
**Access:** Admin only

System Settings is organised into six tabs. All settings are stored in the `system_settings` database table as key-value pairs and take effect immediately.

### General Tab

Core organisation information:

| Field | Description |
|-------|-------------|
| Organisation Name | Displayed in reports and documents |
| Organisation Email | Default sender/reply-to for system emails |
| Phone | Contact number for official documents |
| Address | Used in payslips and company documents |

### Appearance Tab

Controls the look and feel of the application:

**App Name**
The name displayed in the browser tab title and sidebar heading. Defaults to `Syscend-HRM`.

**Footer Copyright Text**
Text shown at the bottom of the sidebar on every page. Example:
```
© 2026 Acme Corp. All rights reserved.
```

**Logo Upload**
Upload your company logo (PNG, JPG, SVG, WebP — max 2 MB). Once uploaded:
- The logo appears in the top-left of the sidebar replacing the default icon.
- Stored at `storage/app/public/branding/`.
- Accessible via `/storage/branding/filename.ext`.

::: tip Best Logo Size
Use an image with a height of 28–40px or a square format. Transparent PNG or SVG works best on both light and dark backgrounds.
:::

### Regional Tab

| Field | Options |
|-------|---------|
| Timezone | UTC, Europe/London, Asia/Dhaka, America/New_York, and 10+ others |
| Date Format | YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Mon DD YYYY |
| Currency | SLL, USD, EUR, GBP, BDT, AED, etc. |
| Currency Symbol | $, €, £, ৳, ﷼, etc. |

### Payroll Tab

| Field | Description |
|-------|-------------|
| Financial Year Start | Month number (1 = January, 4 = April, 7 = July) |

This controls which month is used as the start of financial year in payroll reports.

### Email (SMTP) Tab

Configure outgoing email for notifications, password resets, and payslip delivery.

| Field | Description |
|-------|-------------|
| Mailer | `smtp` (recommended), `sendmail`, `log` (dev) |
| Host | SMTP server hostname |
| Port | Usually `587` (TLS) or `465` (SSL) |
| Username | SMTP username / email address |
| Password | SMTP password (stored encrypted) |
| Encryption | `tls`, `ssl`, or none |
| From Address | Sender email shown to recipients |
| From Name | Sender name (e.g. "Syscend-HRM Notifications") |

**Common SMTP Providers:**

| Provider | Host | Port | Encryption |
|----------|------|------|------------|
| Gmail | smtp.gmail.com | 587 | TLS |
| Mailgun | smtp.mailgun.org | 587 | TLS |
| Mailtrap (dev) | sandbox.smtp.mailtrap.io | 2525 | TLS |
| SendGrid | smtp.sendgrid.net | 587 | TLS |
| Outlook/365 | smtp.office365.com | 587 | STARTTLS |

**Send Test Email**  
After saving SMTP settings, use the test email field at the bottom of the tab. Enter any email address and click **Send Test**. You will see an immediate success or error message — no page reload required.

### SMS Tab

Configure outgoing SMS notifications (optional).

| Field | Description |
|-------|-------------|
| Provider | Twilio, Nexmo, Vonage, Africa's Talking, Custom |
| API Key | Provider API key or Account SID |
| API Secret | Provider auth token or API secret |
| From | Sender number or name |
| SMS Enabled | Toggle to enable/disable SMS globally |

**Provider-specific notes:**

**Twilio:**
- API Key = Account SID (starts with `AC...`)
- API Secret = Auth Token
- From = Twilio phone number (e.g. `+14155552671`)

**Nexmo / Vonage:**
- API Key = Vonage API key
- API Secret = Vonage API secret
- From = Alphanumeric sender name (max 11 chars) or phone number

**Africa's Talking:**
- API Key = Username
- API Secret = API key from dashboard
- From = Shortcode or sender ID

::: warning SMS Billing
SMS usage is billed by your provider. Enable SMS only after confirming your account has credits and the correct sender ID is approved.
:::

---

## Audit Log

**URL:** `/admin/audit-log`  
**Access:** Admin, HR Manager

The Audit Log records every significant action taken in Syscend-HRM: who did what, in which module, and when. It is immutable — entries cannot be edited or deleted.

### What Gets Logged

| Module | Logged Actions |
|--------|---------------|
| Employees | Created, updated, deleted |
| Payroll | Run created, approved, paid; payslip generated |
| Leave | Request submitted, approved, rejected |
| Recruitment | Job posted, candidate status changed, offer made |
| Performance | Cycle created, rating submitted, finalised |
| Training | Course created, enrollment, completion |
| Documents | Uploaded, acknowledged, deleted |
| Settings | System settings updated, logo changed |
| Users | Created, role changed, deactivated, password reset |
| Roles | Permissions updated, custom role created/deleted |

### Filters

Use the filter bar at the top of the Audit Log to narrow down entries:

| Filter | Description |
|--------|-------------|
| User | Filter by who performed the action |
| Module | Filter by module name (Employees, Payroll, etc.) |
| Date From | Start of date range |
| Date To | End of date range |
| Search | Text search in the description field |

### Log Entry Fields

Each entry displays:
- **Timestamp** — exact date and time
- **User** — name of the user who performed the action
- **Module** — which module was affected
- **Action** — colour-coded badge (created = green, updated = blue, deleted = red, approved = teal)
- **Description** — human-readable summary of what changed

### Exporting to CSV

Click **Export CSV** (top-right). The export respects all active filters — only the currently filtered entries are exported.

The CSV includes: `id`, `timestamp`, `user_name`, `module`, `action`, `description`, `ip_address`.

::: tip Compliance Use
The Audit Log CSV export is useful for compliance audits, security reviews, and incident investigations. Store exports securely as they may contain sensitive user activity data.
:::

### Log Retention

By default, all audit log entries are retained indefinitely. For high-traffic systems, consider adding a scheduled command to archive or delete entries older than your retention policy (e.g. 2 years).

---

## Security Recommendations

| Area | Recommendation |
|------|---------------|
| Default passwords | Change all demo account passwords immediately after installation |
| Admin account | Use a strong, unique password; enable 2FA if configured |
| SMTP password | Use an app-specific password, not your main account password |
| SMS secrets | Rotate API keys periodically from your provider dashboard |
| Audit log | Review weekly for unexpected admin actions |
| User deactivation | Deactivate accounts promptly when staff leave |
| Role assignment | Follow least-privilege — assign the most restrictive role that meets the user's needs |
