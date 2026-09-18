# Performance API

Endpoints for accessing performance appraisal cycles and individual ratings.

**Base path:** `/api/v1/performance`

---

## Appraisal Cycles

### List Cycles

```http
GET /api/v1/performance/cycles
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `draft`, `active`, `completed` |
| `year` | integer | Filter by year (based on start date) |
| `department_id` | integer | Filter by department scope |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "Annual Appraisal 2026",
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "review_deadline": "2027-01-31",
      "status": "active",
      "department": null,
      "total_employees": 50,
      "completed_count": 35,
      "pending_count": 15,
      "average_score": 3.42,
      "created_at": "2025-12-15T10:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Mid-Year Review 2025",
      "start_date": "2025-01-01",
      "end_date": "2025-06-30",
      "review_deadline": "2025-07-31",
      "status": "completed",
      "department": null,
      "total_employees": 48,
      "completed_count": 48,
      "pending_count": 0,
      "average_score": 3.58,
      "created_at": "2024-12-20T10:00:00.000000Z"
    }
  ]
}
```

---

### Get Cycle

```http
GET /api/v1/performance/cycles/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Annual Appraisal 2026",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "review_deadline": "2027-01-31",
    "status": "active",
    "description": "Company-wide annual performance appraisal",
    "department": null,
    "total_employees": 50,
    "completed_count": 35,
    "pending_count": 15,
    "average_score": 3.42,
    "rating_distribution": {
      "outstanding": 8,
      "excellent": 12,
      "good": 10,
      "average": 4,
      "poor": 1,
      "pending": 15
    },
    "created_by": { "id": 1, "name": "Admin User" },
    "created_at": "2025-12-15T10:00:00.000000Z"
  }
}
```

---

## Performance Ratings

### List Ratings

```http
GET /api/v1/performance/ratings
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | integer | Filter by appraisal cycle |
| `employee_id` | integer | Filter by employee |
| `status` | string | `pending_self`, `pending_manager`, `completed` |
| `rating_label` | string | `outstanding`, `excellent`, `good`, `average`, `poor` |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 201,
      "cycle": { "id": 3, "name": "Annual Appraisal 2026" },
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe",
        "department": "Engineering",
        "position": "Senior Developer"
      },
      "self_score": 4.2,
      "manager_score": 3.8,
      "final_score": 3.96,
      "rating_label": "excellent",
      "self_submitted_at": "2027-01-15T10:00:00.000000Z",
      "manager_submitted_at": "2027-01-20T14:00:00.000000Z",
      "finalised_at": "2027-01-31T09:00:00.000000Z",
      "status": "completed"
    }
  ]
}
```

---

### Get Rating

```http
GET /api/v1/performance/ratings/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 201,
    "cycle": { "id": 3, "name": "Annual Appraisal 2026" },
    "employee": {
      "id": 42,
      "employee_id": "EMP-042",
      "full_name": "John Doe",
      "department": "Engineering"
    },
    "criteria_scores": {
      "self": {
        "work_quality": 4,
        "productivity": 5,
        "communication": 4,
        "teamwork": 4,
        "problem_solving": 4,
        "goal_achievement": 4,
        "overall_comment": "I delivered all Q1 and Q2 features on time and mentored two junior developers."
      },
      "manager": {
        "work_quality": 4,
        "productivity": 4,
        "communication": 3,
        "teamwork": 4,
        "problem_solving": 4,
        "goal_achievement": 4,
        "overall_comment": "John consistently delivers quality work. Communication with stakeholders could be improved."
      }
    },
    "self_score": 4.17,
    "manager_score": 3.83,
    "final_score": 3.96,
    "rating_label": "excellent",
    "status": "completed",
    "self_submitted_at": "2027-01-15T10:00:00.000000Z",
    "manager_submitted_at": "2027-01-20T14:00:00.000000Z",
    "finalised_at": "2027-01-31T09:00:00.000000Z"
  }
}
```

---

### Get Employee's Own Rating (Self-Service)

Employees can retrieve their own rating for a cycle:

```http
GET /api/v1/performance/my-rating?cycle_id=3
Authorization: Bearer {token}
```

Returns the same structure as Get Rating but restricted to the authenticated user's own record.
