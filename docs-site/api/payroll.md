# Payroll API

Read-only endpoints for accessing payroll runs and payslip data.

**Base path:** `/api/v1/payroll`

::: tip
Payroll runs must be initiated and approved through the admin panel. The API provides read access to processed payroll data and individual payslips.
:::

---

## Payroll Runs

### List Payroll Runs

```http
GET /api/v1/payroll/runs
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | `draft`, `approved`, `paid` |
| `month` | integer | Filter by month (1–12) |
| `year` | integer | Filter by year |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "name": "April 2026 Payroll",
      "period_month": 4,
      "period_year": 2026,
      "pay_date": "2026-04-30",
      "status": "approved",
      "total_employees": 50,
      "total_gross": 250000.00,
      "total_deductions": 45000.00,
      "total_net": 205000.00,
      "created_by": { "id": 1, "name": "Admin User" },
      "approved_by": { "id": 1, "name": "Admin User" },
      "approved_at": "2026-04-28T10:00:00.000000Z",
      "created_at": "2026-04-25T09:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 6
  }
}
```

---

### Get Payroll Run

```http
GET /api/v1/payroll/runs/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 12,
    "name": "April 2026 Payroll",
    "period_month": 4,
    "period_year": 2026,
    "pay_date": "2026-04-30",
    "status": "approved",
    "notes": "Regular monthly payroll run",
    "total_employees": 50,
    "total_gross": 250000.00,
    "total_deductions": 45000.00,
    "total_net": 205000.00,
    "department_breakdown": [
      {
        "department": "Engineering",
        "employee_count": 12,
        "total_gross": 96000.00,
        "total_net": 80000.00
      },
      {
        "department": "Human Resources",
        "employee_count": 4,
        "total_gross": 28000.00,
        "total_net": 24000.00
      }
    ],
    "created_by": { "id": 1, "name": "Admin User" },
    "approved_by": { "id": 1, "name": "Admin User" },
    "approved_at": "2026-04-28T10:00:00.000000Z",
    "created_at": "2026-04-25T09:00:00.000000Z"
  }
}
```

---

## Payslips

### List Payslips

```http
GET /api/v1/payroll/payslips
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `employee_id` | integer | Filter by employee |
| `payroll_run_id` | integer | Filter by payroll run |
| `month` | integer | Filter by month |
| `year` | integer | Filter by year |
| `status` | string | `draft`, `approved`, `paid` |
| `page` | integer | Page number |
| `per_page` | integer | Records per page |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 501,
      "employee": {
        "id": 42,
        "employee_id": "EMP-042",
        "full_name": "John Doe",
        "department": "Engineering",
        "position": "Senior Developer"
      },
      "payroll_run": {
        "id": 12,
        "name": "April 2026 Payroll",
        "period": "April 2026"
      },
      "gross_pay": 7500.00,
      "total_deductions": 1350.00,
      "net_pay": 6150.00,
      "status": "approved",
      "pay_date": "2026-04-30"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 4,
    "per_page": 15,
    "total": 50
  }
}
```

---

### Get Payslip

```http
GET /api/v1/payroll/payslips/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 501,
    "employee": {
      "id": 42,
      "employee_id": "EMP-042",
      "full_name": "John Doe",
      "department": "Engineering",
      "position": "Senior Developer"
    },
    "payroll_run": {
      "id": 12,
      "name": "April 2026 Payroll",
      "period_month": 4,
      "period_year": 2026,
      "pay_date": "2026-04-30"
    },
    "salary_structure": "Senior Staff Package",
    "earnings": [
      { "component": "Basic Salary", "type": "earning", "amount": 5000.00 },
      { "component": "House Rent Allowance", "type": "earning", "amount": 2000.00 },
      { "component": "Transport Allowance", "type": "earning", "amount": 500.00 }
    ],
    "deductions": [
      { "component": "Provident Fund", "type": "deduction", "amount": 600.00 },
      { "component": "Income Tax", "type": "tax", "amount": 750.00 }
    ],
    "gross_pay": 7500.00,
    "total_deductions": 1350.00,
    "net_pay": 6150.00,
    "status": "approved",
    "pay_date": "2026-04-30",
    "pdf_url": "https://your-domain.com/api/v1/payroll/payslips/501/pdf",
    "created_at": "2026-04-25T09:05:00.000000Z"
  }
}
```

---

### Download Payslip PDF

```http
GET /api/v1/payroll/payslips/{id}/pdf
Authorization: Bearer {token}
```

Returns a PDF file with `Content-Type: application/pdf`. The response is a binary file stream, not a JSON object.

::: tip
Employees can only download their own payslips. HR Managers and Admins can download any employee's payslip.
:::
