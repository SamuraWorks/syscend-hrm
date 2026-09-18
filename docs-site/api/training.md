# Training API

Endpoints for accessing and managing training courses, sessions, and enrollments.

**Base path:** `/api/v1/training`

---

## Courses

### List Courses

```http
GET /api/v1/training/courses
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by course title |
| `category` | string | `technical`, `soft_skills`, `compliance`, `leadership`, `onboarding`, `safety` |
| `delivery_mode` | string | `in_person`, `online`, `hybrid`, `self_paced` |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Leadership Essentials",
      "category": "leadership",
      "delivery_mode": "in_person",
      "duration_hours": 8,
      "cost_per_participant": 200.00,
      "provider": "external",
      "provider_name": "Leadership Academy",
      "pass_score": 70,
      "total_sessions": 3,
      "total_enrollments": 24,
      "created_at": "2026-01-10T00:00:00.000000Z"
    }
  ]
}
```

---

### Get Course

```http
GET /api/v1/training/courses/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Leadership Essentials",
    "category": "leadership",
    "delivery_mode": "in_person",
    "duration_hours": 8,
    "cost_per_participant": 200.00,
    "provider": "external",
    "provider_name": "Leadership Academy",
    "description": "A foundational course covering key leadership principles and team management strategies.",
    "prerequisites": [],
    "pass_score": 70,
    "total_sessions": 3,
    "total_enrollments": 24,
    "completion_rate": 87.5,
    "average_score": 78.3,
    "upcoming_sessions": [
      {
        "id": 8,
        "start_date": "2026-05-15",
        "end_date": "2026-05-15",
        "location": "Training Room A",
        "available_spots": 5,
        "max_participants": 20
      }
    ],
    "created_at": "2026-01-10T00:00:00.000000Z"
  }
}
```

---

## Sessions

### List Sessions

```http
GET /api/v1/training/sessions
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `course_id` | integer | Filter by course |
| `status` | string | `scheduled`, `in_progress`, `completed`, `cancelled` |
| `date_from` | date | Sessions starting from this date |
| `date_to` | date | Sessions starting before this date |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "course": { "id": 1, "title": "Leadership Essentials" },
      "session_name": "May Cohort",
      "start_date": "2026-05-15T09:00:00.000000Z",
      "end_date": "2026-05-15T17:00:00.000000Z",
      "location": "Training Room A",
      "facilitator": {
        "id": 10,
        "full_name": "Sarah Williams"
      },
      "max_participants": 20,
      "enrolled_count": 15,
      "available_spots": 5,
      "status": "scheduled"
    }
  ]
}
```

---

## Enrollments

### List Enrollments

```http
GET /api/v1/training/enrollments
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `employee_id` | integer | Filter by employee |
| `session_id` | integer | Filter by session |
| `course_id` | integer | Filter by course |
| `status` | string | `enrolled`, `completed`, `failed`, `absent`, `cancelled` |
| `year` | integer | Filter by year |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 301,
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe"
      },
      "session": {
        "id": 8,
        "course": { "id": 1, "title": "Leadership Essentials" },
        "start_date": "2026-05-15",
        "location": "Training Room A"
      },
      "status": "enrolled",
      "score": null,
      "passed": null,
      "feedback": null,
      "enrolled_at": "2026-04-03T11:00:00.000000Z",
      "completed_at": null
    }
  ]
}
```

---

### Create Enrollment

Enroll one or more employees in a training session.

```http
POST /api/v1/training/enrollments
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "session_id": 8,
  "employee_ids": [42, 43, 44]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `session_id` | Yes | Training session ID |
| `employee_ids` | Yes | Array of employee IDs to enroll |

#### Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "3 employees enrolled successfully",
  "data": {
    "enrolled_count": 3,
    "enrollments": [
      { "id": 301, "employee_id": 42, "status": "enrolled" },
      { "id": 302, "employee_id": 43, "status": "enrolled" },
      { "id": 303, "employee_id": 44, "status": "enrolled" }
    ],
    "session_available_spots": 2
  }
}
```

#### Error — Session Full

**HTTP 422**

```json
{
  "success": false,
  "message": "Session is at capacity. Only 2 spots remaining. You requested 3 enrollments."
}
```

---

### Mark Enrollment as Complete

```http
PATCH /api/v1/training/enrollments/{id}/complete
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "score": 82,
  "feedback": "John demonstrated strong leadership understanding throughout the course.",
  "certificate_url": null
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `score` | No | Numeric score 0–100 |
| `feedback` | No | Trainer feedback text |
| `certificate_url` | No | URL to uploaded certificate (if any) |

#### Response

```json
{
  "success": true,
  "message": "Enrollment marked as completed",
  "data": {
    "id": 301,
    "employee": { "id": 42, "full_name": "John Doe" },
    "status": "completed",
    "score": 82,
    "passed": true,
    "feedback": "John demonstrated strong leadership understanding throughout the course.",
    "completed_at": "2026-05-15T17:10:00.000000Z"
  }
}
```
