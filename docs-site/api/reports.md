# Reports API

Read-only endpoints for retrieving aggregated HR analytics data.

**Base path:** `/api/v1/reports`

All report endpoints require authentication and return pre-aggregated data suitable for dashboards, custom visualisations, or third-party BI tools.

---

## Headcount Report

Returns workforce composition statistics.

```http
GET /api/v1/reports/headcount
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `as_of_date` | date | Snapshot date (default: today) |
| `department_id` | integer | Filter by department |
| `employment_type` | string | `full_time`, `part_time`, `contract`, `intern` |

### Response

```json
{
  "success": true,
  "data": {
    "as_of_date": "2026-04-03",
    "total_headcount": 50,
    "active": 47,
    "on_leave": 2,
    "suspended": 1,
    "by_department": [
      { "department": "Engineering", "count": 12, "male": 9, "female": 3 },
      { "department": "Human Resources", "count": 4, "male": 1, "female": 3 },
      { "department": "Finance", "count": 5, "male": 3, "female": 2 },
      { "department": "Marketing", "count": 6, "male": 2, "female": 4 }
    ],
    "by_employment_type": {
      "full_time": 40,
      "part_time": 4,
      "contract": 5,
      "intern": 1
    },
    "by_gender": {
      "male": 28,
      "female": 21,
      "other": 1
    },
    "by_tenure": {
      "under_1_year": 8,
      "1_to_2_years": 12,
      "2_to_5_years": 18,
      "5_to_10_years": 9,
      "over_10_years": 3
    },
    "by_age_group": {
      "under_25": 5,
      "25_to_34": 18,
      "35_to_44": 16,
      "45_to_54": 8,
      "55_plus": 3
    }
  }
}
```

---

## Attendance Report

Returns attendance statistics for a specific month.

```http
GET /api/v1/reports/attendance
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | integer | Yes | Month number (1–12) |
| `year` | integer | Yes | Year (e.g., `2026`) |
| `department_id` | integer | No | Filter by department |

### Example Request

```http
GET /api/v1/reports/attendance?month=4&year=2026
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "data": {
    "month": 4,
    "year": 2026,
    "period": "April 2026",
    "working_days": 22,
    "total_employees": 50,
    "summary": {
      "total_present_days": 946,
      "total_late_days": 84,
      "total_absent_days": 52,
      "total_half_days": 18,
      "total_leave_days": 110,
      "average_attendance_rate": 93.6
    },
    "daily_breakdown": [
      {
        "date": "2026-04-01",
        "day": "Wednesday",
        "present": 44,
        "late": 4,
        "absent": 2,
        "on_leave": 3,
        "half_day": 1
      },
      {
        "date": "2026-04-02",
        "day": "Thursday",
        "present": 45,
        "late": 3,
        "absent": 1,
        "on_leave": 2,
        "half_day": 2
      }
    ],
    "by_department": [
      {
        "department": "Engineering",
        "present_rate": 95.2,
        "late_rate": 4.1,
        "absent_rate": 0.7
      }
    ]
  }
}
```

---

## Leave Report

Returns leave utilisation statistics for a full year.

```http
GET /api/v1/reports/leave
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | integer | Yes | Year (e.g., `2026`) |
| `department_id` | integer | No | Filter by department |
| `leave_type_id` | integer | No | Filter by leave type |

### Example Request

```http
GET /api/v1/reports/leave?year=2026
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "total_requests": 145,
    "approved_requests": 120,
    "rejected_requests": 15,
    "pending_requests": 10,
    "total_days_approved": 387,
    "by_leave_type": [
      {
        "leave_type": "Annual Leave",
        "requests": 72,
        "approved": 65,
        "days_approved": 245,
        "avg_days_per_request": 3.8
      },
      {
        "leave_type": "Sick Leave",
        "requests": 38,
        "approved": 36,
        "days_approved": 82,
        "avg_days_per_request": 2.3
      }
    ],
    "monthly_trend": [
      { "month": 1, "month_name": "January", "total_days": 32 },
      { "month": 2, "month_name": "February", "total_days": 28 },
      { "month": 3, "month_name": "March", "total_days": 25 },
      { "month": 4, "month_name": "April", "total_days": 41 }
    ],
    "top_leave_takers": [
      { "employee": "John Doe", "department": "Engineering", "total_days": 22 },
      { "employee": "Jane Smith", "department": "HR", "total_days": 18 }
    ]
  }
}
```

---

## Payroll Report

Returns payroll cost analysis for a full year.

```http
GET /api/v1/reports/payroll
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | integer | Yes | Year (e.g., `2026`) |
| `department_id` | integer | No | Filter by department |

### Example Request

```http
GET /api/v1/reports/payroll?year=2026
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "total_gross": 750000.00,
    "total_deductions": 135000.00,
    "total_net": 615000.00,
    "average_salary": 15000.00,
    "monthly_breakdown": [
      {
        "month": 1,
        "month_name": "January",
        "total_gross": 248000.00,
        "total_deductions": 44640.00,
        "total_net": 203360.00,
        "employee_count": 48
      },
      {
        "month": 2,
        "month_name": "February",
        "total_gross": 250000.00,
        "total_deductions": 45000.00,
        "total_net": 205000.00,
        "employee_count": 49
      }
    ],
    "by_department": [
      {
        "department": "Engineering",
        "total_gross": 300000.00,
        "total_net": 250000.00,
        "employee_count": 12,
        "avg_salary": 25000.00
      }
    ],
    "year_over_year": {
      "current_year_total": 750000.00,
      "previous_year_total": 680000.00,
      "growth_percentage": 10.29
    }
  }
}
```

---

## Training Report

Returns training completion and effectiveness analytics.

```http
GET /api/v1/reports/training
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `year` | integer | Filter by year |
| `department_id` | integer | Filter by department |

### Response

```json
{
  "success": true,
  "data": {
    "year": 2026,
    "total_enrollments": 156,
    "completed": 128,
    "failed": 8,
    "absent": 12,
    "pending": 8,
    "overall_completion_rate": 82.1,
    "by_category": [
      {
        "category": "Technical",
        "enrollments": 60,
        "completions": 52,
        "completion_rate": 86.7,
        "avg_score": 79.4
      },
      {
        "category": "Leadership",
        "enrollments": 30,
        "completions": 26,
        "completion_rate": 86.7,
        "avg_score": 74.2
      }
    ],
    "department_coverage": [
      {
        "department": "Engineering",
        "total_employees": 12,
        "trained_employees": 11,
        "coverage_rate": 91.7
      }
    ]
  }
}
```

---

## Performance Report

Returns performance appraisal summary data.

```http
GET /api/v1/reports/performance
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cycle_id` | integer | Filter by specific cycle |
| `year` | integer | Filter by year |
| `department_id` | integer | Filter by department |

### Response

```json
{
  "success": true,
  "data": {
    "cycle": { "id": 2, "name": "Annual Appraisal 2025" },
    "total_assessed": 48,
    "average_score": 3.58,
    "rating_distribution": {
      "outstanding": { "count": 9, "percentage": 18.75 },
      "excellent": { "count": 15, "percentage": 31.25 },
      "good": { "count": 14, "percentage": 29.17 },
      "average": { "count": 8, "percentage": 16.67 },
      "poor": { "count": 2, "percentage": 4.17 }
    },
    "by_department": [
      {
        "department": "Engineering",
        "employee_count": 12,
        "average_score": 3.72,
        "outstanding": 3,
        "excellent": 5,
        "good": 3,
        "average": 1,
        "poor": 0
      }
    ]
  }
}
```
