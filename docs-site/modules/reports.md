# Reports & Analytics

The Reports module is Syscend-HRM's unified analytics dashboard. It consolidates data from all modules into visual, filterable dashboards that help HR teams, managers, and executives make data-driven decisions about their workforce.

---

## Overview

Navigate to **HR Panel → Reports** or `/reports`. The module contains the following report sections:

| Report | URL | Data Source |
|--------|-----|-------------|
| **Overview Dashboard** | `/reports` | All modules |
| **Headcount** | `/reports/headcount` | Employees |
| **Attendance** | `/reports/attendance` | Attendance module |
| **Leave** | `/reports/leave` | Leave module |
| **Payroll** | `/reports/payroll` | Payroll module |
| **Training** | `/reports/training` | Training module |
| **Performance** | `/reports/performance` | Performance module |

---

## Overview Dashboard

The Overview Dashboard provides a high-level snapshot of the entire HR function on a single page.

### KPI Cards

| Card | Metric |
|------|--------|
| **Total Employees** | Active headcount |
| **New This Month** | Employees hired in the current month |
| **On Leave Today** | Count of employees with active approved leave |
| **Pending Leave** | Leave requests awaiting approval |
| **Upcoming Birthdays** | Employees with birthdays in the next 7 days |
| **Pending Probations** | Employees whose probation ends within 30 days |
| **Open Positions** | Active job postings |
| **Upcoming Training** | Sessions starting in the next 7 days |

### Charts on Overview

1. **Headcount by Department** — Horizontal bar chart showing employee count per department
2. **Gender Distribution** — Pie chart
3. **Employment Type Mix** — Donut chart (Full-time vs. Part-time vs. Contract vs. Intern)
4. **Monthly Hires vs. Exits** — Line chart for the last 12 months
5. **Leave Status This Month** — Stacked bar (Approved / Pending / Rejected)

---

## Headcount Report

The Headcount Report provides detailed workforce composition analytics.

### Available Filters

| Filter | Options |
|--------|---------|
| **As of Date** | Snapshot on any past or current date |
| **Department** | One or all departments |
| **Position** | One or all positions |
| **Employment Type** | Full-time, Part-time, Contract, Intern |
| **Gender** | Male, Female, Other |
| **Status** | Active, On Leave, etc. |

### Report Sections

#### Breakdown by Department

| Column | Description |
|--------|-------------|
| Department | Department name |
| Total | Total headcount |
| Male | Male employee count |
| Female | Female employee count |
| Full-time | Full-time employees |
| Part-time | Part-time employees |

#### Breakdown by Gender

Pie chart and table showing gender distribution.

#### Breakdown by Contract Type

Donut chart and table: Full-time / Part-time / Contract / Intern percentages.

#### Tenure Buckets

| Bucket | Description |
|--------|-------------|
| < 1 Year | Employees hired less than 12 months ago |
| 1–2 Years | |
| 2–5 Years | |
| 5–10 Years | |
| 10+ Years | Highly tenured employees |

Table and bar chart showing how the workforce is distributed across tenure brackets.

#### Age Distribution

Employees grouped by age bracket:
- Under 25
- 25–34
- 35–44
- 45–54
- 55+

---

## Attendance Report

The Attendance Report provides a month-by-month view of workforce attendance patterns.

### Month Navigator

Use the **Previous** / **Next** arrows or the month/year selector to navigate between periods.

### Summary KPIs

For the selected month:

| Metric | Description |
|--------|-------------|
| Total Working Days | Number of workdays in the month |
| Average Attendance Rate | % of employees present (or on approved leave) on an average day |
| Total Absent Days | Sum of all Absent records |
| Total Late Days | Sum of all Late records |
| Total Half Days | Sum of all Half Day records |

### Stacked Bar Chart

A day-by-day stacked bar chart for the selected month shows:
- Present (green)
- Late (yellow)
- Absent (red)
- On Leave (purple)
- Weekend/Holiday (grey)

### Employee-Level Detail Table

| Column | Description |
|--------|-------------|
| Employee | Name and ID |
| Department | Department |
| Present | Days present |
| Late | Days late |
| Absent | Days absent |
| Half Days | Half-day count |
| Leave Days | Approved leave days |
| Attendance % | Present+Late / Total Working Days |

---

## Leave Report

The Leave Report shows leave utilisation across employees, leave types, and time periods.

### Year Filter

Select the year to view. The report always covers full financial years.

### Leave by Type

Pie chart and table showing:
- Total days requested per leave type
- Days approved vs. rejected per type

### Monthly Leave Trend

Line chart: total approved leave days per month over 12 months. Useful for spotting seasonal leave spikes.

### Employee Leave Summary

For each employee in the selected year:

| Column | Description |
|--------|-------------|
| Employee | Name and department |
| Annual Leave Used | Days of annual leave taken |
| Sick Leave Used | Days of sick leave taken |
| Other Leave Used | Days of other leave types |
| Total Leave Days | Sum of all leave |
| Remaining Balance | Annual leave remaining |

---

## Payroll Report

The Payroll Report provides a financial overview of compensation expenditure.

### Yearly Breakdown

Monthly payroll cost chart for the selected year:
- Total Gross Pay
- Total Deductions
- Total Net Pay

Each bar in the chart shows the three components stacked.

### Department Cost Analysis

| Column | Description |
|--------|-------------|
| Department | Department name |
| Total Gross | Total gross payroll for the period |
| Total Deductions | Total deductions |
| Total Net | Total net payroll |
| Avg Salary | Average salary per employee |
| Employee Count | Employees in payroll runs |

### Year-over-Year Comparison

Side-by-side bar chart comparing total payroll cost for the current year vs. previous year, month by month.

---

## Training Report

See [Training & Development → Training Reports](/modules/training#training-reports) for the full training analytics description.

Key metrics:
- Completion rates by category
- Monthly training activity
- Department training coverage
- Top courses by enrollment and completion

---

## Performance Report

See [Performance Management → Performance Reports](/modules/performance#performance-reports) for the full performance analytics description.

Key metrics:
- Rating distribution chart
- Cycle summary table
- Department comparison
- Individual performance history

---

## Exporting Reports

All reports support CSV export:

1. Apply the desired filters
2. Click **Export CSV** (top right of the report)
3. The export includes all data in the filtered view

For chart exports (PNG):

1. Hover over any chart
2. Click the **...** menu (top right of the chart)
3. Select **Download PNG** or **Download SVG**
