# Authentication

Syscend-HRM's API uses **Laravel Sanctum** with Bearer token authentication. All API requests (except login) must include a valid token in the `Authorization` header.

---

## Login

Exchange credentials for a Bearer token.

```http
POST /api/v1/auth/login
Content-Type: application/json
```

### Request Body

```json
{
  "email": "admin@syscendhrm.test",
  "password": "Admin@1234"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered user email |
| `password` | string | Yes | User password |

### Success Response

**HTTP 200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "1|eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@syscendhrm.test",
      "role": "Admin",
      "created_at": "2026-01-01T00:00:00.000000Z"
    }
  }
}
```

### Error Response — Invalid Credentials

**HTTP 401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid credentials. Please check your email and password."
}
```

### Error Response — Validation Failed

**HTTP 422 Unprocessable Entity**

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Using the Token

Once you have the token, include it in all subsequent requests:

```http
Authorization: Bearer 1|eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

::: warning Token Security
Store tokens securely. Do not log tokens or expose them in URLs. Use environment variables or secure vaults in your application.
:::

---

## Logout

Revoke the current token, immediately invalidating it.

```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### Request Body

None required.

### Success Response

**HTTP 200 OK**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

After logout, the token is deleted from the database. Any further requests using this token will receive a `401 Unauthorized` response.

---

## Get Current User

Retrieve the profile of the currently authenticated user.

```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

### Success Response

**HTTP 200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@syscendhrm.test",
    "role": "Admin",
    "permissions": [
      "employees.view",
      "employees.create",
      "employees.edit",
      "employees.delete",
      "payroll.run",
      "payroll.approve",
      "settings.access"
    ],
    "employee": {
      "id": 1,
      "employee_id": "EMP-001",
      "department": "Human Resources",
      "position": "HR Director"
    },
    "created_at": "2026-01-01T00:00:00.000000Z",
    "last_login_at": "2026-04-03T14:22:11.000000Z"
  }
}
```

---

## Token Expiry

By default, API tokens do not expire. You can configure token expiry in `config/sanctum.php`:

```php
'expiration' => 60 * 24 * 30, // 30 days in minutes
```

When a token expires, requests return:

**HTTP 401 Unauthorized**

```json
{
  "success": false,
  "message": "Token has expired. Please log in again."
}
```

---

## Multiple Tokens per User

A single user can have multiple active tokens (useful for mobile app + API client scenarios). Each login call creates a new token. Use the logout endpoint to revoke a specific token. Admins can revoke all tokens for a user via the Admin panel under **Users → Revoke All Tokens**.
