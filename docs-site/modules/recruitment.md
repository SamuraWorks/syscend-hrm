# Recruitment & ATS

The Recruitment module provides a complete Applicant Tracking System (ATS) integrated directly into Syscend-HRM. It covers the full hiring pipeline — from publishing job openings to extending offers and converting successful candidates into employees.

---

## Overview

Navigate to **HR Panel → Recruitment** or `/recruitment`. The module includes:

| Section | URL | Description |
|---------|-----|-------------|
| **Job Postings** | `/recruitment/jobs` | Create and manage open positions |
| **Applications** | `/recruitment/applications` | View and manage all candidates |
| **Pipeline Board** | `/recruitment/board` | Kanban-style stage management |
| **Interviews** | `/recruitment/interviews` | Schedule and record interviews |
| **Offers** | `/recruitment/offers` | Extend and track job offers |

---

## Job Postings

Job postings represent open vacancies that you are actively hiring for.

### Creating a Job Posting

1. Navigate to **Recruitment → Jobs**
2. Click **Post a Job**
3. Fill in the job details:

| Field | Required | Description |
|-------|----------|-------------|
| **Job Title** | Yes | The position being advertised |
| **Department** | Yes | Which department this role belongs to |
| **Position** | Yes | Linked position from the Organisation module |
| **Location** | No | Office / Remote / Hybrid + city name |
| **Employment Type** | Yes | Full-time / Part-time / Contract / Intern |
| **Experience Required** | No | Minimum years of experience |
| **Salary Range** | No | Min and max salary (can be hidden from candidates) |
| **Application Deadline** | No | Last date for applications |
| **Job Description** | Yes | Rich text description of responsibilities |
| **Requirements** | Yes | Skills, qualifications, and experience required |
| **Status** | Yes | Draft / Active / Paused / Closed |

4. Click **Publish** to make the posting active

### Job Posting Statuses

| Status | Description |
|--------|-------------|
| **Draft** | Not yet visible; still being prepared |
| **Active** | Open for applications |
| **Paused** | Temporarily not accepting new applications |
| **Closed** | Position filled or abandoned |

---

## Application Pipeline Stages

Every application progresses through a series of stages. The default pipeline stages are:

| Stage | Description |
|-------|-------------|
| **Applied** | Application received, not yet reviewed |
| **Screening** | Initial review by HR |
| **Interview** | Candidate invited for interview |
| **Assessment** | Technical test or assignment phase |
| **Offer** | Job offer extended |
| **Hired** | Offer accepted, ready for onboarding |
| **Rejected** | Not selected at any stage |
| **Withdrawn** | Candidate withdrew their application |

### Pipeline Board (Kanban View)

The **Pipeline Board** at `/recruitment/board` displays all active applications as cards in a Kanban layout, grouped by stage.

- Drag and drop cards between stage columns to advance candidates
- Click a card to view the full application
- Filter by Job Posting to see candidates for a specific role

---

## Managing Candidates

### Viewing Applications

From **Recruitment → Applications**, you can see all submissions with:

| Column | Description |
|--------|-------------|
| Candidate Name | Full name |
| Job Posting | Which role they applied for |
| Current Stage | Pipeline stage |
| Applied Date | When the application was submitted |
| Source | How they applied (Job Board, Referral, etc.) |
| Rating | Recruiter's star rating (1–5) |

### Candidate Profile

Each application has a detailed profile:

- **Summary** — Stage, applied date, source, notes
- **Resume/CV** — Uploaded document (PDF or DOCX)
- **Cover Letter** — Text or uploaded file
- **Personal Details** — Name, email, phone, LinkedIn
- **Interview History** — All scheduled and completed interviews
- **Notes & Feedback** — Internal recruiter notes
- **Timeline** — Stage change history with dates and notes

### Adding Notes

1. Open the candidate profile
2. Click **Add Note**
3. Type your note (supports markdown)
4. Click **Save Note**

Notes are visible to all recruiters and HR managers but not to the candidate.

---

## Interview Scheduling

### Scheduling an Interview

1. From the candidate profile, click **Schedule Interview**
2. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Interview Type** | Yes | Phone / Video / In-person / Technical |
| **Interview Date** | Yes | Date and time |
| **Duration** | No | Expected length in minutes |
| **Interviewer(s)** | Yes | Select from employee list |
| **Location / Link** | No | Room name or video call URL |
| **Notes** | No | Preparation notes for interviewers |

3. Click **Schedule**

The candidate is moved to the **Interview** stage. Interviewers receive an email notification.

### Recording Interview Feedback

After the interview:

1. Open the candidate profile
2. Click the scheduled interview entry
3. Click **Add Feedback**
4. Rate the candidate (1–5 stars)
5. Add detailed notes
6. Select a recommendation: **Proceed**, **Hold**, **Reject**
7. Click **Submit Feedback**

---

## Extending an Offer

When a candidate reaches the **Offer** stage:

1. Click **Create Offer**
2. Fill in:

| Field | Description |
|-------|-------------|
| **Position** | Confirmed job title |
| **Department** | Department |
| **Start Date** | Proposed first day |
| **Salary** | Offered compensation |
| **Offer Expiry Date** | Deadline for candidate to respond |
| **Terms & Conditions** | Custom offer letter text |

3. Click **Send Offer**

The system generates an offer letter PDF and emails it to the candidate.

### Offer Status Tracking

| Status | Description |
|--------|-------------|
| **Sent** | Offer emailed to candidate |
| **Accepted** | Candidate accepted |
| **Rejected** | Candidate declined |
| **Expired** | Expiry date passed with no response |

---

## Onboarding — Converting to Employee

When an offer is **Accepted**, the candidate can be converted to a full employee record:

1. Open the accepted offer
2. Click **Convert to Employee**
3. The system pre-fills the New Employee form with the candidate's data
4. Review and complete any missing fields
5. Click **Save Employee**

The employee record is created with a status of **Active** and linked to the recruitment record for audit purposes.

---

## Recruitment Reports

From **Reports → Recruitment**:

- Open positions count
- Applications by stage (funnel chart)
- Time-to-hire per role
- Source effectiveness (which channels bring the best candidates)
- Offer acceptance rate
