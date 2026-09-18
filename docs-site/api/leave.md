# Leave API

Endpoints for managing leave types, leave requests, and approval actions.

**Base path:** `/api/v1/leave`

---

## Leave Types

### List Leave Types

```http
GET /api/v1/leave/types
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Annual Leave",
      "code": "AL",
      "annual_allowance": 21,
      "carry_forward_max": 5,
      "is_paid": true,
      "requires_documentation": false,
      "half_day_allowed": true,
      "applicable_gender": "all",
      "min_notice_days": 2
    },
    {
      "id": 2,
      "name": "Sick Leave",
      "code": "SL",
      "annual_allowance": 14,
      "carry_forward_max": 0,
      "is_paid": true,
      "requires_documentation": true,
      "half_day_allowed": true,
      "applicable_gender": "all",
      "min_notice_days": 0
    }
  ]
}
```

---

## Leave Requests

### List Leave Requests

```http
GET /api/v1/leave/requests
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `employee_id` | integer | Filter by employee |
| `leave_type_id` | integer | Filter by leave type |
| `status` | string | `pending`, `approved`, `rejected`, `cancelled` |
| `date_from` | date | Start of date range (leave start date) |
| `date_to` | date | End of date range |
| `year` | integer | Filter by year |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe",
        "department": "Engineering"
      },
      "leave_type": {
        "id": 1,
        "name": "Annual Leave",
        "is_paid": true
      },
      "start_date": "2026-04-10",
      "end_date": "2026-04-14",
      "total_days": 5,
      "is_half_day": false,
      "half_day_period": null,
      "reason": "Family vacation",
      "status": "pending",
      "applied_at": "2026-04-03T10:00:00.000000Z",
      "approved_by": null,
      "approved_at": null,
      "rejection_reason": null
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 15,
    "total": 30
  }
}
```

---

### Create Leave Request

```http
POST /api/v1/leave/requests
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "employee_id": 42,
  "leave_type_id": 1,
  "start_date": "2026-04-10",
  "end_date": "2026-04-14",
  "is_half_day": false,
  "half_day_period": null,
  "reason": "Family vacation"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `employee_id` | Yes | Employee ID |
| `leave_type_id` | Yes | Leave type ID |
| `start_date` | Yes | First day of leave (`YYYY-MM-DD`) |
| `end_date` | Yes | Last day of leave (`YYYY-MM-DD`) |
| `is_half_day` | No | Boolean (default: false) |
| `half_day_period` | Conditional | `morning` or `afternoon` (required when `is_half_day: true`) |
| `reason` | No | Optional reason text |

#### Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": 102,
    "employee_id": 42,
    "leave_type": { "id": 1, "name": "Annual Leave" },
    "start_date": "2026-04-10",
    "end_date": "2026-04-14",
    "total_days": 5,
    "status": "pending",
    "applied_at": "2026-04-03T10:30:00.000000Z",
    "remaining_balance_after": 11
  }
}
```

#### Error — Insufficient Balance

**HTTP 422**

```json
{
  "success": false,
  "message": "Insufficient leave balance. Requested: 5 days. Available: 3 days."
}
```

---

### Get Leave Request

```http
GET /api/v1/leave/requests/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 101,
    "employee": { "id": 42, "full_name": "John Doe", "employee_id": "EMP-042" },
    "leave_type": { "id": 1, "name": "Annual Leave" },
    "start_date": "2026-04-10",
    "end_date": "2026-04-14",
    "total_days": 5,
    "is_half_day": false,
    "reason": "Family vacation",
    "status": "pending",
    "document_url": null,
    "applied_at": "2026-04-03T10:00:00.000000Z",
    "approved_by": null,
    "approved_at": null,
    "rejection_reason": null
  }
}
```

---

### Update Leave Request

Can only update requests with `pending` status.

```http
PUT /api/v1/leave/requests/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "start_date": "2026-04-11",
  "end_date": "2026-04-15",
  "reason": "Updated: Extended family trip"
}
```

---

### Cancel Leave Request

```http
DELETE /api/v1/leave/requests/{id}
Authorization: Bearer {token}
```

Sets status to `cancelled`. Returns **HTTP 422** if the leave has already started.

---

### Approve Leave Request

```http
PATCH /api/v1/leave/requests/{id}/approve
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "notes": "Approved. Have a great vacation!"
}
```

#### Response

```json
{
  "success": true,
  "message": "Leave request approved",
  "data": {
    "id": 101,
    "status": "approved",
    "approved_by": { "id": 2, "name": "Jane Smith" },
    "approved_at": "2026-04-04T09:00:00.000000Z"
  }
}
```

---

### Reject Leave Request

```http
PATCH /api/v1/leave/requests/{id}/reject
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "rejection_reason": "Critical project deadline during this period. Please reschedule."
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `rejection_reason` | Yes | Reason must be provided for rejection |

#### Response

```json
{
  "success": true,
  "message": "Leave request rejected",
  "data": {
    "id": 101,
    "status": "rejected",
    "rejection_reason": "Critical project deadline during this period. Please reschedule.",
    "rejected_by": { "id": 2, "name": "Jane Smith" },
    "rejected_at": "2026-04-04T09:15:00.000000Z"
  }
}
```

---

## Leave Balances

### Get Employee Leave Balances

```http
GET /api/v1/leave/balances/{employee_id}
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | integer | Year (default: current year) |

#### Response

```json
{
  "success": true,
  "data": {
    "employee": { "id": 42, "full_name": "John Doe" },
    "year": 2026,
    "balances": [
      {
        "leave_type": { "id": 1, "name": "Annual Leave" },
        "allocated": 21,
        "carried_forward": 3,
        "total": 24,
        "used": 8,
        "pending": 5,
        "remaining": 11
      },
      {
        "leave_type": { "id": 2, "name": "Sick Leave" },
        "allocated": 14,
        "carried_forward": 0,
        "total": 14,
        "used": 2,
        "pending": 0,
        "remaining": 12
      }
    ]
  }
}
```
