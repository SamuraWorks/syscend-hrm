# Attendance API

Endpoints for managing attendance records and clock-in/clock-out operations.

**Base path:** `/api/v1/attendance`

---

## List Attendance Records

```http
GET /api/v1/attendance
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `employee_id` | integer | Filter by employee |
| `department_id` | integer | Filter by department |
| `date` | date | Filter by specific date (`YYYY-MM-DD`) |
| `date_from` | date | Start of date range |
| `date_to` | date | End of date range |
| `month` | integer | Filter by month (1–12) |
| `year` | integer | Filter by year |
| `status` | string | `present`, `late`, `absent`, `half_day`, `holiday`, `weekend`, `on_leave` |
| `page` | integer | Page number |
| `per_page` | integer | Records per page (default: 15) |

### Example Request

```http
GET /api/v1/attendance?employee_id=42&month=4&year=2026
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1201,
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe"
      },
      "date": "2026-04-01",
      "day": "Wednesday",
      "check_in": "08:55",
      "check_out": "17:30",
      "total_hours": 8.58,
      "status": "present",
      "notes": null,
      "created_at": "2026-04-01T08:55:00.000000Z"
    },
    {
      "id": 1202,
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe"
      },
      "date": "2026-04-02",
      "day": "Thursday",
      "check_in": "09:20",
      "check_out": "17:45",
      "total_hours": 8.42,
      "status": "late",
      "notes": "Traffic delay",
      "created_at": "2026-04-02T09:20:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 22
  }
}
```

---

## Check In

Record an employee's check-in time. Used by kiosks, mobile apps, or manual entry.

```http
POST /api/v1/attendance/check-in
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "employee_id": 42,
  "check_in_time": "2026-04-03T08:55:00Z",
  "location": "Main Office",
  "device_id": "KIOSK-01",
  "notes": "Optional notes"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `employee_id` | Yes | Employee ID (integer) |
| `check_in_time` | No | ISO 8601 datetime. Defaults to current server time if omitted. |
| `location` | No | Physical location or "Remote" |
| `device_id` | No | Identifier of the check-in device |
| `notes` | No | Optional notes |

### Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "Check-in recorded successfully",
  "data": {
    "id": 1250,
    "employee_id": 42,
    "date": "2026-04-03",
    "check_in": "08:55",
    "status": "present",
    "location": "Main Office"
  }
}
```

### Error — Already Checked In

**HTTP 422**

```json
{
  "success": false,
  "message": "Employee EMP-042 has already checked in today."
}
```

---

## Check Out

Record an employee's check-out time.

```http
POST /api/v1/attendance/check-out
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "employee_id": 42,
  "check_out_time": "2026-04-03T17:30:00Z",
  "notes": "Leaving on time"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `employee_id` | Yes | Employee ID (integer) |
| `check_out_time` | No | ISO 8601 datetime. Defaults to current server time if omitted. |
| `notes` | No | Optional notes |

### Response

```json
{
  "success": true,
  "message": "Check-out recorded successfully",
  "data": {
    "id": 1250,
    "employee_id": 42,
    "date": "2026-04-03",
    "check_in": "08:55",
    "check_out": "17:30",
    "total_hours": 8.58,
    "status": "present"
  }
}
```

### Error — Not Checked In

**HTTP 422**

```json
{
  "success": false,
  "message": "No active check-in found for employee EMP-042 today."
}
```

---

## Get Attendance for Employee

Retrieve all attendance records for a specific employee.

```http
GET /api/v1/attendance/employee/{id}
Authorization: Bearer {token}
```

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Employee ID |

### Query Parameters

Same as the main List Attendance Records endpoint.

### Response

Same structure as List Attendance Records, filtered to the specified employee.

---

## Get Today's Attendance Status

Check whether a specific employee has checked in today.

```http
GET /api/v1/attendance/today/{employee_id}
Authorization: Bearer {token}
```

### Response — Checked In

```json
{
  "success": true,
  "data": {
    "checked_in": true,
    "checked_out": false,
    "check_in": "08:55",
    "check_out": null,
    "status": "present",
    "total_hours_so_far": 4.5
  }
}
```

### Response — Not Yet Checked In

```json
{
  "success": true,
  "data": {
    "checked_in": false,
    "checked_out": false,
    "check_in": null,
    "check_out": null,
    "status": null
  }
}
```
