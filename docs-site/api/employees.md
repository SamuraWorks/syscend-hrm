# Employees API

The Employees API provides full CRUD access to employee records.

**Base path:** `/api/v1/employees`

---

## List Employees

```http
GET /api/v1/employees
Authorization: Bearer {token}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Results per page (default: 15, max: 100) |
| `search` | string | Search by name, email, or employee ID |
| `department_id` | integer | Filter by department |
| `position_id` | integer | Filter by position |
| `status` | string | Filter by status: `active`, `on_leave`, `suspended`, `terminated` |
| `employment_type` | string | `full_time`, `part_time`, `contract`, `intern` |
| `gender` | string | `male`, `female`, `other` |
| `sort` | string | Sort field: `name`, `hire_date`, `employee_id` (default: `name`) |
| `order` | string | `asc` or `desc` (default: `asc`) |

### Example Request

```http
GET /api/v1/employees?department_id=3&status=active&per_page=25
Authorization: Bearer {token}
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": "EMP-001",
      "first_name": "Jane",
      "last_name": "Smith",
      "full_name": "Jane Smith",
      "email": "jane.smith@company.com",
      "phone": "+1-555-0101",
      "gender": "female",
      "department": {
        "id": 3,
        "name": "Engineering"
      },
      "position": {
        "id": 7,
        "title": "Senior Developer"
      },
      "employment_type": "full_time",
      "status": "active",
      "hire_date": "2024-03-15",
      "avatar_url": "https://your-domain.com/storage/avatars/1.jpg"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 25,
    "total": 50
  }
}
```

---

## Create Employee

```http
POST /api/v1/employees
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1-555-0101",
  "gender": "female",
  "date_of_birth": "1990-06-15",
  "national_id": "A12345678",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "US",
    "postal_code": "10001"
  },
  "department_id": 3,
  "position_id": 7,
  "reporting_manager_id": 5,
  "hire_date": "2026-04-01",
  "employment_type": "full_time",
  "probation_end_date": "2026-07-01",
  "work_location": "office"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `first_name` | string | Max 100 characters |
| `last_name` | string | Max 100 characters |
| `email` | string | Must be unique |
| `department_id` | integer | Must exist in departments table |
| `position_id` | integer | Must belong to the selected department |
| `hire_date` | date | Format: `YYYY-MM-DD` |
| `employment_type` | string | `full_time`, `part_time`, `contract`, `intern` |

### Success Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 51,
    "employee_id": "EMP-051",
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    "email": "jane.smith@company.com",
    "department": { "id": 3, "name": "Engineering" },
    "position": { "id": 7, "title": "Senior Developer" },
    "status": "active",
    "hire_date": "2026-04-01",
    "created_at": "2026-04-03T14:22:11.000000Z"
  }
}
```

---

## Get Employee

```http
GET /api/v1/employees/{id}
Authorization: Bearer {token}
```

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Employee ID (integer) |

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": "EMP-001",
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    "email": "jane.smith@company.com",
    "phone": "+1-555-0101",
    "gender": "female",
    "date_of_birth": "1990-06-15",
    "national_id": "A12345678",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "US",
      "postal_code": "10001"
    },
    "department": { "id": 3, "name": "Engineering" },
    "position": { "id": 7, "title": "Senior Developer" },
    "reporting_manager": {
      "id": 5,
      "full_name": "Michael Brown",
      "employee_id": "EMP-005"
    },
    "employment_type": "full_time",
    "status": "active",
    "hire_date": "2024-03-15",
    "probation_end_date": "2024-06-15",
    "work_location": "office",
    "avatar_url": "https://your-domain.com/storage/avatars/1.jpg",
    "created_at": "2024-03-15T09:00:00.000000Z",
    "updated_at": "2026-01-10T11:30:00.000000Z"
  }
}
```

### Error — Not Found

**HTTP 404**

```json
{
  "success": false,
  "message": "Employee not found"
}
```

---

## Update Employee

```http
PUT /api/v1/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

Send only the fields you want to update:

```json
{
  "department_id": 4,
  "position_id": 9,
  "status": "active",
  "phone": "+1-555-0202"
}
```

### Response

```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": 1,
    "employee_id": "EMP-001",
    "full_name": "Jane Smith",
    "department": { "id": 4, "name": "Product" },
    "position": { "id": 9, "title": "Product Manager" },
    "status": "active",
    "updated_at": "2026-04-03T15:00:00.000000Z"
  }
}
```

---

## Delete (Archive) Employee

Soft-deletes the employee. Their record is retained but hidden from active employee lists.

```http
DELETE /api/v1/employees/{id}
Authorization: Bearer {token}
```

### Response

**HTTP 204 No Content**

No response body on success.

### Error — Cannot Delete

If the employee has unprocessed payroll or pending leave, the delete is blocked:

**HTTP 422**

```json
{
  "success": false,
  "message": "Cannot archive employee with pending payroll records. Process or cancel pending payroll first."
}
```
