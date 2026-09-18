# Attendance & Shifts

The Attendance module tracks when employees are present, absent, late, or on leave. It supports both manual attendance entry by HR staff and API-driven clock-in/out for kiosk or mobile integrations. Attendance data flows into reports, payroll calculations, and compliance monitoring.

---

## Overview

Navigate to **HR Panel → Attendance** or `/attendance`. The module provides:

- Daily attendance recording per employee
- Shift management
- Attendance status tracking with colour-coded indicators
- Monthly attendance reports
- API endpoints for clock-in/clock-out integrations

---

## Attendance Statuses

Every attendance record has one of the following statuses:

| Status | Badge Colour | Description |
|--------|-------------|-------------|
| **Present** | Green | Employee attended for the full working day |
| **Late** | Yellow | Employee arrived after the defined late threshold |
| **Absent** | Red | Employee did not attend and has no approved leave |
| **Half Day** | Orange | Employee attended for half of the standard working hours |
| **Holiday** | Blue | Public or company holiday — no attendance required |
| **Weekend** | Grey | Non-working day per the employee's shift schedule |
| **On Leave** | Purple | Employee has approved leave for this day (synced from Leave module) |

::: tip Automatic Holiday and Weekend Marking
When you record attendance for a period, the system automatically marks days that fall on weekends (based on the employee's shift) or configured public holidays as **Weekend** or **Holiday**. You do not need to manually enter these.
:::

---

## Shift Management

Shifts define the working hours schedule for a group of employees.

### Creating a Shift

1. Navigate to **Attendance → Shifts**
2. Click **Add Shift**
3. Fill in the shift details:

| Field | Required | Description |
|-------|----------|-------------|
| **Shift Name** | Yes | Descriptive name (e.g., `Day Shift`, `Night Shift`) |
| **Start Time** | Yes | When the shift begins (e.g., `09:00`) |
| **End Time** | Yes | When the shift ends (e.g., `18:00`) |
| **Late After** | No | Minutes after start time before an arrival is marked Late (e.g., `15`) |
| **Working Days** | Yes | Checkboxes for Mon–Sun (select all days this shift works) |
| **Break Duration** | No | Total break time in minutes (e.g., `60`) |

4. Click **Save Shift**

### Assigning a Shift to an Employee

1. Open an employee's profile
2. Click **Edit**
3. Select a **Shift** from the dropdown
4. Save

All employees on the same shift share the same schedule. If a single employee has a different schedule, create a custom shift for them.

---

## Recording Attendance Manually

HR staff can record attendance for any employee or date.

### Single-Day Entry

1. Navigate to **Attendance → Add Attendance**
2. Select the employee
3. Select the date
4. Choose the status (Present, Late, Absent, Half Day)
5. If Present or Late, enter **Check-in Time** and **Check-out Time**
6. Add optional notes
7. Click **Save**

### Bulk Attendance Entry

To record attendance for an entire team or date range:

1. Navigate to **Attendance → Bulk Entry**
2. Select the **Department** and **Date Range**
3. The system lists all employees in that department
4. Click the status for each employee on each day
5. Click **Save All**

---

## Attendance Report

The monthly attendance report is available at **Reports → Attendance**.

| Column | Description |
|--------|-------------|
| Employee | Name and ID |
| Department | Employee's current department |
| Present Days | Count of Present status records |
| Late Days | Count of Late status records |
| Absent Days | Count of Absent status records |
| Half Days | Count of Half Day records |
| Leave Days | Count of On Leave records |
| Total Working Days | Present + Late + Half (0.5 each) |

### Filters Available

| Filter | Options |
|--------|---------|
| Month | 1–12 |
| Year | Any year with data |
| Department | All departments |
| Employee | Specific employee |
| Status | Specific attendance status |

---

## API Check-In / Check-Out

Syscend-HRM provides API endpoints for integrating with physical time clocks, kiosks, or mobile apps.

### Check-In

```http
POST /api/v1/attendance/check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 42,
  "check_in_time": "2026-04-03T08:55:00Z",
  "location": "Main Office",
  "device_id": "KIOSK-01"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Check-in recorded",
  "data": {
    "id": 1201,
    "employee_id": 42,
    "date": "2026-04-03",
    "check_in": "08:55",
    "status": "Present"
  }
}
```

### Check-Out

```http
POST /api/v1/attendance/check-out
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 42,
  "check_out_time": "2026-04-03T17:30:00Z"
}
```

---

## Late Threshold Configuration

The late threshold determines how many minutes after the shift start time an arrival is classified as **Late** rather than **Present**.

1. Go to **Settings → Attendance**
2. Set **Late Arrival Threshold** (in minutes, e.g., `15`)
3. Save

Any check-in more than 15 minutes after shift start will be automatically marked as **Late**.

---

## Leave and Attendance Sync

When a leave request is **Approved** in the Leave module, the corresponding attendance days are automatically updated:

- Status is set to **On Leave**
- Check-in and check-out times are cleared
- The leave type is stored on the attendance record for reporting

This sync prevents double-entry and ensures leave days are not counted as absent in reports.

---

## Exporting Attendance Data

From the Attendance list:

1. Apply any desired filters (month, department, status)
2. Click **Export CSV**
3. The file downloads as `attendance-YYYY-MM.csv`

The export includes all filtered records with all columns.
