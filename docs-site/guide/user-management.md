# User Management

Syscend-HRM separates **Users** (login accounts) from **Employees** (HR records). A user account grants access to the system; an employee record stores HR data. The two are linked, but can exist independently.

---

## Accessing User Management

Navigate to **Admin Panel → Users** or go to `/admin/users`. This section is only visible to users with the **Admin** role.

---

## Creating a User

1. Click **Add User** (top right)
2. Fill in the required fields:

| Field | Required | Description |
|-------|----------|-------------|
| **Name** | Yes | Full display name |
| **Email** | Yes | Must be unique; used as login identifier |
| **Password** | Yes | Minimum 8 characters |
| **Role** | Yes | Select from available roles |
| **Employee** | No | Link to an existing employee record |
| **Status** | Yes | `Active` or `Inactive` |

3. Click **Create User**

The user receives a welcome email (if SMTP is configured) with a link to set their password.

::: tip Linking to an Employee
When a user account is linked to an employee record, the employee's profile information (name, department, position) is automatically reflected in their user account. This ensures consistency across HR records and login sessions.
:::

---

## Editing a User

1. Find the user in the list using the search bar or filters
2. Click the **Edit** icon (pencil) in the Actions column
3. Modify any field except the password (use the password reset function for that)
4. Click **Update User**

---

## Resetting a Password

### Admin Reset

1. Locate the user in the Users list
2. Click the **More** (ellipsis) menu → **Reset Password**
3. Enter a new password and confirm
4. Click **Reset** — the user can log in immediately with the new password

### User Self-Reset

Users can reset their own password via the login page:

1. Click **Forgot Password** on the login screen
2. Enter their registered email address
3. A password reset link is emailed to them (requires SMTP to be configured)
4. They click the link and set a new password

---

## Deactivating a User

Deactivating a user prevents them from logging in without deleting their account or any associated data.

1. Open the user's edit form
2. Change **Status** to `Inactive`
3. Click **Update User**

The user will be logged out of any active sessions immediately.

To reactivate, repeat the process and set **Status** back to `Active`.

---

## Deleting a User

::: warning
Deleting a user is irreversible. Their login account is permanently removed. Any linked employee record remains intact.
:::

1. Click the **More** (ellipsis) menu → **Delete User**
2. Confirm the deletion in the confirmation dialog

---

## Filtering and Searching Users

The user list supports the following filters:

| Filter | Options |
|--------|---------|
| **Search** | By name or email |
| **Role** | Filter by any assigned role |
| **Status** | Active / Inactive |

Results are paginated with 15 users per page by default.

---

## User Audit Trail

Every action a user takes (create, update, delete operations across all modules) is recorded in the **Audit Log**. See [Audit Log](/guide/audit-log) for details.

---

## Bulk Operations

From the Users list, you can select multiple users and:

- **Deactivate selected** — Set all selected users to Inactive
- **Activate selected** — Set all selected users to Active
- **Delete selected** — Permanently remove selected users (use with caution)

Select users using the checkbox in each row, then use the **Bulk Actions** dropdown.
