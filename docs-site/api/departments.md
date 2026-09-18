# Departments & Positions API

Endpoints for managing the organisational structure — departments and positions.

---

## Departments

**Base path:** `/api/v1/departments`

---

### List Departments

```http
GET /api/v1/departments
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by department name |
| `parent_id` | integer | Filter by parent department (use `0` for top-level) |
| `with_count` | boolean | Include employee count per department |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Engineering",
      "code": "ENG",
      "parent_id": null,
      "head": {
        "id": 5,
        "full_name": "Michael Brown",
        "employee_id": "EMP-005"
      },
      "employee_count": 12,
      "children_count": 3,
      "created_at": "2026-01-01T00:00:00.000000Z"
    },
    {
      "id": 2,
      "name": "Human Resources",
      "code": "HR",
      "parent_id": null,
      "head": {
        "id": 2,
        "full_name": "Jane Smith",
        "employee_id": "EMP-002"
      },
      "employee_count": 4,
      "children_count": 0,
      "created_at": "2026-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### Create Department

```http
POST /api/v1/departments
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "DevOps",
  "code": "DEVOPS",
  "parent_id": 1,
  "head_employee_id": 8,
  "description": "Infrastructure, CI/CD, and cloud operations"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Department name (must be unique) |
| `code` | No | Short code identifier |
| `parent_id` | No | ID of parent department for nesting |
| `head_employee_id` | No | Employee ID of the department head |
| `description` | No | Department description |

#### Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 9,
    "name": "DevOps",
    "code": "DEVOPS",
    "parent_id": 1,
    "head": { "id": 8, "full_name": "Alex Chen" },
    "created_at": "2026-04-03T14:00:00.000000Z"
  }
}
```

---

### Get Department

```http
GET /api/v1/departments/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Engineering",
    "code": "ENG",
    "parent_id": null,
    "parent": null,
    "head": {
      "id": 5,
      "full_name": "Michael Brown",
      "employee_id": "EMP-005"
    },
    "description": "Product development and engineering",
    "children": [
      { "id": 3, "name": "Backend" },
      { "id": 4, "name": "Frontend" },
      { "id": 9, "name": "DevOps" }
    ],
    "employee_count": 12,
    "created_at": "2026-01-01T00:00:00.000000Z"
  }
}
```

---

### Update Department

```http
PUT /api/v1/departments/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "name": "Engineering & DevOps",
  "head_employee_id": 10
}
```

#### Response

```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": 1,
    "name": "Engineering & DevOps",
    "updated_at": "2026-04-03T15:00:00.000000Z"
  }
}
```

---

### Delete Department

```http
DELETE /api/v1/departments/{id}
Authorization: Bearer {token}
```

Returns **HTTP 422** if the department has active employees or positions.

```json
{
  "success": false,
  "message": "Cannot delete department with active employees. Reassign all employees first."
}
```

---

## Positions

**Base path:** `/api/v1/positions`

---

### List Positions

```http
GET /api/v1/positions
Authorization: Bearer {token}
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `department_id` | integer | Filter positions by department |
| `level` | string | Filter by level: `junior`, `mid`, `senior`, `lead`, `manager`, `director` |
| `search` | string | Search by position title |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "title": "Senior Developer",
      "department": { "id": 3, "name": "Engineering" },
      "level": "senior",
      "min_salary": 60000,
      "max_salary": 90000,
      "employee_count": 5
    }
  ]
}
```

---

### Create Position

```http
POST /api/v1/positions
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "title": "Backend Engineer",
  "department_id": 3,
  "level": "mid",
  "min_salary": 45000,
  "max_salary": 65000,
  "description": "Build and maintain server-side application logic"
}
```

#### Response

**HTTP 201 Created**

```json
{
  "success": true,
  "message": "Position created successfully",
  "data": {
    "id": 21,
    "title": "Backend Engineer",
    "department": { "id": 3, "name": "Engineering" },
    "level": "mid",
    "min_salary": 45000,
    "max_salary": 65000
  }
}
```

---

### Get Position

```http
GET /api/v1/positions/{id}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 7,
    "title": "Senior Developer",
    "department": { "id": 3, "name": "Engineering" },
    "level": "senior",
    "description": "Lead technical development of core product features",
    "min_salary": 60000,
    "max_salary": 90000,
    "employee_count": 5,
    "created_at": "2026-01-01T00:00:00.000000Z"
  }
}
```

---

### Update Position

```http
PUT /api/v1/positions/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Request Body

```json
{
  "title": "Senior Backend Engineer",
  "max_salary": 95000
}
```

---

### Delete Position

```http
DELETE /api/v1/positions/{id}
Authorization: Bearer {token}
```

Returns **HTTP 422** if the position has active employees assigned.
