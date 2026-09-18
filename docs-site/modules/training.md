# Training & Development

The Training module manages the complete learning and development lifecycle: creating courses, scheduling sessions, enrolling employees, tracking completion, and measuring training effectiveness. It integrates with the Reports module to provide completion rate analytics.

---

## Overview

Navigate to **HR Panel → Training** or `/training`. The module is structured as follows:

| Section | URL | Description |
|---------|-----|-------------|
| **Courses** | `/training/courses` | Course catalogue |
| **Sessions** | `/training/sessions` | Scheduled training events |
| **Enrollments** | `/training/enrollments` | Employee enrollment and completion tracking |
| **Reports** | `/training/reports` | Completion rates and analytics |

---

## Training Courses

A course is the base unit — the subject or programme being taught. Sessions are the specific scheduled occurrences of that course.

### Creating a Course

1. Navigate to **Training → Courses**
2. Click **Add Course**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Course Title** | Yes | Name of the course (e.g., `Leadership Essentials`) |
| **Category** | Yes | Course category (Technical / Soft Skills / Compliance / Leadership / Onboarding / Safety) |
| **Delivery Mode** | Yes | In-person / Online / Hybrid / Self-paced |
| **Duration** | No | Total hours (e.g., `8 hours`) |
| **Cost per Participant** | No | Training cost for budgeting |
| **Provider** | No | Internal (company-run) or external (third-party vendor) |
| **Provider Name** | Conditional | Required if external; name of the training vendor |
| **Description** | No | Course overview and learning objectives |
| **Prerequisites** | No | Other courses that must be completed first |
| **Pass Score** | No | Minimum score percentage to mark as completed (e.g., `70`) |

4. Click **Save**

### Course Categories

| Category | Typical Courses |
|----------|----------------|
| **Technical** | Programming, tools, software-specific training |
| **Soft Skills** | Communication, presentation, conflict resolution |
| **Compliance** | GDPR, health & safety, code of conduct |
| **Leadership** | Management fundamentals, coaching, strategy |
| **Onboarding** | New employee orientation and company policies |
| **Safety** | Fire safety, first aid, workplace hazard training |

---

## Training Sessions

A session is a specific scheduled instance of a course, with defined dates, location, and participant limits.

### Creating a Session

1. Navigate to **Training → Sessions**
2. Click **Add Session**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Course** | Yes | Which course this session belongs to |
| **Session Name** | No | A distinguishing name if running multiple sessions of the same course |
| **Start Date** | Yes | Session start date and time |
| **End Date** | Yes | Session end date and time |
| **Location** | No | Room name, building, or URL for virtual sessions |
| **Facilitator** | No | The trainer (internal employee or external name) |
| **Max Participants** | No | Enrollment cap (leave blank for unlimited) |
| **Status** | Auto | Scheduled → In Progress → Completed / Cancelled |

4. Click **Save**

### Session Status Flow

```
Scheduled → In Progress → Completed
                        → Cancelled
```

- Sessions move to **In Progress** automatically when the start date passes
- HR marks them as **Completed** after the session ends
- Mark as **Cancelled** if the session is called off

---

## Enrollment

### Enrolling an Employee

HR staff enroll employees in specific sessions:

1. Navigate to **Training → Enrollments**
2. Click **Enroll Employee**
3. Select the **Session**
4. Select the **Employee** (or multiple employees)
5. Set enrollment status to **Enrolled**
6. Click **Save**

The employee receives an email notification with session details.

### Employee Self-Enrollment

Employees can browse available sessions and self-enroll:

1. Employee navigates to **My Training → Browse Sessions**
2. Finds an open session with available spots
3. Clicks **Enroll**
4. Enrollment is created with status **Enrolled** (or **Pending Approval** if HR approval is required)

::: tip Enrollment Approval
To require HR approval for self-enrollments, go to **Settings → Training → Require Enrollment Approval** and enable it. Self-enrollments will then have a **Pending Approval** status until HR reviews them.
:::

### Enrollment Statuses

| Status | Description |
|--------|-------------|
| **Enrolled** | Confirmed enrollment |
| **Pending Approval** | Awaiting HR confirmation |
| **Completed** | Employee attended and completed the session |
| **Failed** | Attended but did not achieve the pass score |
| **Absent** | Enrolled but did not attend |
| **Cancelled** | Enrollment was withdrawn |

---

## Marking Completion

After a session ends, HR marks each enrolled employee's outcome:

1. Navigate to **Training → Sessions**
2. Click the completed session
3. Click **Mark Attendance / Completion**
4. For each enrolled employee, select:
   - **Completed** — attended and passed
   - **Failed** — attended but did not meet pass score
   - **Absent** — did not attend
5. Enter a **Score** (percentage) if the session included an assessment
6. Add **Feedback** (optional — visible to the employee)
7. Click **Save Outcomes**

---

## Scores and Feedback

Each completed enrollment can have:

| Field | Description |
|-------|-------------|
| **Score** | Numeric score as a percentage (0–100) |
| **Pass/Fail** | Calculated based on the course's Pass Score threshold |
| **Feedback** | Trainer's qualitative comments |
| **Certificate** | Upload a completion certificate (PDF) |

Employees can see their own scores and feedback in **My Training → My History**.

---

## Training Reports

Navigate to **Reports → Training** or **Training → Reports** for analytics:

### Completion Rate by Category

Bar chart showing:
- Total enrollments
- Completed count
- Completion % for each category

### Monthly Training Activity

Line chart of enrollments and completions over the past 12 months.

### Department Training Coverage

Table showing how many employees per department have completed at least one course in the current year.

| Column | Description |
|--------|-------------|
| Department | Department name |
| Total Employees | Headcount |
| Trained Count | Employees with at least one completion |
| Coverage % | Trained / Total × 100 |

### Top Courses

Ranked list of courses by:
- Total enrollments
- Completion rate
- Average score

### Individual Training History

Per-employee report showing all courses attended, completion status, scores, and dates. Accessible from the employee profile under the **Training** tab.
