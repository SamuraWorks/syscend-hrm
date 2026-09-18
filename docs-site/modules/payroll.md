# Payroll & Compensation

The Payroll module handles the complete compensation lifecycle: defining salary components, building reusable salary structures, assigning compensation packages to employees, running payroll cycles, and generating downloadable payslips. A two-pass calculation engine ensures accurate tax and net pay computations.

---

## Overview

Navigate to **HR Panel → Payroll** or `/payroll`. The module is divided into:

| Section | URL | Description |
|---------|-----|-------------|
| **Salary Components** | `/payroll/components` | Individual earning, deduction, and tax components |
| **Salary Structures** | `/payroll/structures` | Reusable packages built from components |
| **Employee Salaries** | `/payroll/employee-salaries` | Assign structures + amounts to employees |
| **Payroll Runs** | `/payroll/runs` | Process payroll for a period |
| **Payslips** | `/payroll/payslips` | View and download individual payslips |

---

## Salary Components

Salary components are the building blocks of compensation. Each component represents a single line on a payslip — a basic salary, house rent allowance, income tax, provident fund deduction, etc.

### Component Types

| Type | Description |
|------|-------------|
| **Earning** | Money paid to the employee (adds to gross pay) |
| **Deduction** | Money subtracted from the gross pay |
| **Tax** | A special deduction type calculated as a percentage or via a tax slab |

### Calculation Types

| Calculation Type | Description | Example |
|-----------------|-------------|---------|
| **Fixed** | A constant amount per period | `Basic Salary = 5,000` |
| **% of Basic** | A percentage of the Basic Salary component | `HRA = 40% of Basic` |
| **% of Gross** | A percentage of the total gross earnings | `Provident Fund = 8% of Gross` |
| **Formula** | A custom formula combining other components | `Performance Bonus = Basic × KPI Score` |

### Creating a Salary Component

1. Navigate to **Payroll → Salary Components**
2. Click **Add Component**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Component Name** | Yes | e.g., `Basic Salary`, `House Rent Allowance` |
| **Short Name** | No | Abbreviation for payslip (e.g., `BASIC`, `HRA`) |
| **Type** | Yes | Earning / Deduction / Tax |
| **Calculation Type** | Yes | Fixed / % of Basic / % of Gross |
| **Value** | Yes | Amount or percentage |
| **Taxable** | No | Whether this component is included in taxable income calculation |
| **Description** | No | Internal notes |

4. Click **Save**

---

## Salary Structures

A salary structure is a named collection of components. You create one structure per employment level or compensation tier, then assign it to multiple employees.

### Example Structures

| Structure Name | Components |
|---------------|------------|
| **Junior Staff** | Basic, HRA (40%), Transport (Fixed), Income Tax (15%) |
| **Senior Staff** | Basic, HRA (50%), Transport (Fixed), Medical (Fixed), Income Tax (20%) |
| **Management** | Basic, HRA (60%), Car Allowance, Mobile Allowance, Income Tax (25%) |

### Creating a Salary Structure

1. Navigate to **Payroll → Salary Structures**
2. Click **Add Structure**
3. Enter a **Structure Name**
4. Add components by clicking **Add Component Row**:
   - Select the component
   - Optionally override the default value (e.g., increase the HRA % for this structure)
5. Click **Save**

---

## Assigning Salary to an Employee

Before an employee appears in a payroll run, they must have a salary assigned.

1. Navigate to **Payroll → Employee Salaries**
2. Click **Assign Salary**
3. Select the **Employee**
4. Select a **Salary Structure**
5. Enter the **Basic Salary** amount (fixed components and percentages are calculated from this)
6. Set the **Effective Date** (the date from which this salary is valid)
7. Click **Save**

Salary history is tracked — you can add a new salary record (with a new effective date) to record a raise. The system uses the salary that was effective at the time of the payroll run date.

---

## Running Payroll

### Step 1: Create a Payroll Run

1. Navigate to **Payroll → Runs**
2. Click **New Payroll Run**
3. Configure:

| Field | Description |
|-------|-------------|
| **Period** | Month and year (e.g., `April 2026`) |
| **Pay Date** | Date employees will be paid |
| **Department** | `All` or a specific department |
| **Notes** | Optional internal notes |

4. Click **Generate Payroll**

The system:
- Fetches all active employees with salary assignments
- Calculates each component for each employee using the 2-pass engine
- Creates individual payroll records
- Sets the run status to **Draft**

### Step 2: Review the Draft

In the Draft state, you can:
- Review individual payslip calculations
- Manually override any component value for specific employees
- Add one-off bonuses or deductions
- Remove specific employees from this run

### Step 3: Approve the Payroll Run

Once you are satisfied with the calculations:

1. Click **Approve Run**
2. Confirm in the dialog
3. Status changes to **Approved**

In the Approved state, individual records are locked. No further edits are possible without reverting the run.

### Step 4: Mark as Paid

After bank transfers are completed:

1. Click **Mark as Paid**
2. Optionally upload a payment reference file
3. Status changes to **Paid**

Payslips are now available for employees to download from their self-service portal.

### Payroll Run Status Flow

```
Draft → Approved → Paid
      ↑ (Revert to Draft if errors found)
```

---

## Two-Pass Calculation Engine

Syscend-HRM uses a two-pass calculation model to ensure accuracy for percentage-based components that depend on totals:

### Pass 1: Calculate All Non-Dependent Components

- All **Fixed** earnings
- All **% of Basic** components (using the assigned basic salary)

### Pass 2: Calculate Dependent Components

- **% of Gross** components (using the gross total from Pass 1)
- **Tax** calculations (applied after all earnings are summed)

This ensures that tax and gross-dependent deductions always reference the final, correct totals rather than intermediate values.

---

## Payslip Generation and Download

Payslips are generated for each employee in every payroll run.

### Viewing a Payslip (Admin/HR)

1. Navigate to **Payroll → Payslips**
2. Filter by employee, period, or run
3. Click **View** to see the payslip in the browser
4. Click **Download PDF** to generate a PDF version

### Employee Self-Service Payslip Download

Employees can access their own payslips:

1. Log in and navigate to **My Profile → My Payslips**
2. Select the desired period
3. Click **Download PDF**

### Payslip PDF Contents

| Section | Content |
|---------|---------|
| **Header** | Company logo, name, address |
| **Employee Info** | Name, ID, department, position, period |
| **Earnings** | Itemised list of all earning components |
| **Deductions** | Itemised list of all deduction components |
| **Tax** | Calculated tax amount |
| **Summary** | Gross Pay, Total Deductions, Net Pay |
| **Footer** | Pay date, payment method |

---

## Payroll Reports

Navigate to **Reports → Payroll** to access:

- Monthly payroll cost by department
- Year-to-date payroll summary
- Component breakdown (what portion is basic vs. allowances)
- Year-over-year comparison chart

See [Reports & Analytics](/modules/reports) for full details.
