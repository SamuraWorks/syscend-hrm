# Organizational Structure

The Organization module defines the structural hierarchy of your company — departments, positions, and the reporting relationships between employees. It forms the backbone of Syscend-HRM, as almost every other module (employees, leave, attendance, reports) depends on the organisational structure.

---

## Overview

The Organisation module is accessible at **HR Panel → Organisation**. It consists of three main sections:

| Section | URL | Description |
|---------|-----|-------------|
| **Departments** | `/departments` | Company divisions or teams |
| **Positions** | `/positions` | Job titles and roles within departments |
| **Org Chart** | `/org-chart` | Visual tree representation of the hierarchy |

---

## Departments

Departments represent the primary organisational units of your company — for example: Engineering, Human Resources, Finance, Marketing.

### Creating a Department

1. Navigate to **Organisation → Departments**
2. Click **Add Department**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| **Department Name** | Yes | Full name (e.g., `Engineering`) |
| **Department Code** | No | Short identifier (e.g., `ENG`) |
| **Department Head** | No | Select an employee as the head of this department |
| **Parent Department** | No | For nested structures (e.g., `Backend` under `Engineering`) |
| **Description** | No | Brief description of the department's function |

4. Click **Save**

### Editing a Department

1. Click the **Edit** icon next to the department name
2. Modify the desired fields
3. Click **Update Department**

::: tip Changing Department Head
When you assign a new department head, the previous head's designation is automatically updated. The Org Chart reflects the change immediately.
:::

### Deleting a Department

Departments cannot be deleted if they have:
- Active employees assigned to them
- Active positions linked to them

To delete a department:
1. Reassign or archive all employees in the department
2. Delete all positions under it
3. Then delete the department

### Department Hierarchy

You can nest departments to create sub-departments:

```
Company
├── Engineering
│   ├── Backend
│   ├── Frontend
│   └── DevOps
├── Human Resources
├── Finance
└── Marketing
    ├── Digital
    └── Content
```

Set the **Parent Department** when creating or editing a department to establish the hierarchy.

---

## Positions

Positions (also called job titles or roles) represent specific roles that exist within departments. An employee is assigned to exactly one position at any given time.

### Creating a Position

1. Navigate to **Organisation → Positions**
2. Click **Add Position**
3. Fill in the form:

| Field | Required | Description |
|-------|----------|-------------|
| **Position Title** | Yes | Job title (e.g., `Senior Software Engineer`) |
| **Department** | Yes | Which department this position belongs to |
| **Position Level** | No | Seniority level (Junior / Mid / Senior / Lead / Manager / Director / VP / C-Level) |
| **Description** | No | Key responsibilities of this position |
| **Min Salary** | No | Salary band minimum |
| **Max Salary** | No | Salary band maximum |

4. Click **Save**

### Position-Department Filtering

In the **Add/Edit Employee** form, the **Position** dropdown automatically filters to show only positions that belong to the selected department. If you change the department, the position dropdown resets and reloads with the new department's positions.

This ensures employees are always assigned to valid department-position combinations.

### Editing and Deleting Positions

- Click **Edit** to modify position details
- Positions with active employees assigned cannot be deleted
- Reassign employees before deleting a position

---

## Reporting Structure

Every employee can have a **Reporting Manager** set on their profile. This creates the reporting hierarchy used for:

- Manager-level leave approvals (a manager can approve their direct reports' leave)
- Performance scoring (managers score their direct reports)
- Org chart visualisation
- Department-level report filtering

### Setting a Reporting Manager

1. Open an employee's profile
2. Click **Edit**
3. In the **Reporting Manager** field, search and select the manager
4. Save

::: warning Circular Reporting
The system prevents circular reporting relationships. If Employee A reports to Employee B, you cannot set Employee B to report to Employee A.
:::

---

## Org Chart

The Org Chart at `/org-chart` provides a visual tree diagram of the entire reporting hierarchy.

### Features

| Feature | Description |
|---------|-------------|
| **Zoom** | Scroll to zoom in/out of the tree |
| **Pan** | Click and drag to navigate large charts |
| **Node Click** | Click an employee node to view their profile |
| **Department Filter** | Show only a specific department subtree |
| **Export** | Download the chart as PNG or PDF |

### Org Chart Node

Each node displays:
- Employee profile photo (or initials avatar)
- Full name
- Position title
- Department

Lines connect employees to their reporting managers.

---

## Department Reports Integration

In the Reports module, all analytics (headcount, attendance, leave) can be filtered by department and position. The department and position structure defined here directly controls what filters are available in every report.

---

## Best Practices

- Define your full department structure before importing employees
- Assign department heads to all departments so the org chart reflects actual reporting lines
- Use position levels consistently to enable useful analytics (e.g., headcount by seniority)
- Nest sub-departments only if your organisation genuinely has that hierarchy — flat structures are easier to manage for smaller teams
