# Performance Management

The Performance Management module enables structured, fair, and data-driven employee appraisals. It supports configurable review cycles where employees complete self-assessments, managers provide ratings, and HR finalises scores. The module includes comprehensive reporting on rating distributions and cycle summaries.

---

## Overview

Navigate to **HR Panel → Performance** or `/performance`. The module consists of:

| Section | URL | Description |
|---------|-----|-------------|
| **Appraisal Cycles** | `/performance/cycles` | Define review periods |
| **Rating Forms** | `/performance/ratings` | Individual employee assessments |
| **Reports** | `/performance/reports` | Analytics and distribution charts |

---

## Appraisal Cycles

An appraisal cycle defines a period during which employees are reviewed. You can run multiple cycles per year (e.g., mid-year and year-end) or a single annual review.

### Creating an Appraisal Cycle

1. Navigate to **Performance → Appraisal Cycles**
2. Click **New Cycle**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Cycle Name** | Yes | e.g., `Q2 2026 Review`, `Annual Appraisal 2026` |
| **Start Date** | Yes | When the appraisal period begins (e.g., first day of Q2) |
| **End Date** | Yes | When the appraisal period ends |
| **Review Deadline** | Yes | Deadline for all assessments to be submitted |
| **Department** | No | Leave blank for company-wide; select for department-specific cycles |
| **Status** | Auto | Draft → Active → Completed |
| **Description** | No | Notes about the focus areas of this cycle |

4. Click **Save**

### Cycle Status Flow

```
Draft → Active → Completed
```

- **Draft** — Cycle is being set up; no assessments visible to employees yet
- **Active** — Self-assessments and manager reviews are open
- **Completed** — Ratings finalised; cycle is locked and read-only

To move a cycle from Draft to Active, click **Activate Cycle**. This makes the assessment forms visible to all employees in scope.

---

## Assessment Forms

When a cycle is Active, every in-scope employee has a rating form generated for them.

### Form Structure

Each rating form contains the following sections:

| Section | Completed By | Description |
|---------|-------------|-------------|
| **Self-Assessment** | Employee | Employee rates themselves across all criteria |
| **Manager Review** | Reporting Manager | Manager rates the employee |
| **Final Score** | HR / Admin | Weighted composite score calculated by the system |

### Rating Criteria

Default rating criteria (configurable per cycle):

| Criterion | Description |
|-----------|-------------|
| **Work Quality** | Accuracy and thoroughness of work output |
| **Productivity** | Volume and efficiency of work completed |
| **Communication** | Verbal and written communication skills |
| **Teamwork** | Collaboration with colleagues |
| **Problem Solving** | Ability to identify and resolve issues |
| **Leadership** | (Manager-level employees) Team management effectiveness |
| **Goal Achievement** | Progress against goals set in the previous cycle |

### Scoring Scale

Each criterion is scored on a 1–5 scale:

| Score | Label |
|-------|-------|
| 5 | Outstanding |
| 4 | Excellent |
| 3 | Good |
| 2 | Average |
| 1 | Poor |

---

## Self-Assessment Process

### Employee Steps

1. Log in and navigate to **My Performance**
2. The active cycle assessment form is displayed
3. Rate yourself on each criterion (1–5)
4. Add comments for each criterion (optional but encouraged)
5. Write an overall self-summary in the text box
6. Click **Submit Self-Assessment**

Once submitted, the self-assessment is locked and the manager is notified to complete their review.

::: tip
Employees can save their progress as a draft before final submission. Use the **Save Draft** button to preserve ratings without locking the form.
:::

---

## Manager Review Process

### Manager Steps

1. Navigate to **Performance → My Team Reviews**
2. Click on an employee's pending review
3. The form shows the employee's self-assessment scores for reference
4. Enter your own rating (1–5) for each criterion
5. Add comments explaining your rating
6. Write an overall manager summary
7. Click **Submit Manager Review**

::: tip Calibration
Managers can see all their direct reports' self-scores before entering their own ratings. This helps with calibration across the team. However, manager scores are independent — the manager's score is not locked to match the employee's self-score.
:::

---

## Final Score Calculation

Once both self-assessment and manager review are submitted, the system calculates the final weighted score:

```
Final Score = (Self Score × 0.4) + (Manager Score × 0.6)
```

::: tip Configurable Weights
The weighting can be adjusted in **Settings → Performance**. Default is 40% employee / 60% manager.
:::

### Rating Labels

| Score Range | Label | Description |
|-------------|-------|-------------|
| 4.5 – 5.0 | **Outstanding** | Consistently exceeds all expectations |
| 3.5 – 4.4 | **Excellent** | Regularly exceeds expectations |
| 2.5 – 3.4 | **Good** | Meets expectations |
| 1.5 – 2.4 | **Average** | Partially meets expectations |
| 1.0 – 1.4 | **Poor** | Does not meet expectations |

---

## Finalising Ratings

After all reviews in a cycle are submitted, HR or Admin finalises the cycle.

1. Navigate to **Performance → Appraisal Cycles**
2. Click the active cycle
3. Review the summary table: pending count, submitted count, average scores
4. For any employees where both assessments are not yet submitted, you can:
   - Send a reminder email
   - Manually mark the form as complete (with a note)
5. Click **Finalise Cycle**
6. Confirm in the dialog
7. Cycle status changes to **Completed**

Once finalised:
- All forms are locked and read-only
- Scores are recorded in the employee's performance history
- Performance reports are updated with the cycle data

---

## Performance Reports

Navigate to **Reports → Performance** to access:

### Rating Distribution Chart

A bar or pie chart showing how many employees received each rating label:

- Outstanding
- Excellent
- Good
- Average
- Poor

Useful for identifying whether performance is normally distributed or skewed.

### Cycle Summary Table

For each completed cycle:

| Column | Description |
|--------|-------------|
| Cycle Name | Name and period |
| Total Assessed | Number of employees included |
| Average Score | Mean final score |
| Highest Score | Top performer score |
| Lowest Score | Lowest score in cycle |
| Outstanding Count | Employees with Outstanding rating |
| Poor Count | Employees with Poor rating |

### Department Comparison

Compare average scores across departments in the same cycle. Useful for identifying high-performing and under-performing teams.

### Individual History

View any employee's performance history across all cycles: their self-scores, manager scores, and final ratings with trend lines.
