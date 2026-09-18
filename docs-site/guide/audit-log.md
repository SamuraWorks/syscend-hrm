# Audit Log

The Audit Log is a complete, tamper-evident record of every significant action performed within Syscend-HRM. It captures who did what, when, from which IP address, and what changed.

---

## Accessing the Audit Log

Navigate to **Admin Panel → Audit Log** or go to `/admin/audit-log`. Only users with the **Admin** role can access the audit log by default. This can be adjusted via **Roles & Permissions** by granting the `audit-log.view` permission to other roles.

---

## What Is Logged

The audit log captures the following event types across all modules:

| Event Type | Example |
|------------|---------|
| **Created** | New employee added |
| **Updated** | Employee salary changed |
| **Deleted** | Leave request cancelled |
| **Approved** | Leave request approved |
| **Rejected** | Leave request rejected |
| **Login** | User logged in |
| **Logout** | User logged out |
| **Failed Login** | Invalid password attempt |
| **Password Reset** | Password changed |
| **Settings Changed** | SMTP credentials updated |
| **Payroll Run** | Payroll cycle started or approved |
| **Role Changed** | User role updated |
| **Permission Changed** | Role permissions modified |

---

## Audit Log Entry Structure

Each log entry records:

| Field | Description |
|-------|-------------|
| **Timestamp** | Exact date and time of the action (UTC) |
| **User** | Name and email of the user who performed the action |
| **IP Address** | Client IP address |
| **Module** | Which module was affected (e.g., `Employees`, `Payroll`) |
| **Action** | The type of event (`created`, `updated`, `deleted`, etc.) |
| **Resource** | The specific record affected (e.g., Employee #EMP-042) |
| **Old Values** | Previous field values (for updates) |
| **New Values** | Updated field values (for updates) |

### Example Log Entry

```
2026-04-03 14:22:11 UTC
User: Jane Smith (hr@syscendhrm.test)
IP: 192.168.1.45
Module: Employees
Action: Updated
Resource: Employee #EMP-042 (John Doe)
Changes:
  - department: "Engineering" → "Product"
  - position: "Senior Developer" → "Lead Developer"
```

---

## Filtering the Audit Log

The audit log supports multiple simultaneous filters to help you find specific events quickly.

### Available Filters

| Filter | Description |
|--------|-------------|
| **Search** | Free-text search across user name, email, and resource description |
| **User** | Filter by specific user (dropdown of all users) |
| **Module** | Filter by module (Employees, Payroll, Attendance, etc.) |
| **Action** | Filter by event type (created, updated, deleted, login, etc.) |
| **Date From** | Show entries from this date (inclusive) |
| **Date To** | Show entries up to this date (inclusive) |
| **IP Address** | Filter by specific client IP (useful for security investigations) |

### Using Date Range Filters

To view all payroll-related activity for a specific month:

1. Set **Module** to `Payroll`
2. Set **Date From** to `2026-04-01`
3. Set **Date To** to `2026-04-30`
4. Click **Apply Filters**

---

## Viewing Change Details

For `updated` events, click **View Changes** to see a detailed diff:

- Fields that were changed are highlighted
- Old values are shown in red
- New values are shown in green
- Unchanged fields are not shown

---

## Exporting the Audit Log

The audit log can be exported to CSV for archiving, compliance, or further analysis in spreadsheet tools.

### Export Steps

1. Apply any desired filters to narrow the data set
2. Click **Export CSV** (top right of the log table)
3. The file downloads immediately as `audit-log-YYYY-MM-DD.csv`

### CSV Columns

```
timestamp,user_name,user_email,ip_address,module,action,resource,old_values,new_values
```

::: tip Compliance Archiving
For compliance purposes (e.g., GDPR, SOC 2), export the audit log monthly and store the CSVs in a secure, off-site location. Syscend-HRM retains log entries indefinitely by default.
:::

---

## Configuring Log Retention

By default, audit log entries are retained indefinitely. To configure automatic purging of old entries, set the retention period in your `.env` file:

```ini
AUDIT_LOG_RETENTION_DAYS=365
```

Then run the scheduled cleanup command (add this to your cron or Supervisor):

```bash
php artisan audit:cleanup
```

Or schedule it in `routes/console.php` (Laravel 11+):

```php
Schedule::command('audit:cleanup')->daily();
```

---

## Security Considerations

The audit log is read-only from the admin UI. No user — including Admin — can delete or modify individual log entries through the application interface. This ensures log integrity.

::: warning Database Access
A user with direct database access could modify audit log entries. For high-security environments, consider using a separate audit log database with restricted write permissions, or forwarding logs to an external SIEM tool.
:::

---

## Monitoring Failed Login Attempts

To investigate potential brute-force attacks:

1. Set **Action** filter to `Failed Login`
2. Set a date range covering the suspicious period
3. Look for multiple failed attempts from the same IP address
4. If suspicious activity is found, use the IP address to block access at the web server or firewall level
