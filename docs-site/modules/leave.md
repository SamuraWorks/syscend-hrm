# Leave Management

The Leave Management module handles the entire leave lifecycle: configuring leave types and allowances, employee leave submission, multi-step approval workflows, balance tracking, and a visual calendar view. It integrates tightly with the Attendance module to automatically mark approved leave days.

---

## Overview

Navigate to **HR Panel → Leave** or `/leave`. The module is divided into four sections:

| Section | URL | Description |
|---------|-----|-------------|
| **Leave Types** | `/leave/types` | Configure available leave categories |
| **Leave Requests** | `/leave/requests` | All submitted requests |
| **Leave Calendar** | `/leave/calendar` | Monthly visual overview |
| **Leave Balances** | `/leave/balances` | Per-employee balance tracking |

---

## Leave Types

Leave types define the categories of leave available to employees.

### Creating a Leave Type

1. Navigate to **Leave → Leave Types**
2. Click **Add Leave Type**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Type Name** | Yes | e.g., `Annual Leave`, `Sick Leave`, `Casual Leave` |
| **Code** | No | Short code (e.g., `AL`, `SL`) |
| **Annual Allowance** | Yes | Number of days per year employees receive |
| **Carry Forward** | No | Max days that can carry into the next year (0 = no carry forward) |
| **Requires Documentation** | No | If enabled, employees must upload a document (e.g., medical certificate for sick leave) |
| **Half Day Allowed** | No | Whether employees can take 0.5-day increments |
| **Paid / Unpaid** | Yes | Whether this leave type counts as paid |
| **Applicable Gender** | No | Restrict to Male, Female, or All (for maternity/paternity) |
| **Min Notice Days** | No | How many days in advance the request must be submitted |
| **Description** | No | Internal description |

4. Click **Save**

### Default Leave Types (from Demo Seeder)

| Type | Days/Year | Paid | Notes |
|------|-----------|------|-------|
| Annual Leave | 21 | Yes | Standard paid holiday |
| Sick Leave | 14 | Yes | Requires medical note after 3 days |
| Casual Leave | 7 | Yes | Short notice leave |
| Maternity Leave | 90 | Yes | Female employees only |
| Paternity Leave | 7 | Yes | Male employees only |
| Unpaid Leave | Unlimited | No | No allowance cap |

---

## Leave Balances

Each employee's leave balance is tracked per leave type per year.

### Viewing Balances

1. Navigate to **Leave → Balances**
2. Filter by year and/or employee
3. The table shows: Allocated, Used, Pending (awaiting approval), and Remaining days

| Column | Calculation |
|--------|-------------|
| **Allocated** | Annual allowance + carried forward from previous year |
| **Used** | Approved and completed leave days |
| **Pending** | Submitted but not yet approved |
| **Remaining** | Allocated − Used − Pending |

### Balance Reset

Leave balances reset at the start of each financial year (configured in Settings). The system:
1. Calculates any carry-forward entitlements
2. Creates new balance records for the new year
3. Resets the used count to 0

---

## Submitting a Leave Request

### Employee Self-Service

Employees can submit their own leave requests:

1. Navigate to **Leave → My Requests**
2. Click **Apply for Leave**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| **Leave Type** | Yes | Select from available types |
| **Start Date** | Yes | First day of leave |
| **End Date** | Yes | Last day of leave |
| **Half Day** | No | Toggle for a half-day request (shows AM/PM option) |
| **Reason** | No | Optional explanation |
| **Supporting Document** | Conditional | Required if the leave type has `Requires Documentation` enabled |

4. Click **Submit**

The system:
- Calculates the total leave days (excluding weekends and holidays)
- Checks that the employee has sufficient balance
- Creates the request with status **Pending**
- Notifies the reporting manager via email (if SMTP configured)

::: warning Insufficient Balance
If the employee does not have enough remaining days, the system shows a warning. The request can still be submitted (for manager override), but the manager is alerted to the balance issue.
:::

### HR/Admin Submitting on Behalf of Employee

HR staff can submit leave on behalf of any employee:

1. Navigate to **Leave → Requests → Add Request**
2. Select the **Employee** from the dropdown
3. Complete the form as above
4. Click **Submit**

---

## Approval Workflow

Leave requests follow this status flow:

```
Pending → Approved
        → Rejected
        → Cancelled (by employee, before approval)
```

### Approving a Request

1. Navigate to **Leave → Requests**
2. Find the pending request (filter by Status = Pending)
3. Click **Review**
4. Review the request details, dates, and remaining balance
5. Click **Approve** or **Reject**
6. Add an optional note (required for rejections)

On approval:
- The leave balance is updated (pending days move to used)
- The attendance records for the leave period are updated to **On Leave** status
- The employee is notified via email

On rejection:
- The balance is not deducted
- The employee is notified with the rejection reason

### Manager Approval Flow

If a manager is assigned as the employee's reporting manager:
- The manager receives an email notification on submission
- The manager can approve/reject from their **Leave → Team Requests** view
- HR Managers can override any approval

---

## Half-Day Leave

When **Half Day Allowed** is enabled for a leave type:

1. Employee toggles **Half Day** when submitting
2. Selects **Morning** or **Afternoon**
3. The system deducts **0.5 days** from the balance
4. The attendance record shows **Half Day** status

---

## Leave Calendar

The leave calendar at `/leave/calendar` shows a monthly view of:

- All approved leave requests (colour-coded by leave type)
- Public holidays
- Weekends

Use it to:
- Spot conflicts (multiple team members on leave on the same day)
- Plan leave allocation
- Review team availability before approving new requests

### Calendar Views

| View | Description |
|------|-------------|
| **Month** | Full month grid with day-by-day leave indicators |
| **Team** | Filter by department to see only one team's leave |
| **Employee** | Focus on one employee's leave history |

---

## Exporting Leave Data

From **Leave → Requests**:

1. Filter by date range, type, and/or status
2. Click **Export CSV**
3. File downloads as `leave-requests-YYYY-MM-DD.csv`

The export includes all leave request details including status, reason, and approver name.
