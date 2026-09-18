# Module 08: Performance Management

## Status: `🔄 IN PROGRESS`

| Field | Value |
|-------|-------|
| **Priority** | MEDIUM |
| **Phase** | 5 (Weeks 17–19) |
| **Depends On** | Module 02 (Employee Management) |

---

## Overview

Performance management covers the full appraisal cycle: employees set goals, managers review progress, and HR finalises ratings. Includes self-assessment, manager review, optional 360° feedback, and performance history.

---

## Backend Tasks

### Database Schema
- [ ] `performance_cycles` — id, name, start_date, end_date, status (active/closed), created_by
- [ ] `performance_goals` — id, employee_id, cycle_id, title, description, weight, progress (0–100), status (draft/active/completed), due_date
- [ ] `performance_reviews` — id, employee_id, cycle_id, reviewer_id, type (self/manager/peer), status (pending/submitted/finalised), submitted_at
- [ ] `performance_review_items` — id, review_id, criteria, rating (1–5), comments
- [ ] `performance_ratings` — id, employee_id, cycle_id, self_score, manager_score, final_score, rating_label (Poor/Average/Good/Excellent), finalised_by, finalised_at

### API Endpoints
- [ ] `GET /performance/cycles` — list all cycles
- [ ] `POST /performance/cycles` — create cycle
- [ ] `GET /performance/cycles/{cycle}` — cycle detail with employee review statuses
- [ ] `PATCH /performance/cycles/{cycle}/close` — close cycle
- [ ] `GET /performance/goals` — employee's goals (current cycle)
- [ ] `POST /performance/goals` — create goal
- [ ] `PATCH /performance/goals/{goal}` — update progress / status
- [ ] `DELETE /performance/goals/{goal}` — delete draft goal
- [ ] `POST /performance/cycles/{cycle}/reviews` — start a review
- [ ] `PATCH /performance/reviews/{review}` — save / submit review items
- [ ] `POST /performance/reviews/{review}/finalise` — HR finalises score

### Business Logic
- [ ] Overall score = weighted average of review item ratings
- [ ] Rating label: < 2 = Poor, 2–3 = Average, 3–4 = Good, > 4 = Excellent
- [ ] Self-review auto-created when cycle becomes active for each active employee
- [ ] Manager review triggered after self-review submitted
- [ ] Notify employee when manager review is finalised

---

## Frontend Tasks

### Pages
- [ ] `performance/Index.tsx` — list of cycles, create cycle button (HR/Admin only)
- [ ] `performance/cycles/Show.tsx` — cycle detail: employee list + review status table, close cycle
- [ ] `performance/goals/Index.tsx` — employee goal list for current cycle, add/edit/progress-update
- [ ] `performance/reviews/Show.tsx` — review form: criteria rows with 1–5 star rating + comments, submit
- [ ] `performance/employees/Show.tsx` — employee performance history: past cycles, scores, trend chart

### Components
- [ ] `StarRating.tsx` — 1–5 interactive star selector
- [ ] `GoalProgressBar.tsx` — visual progress bar with inline % edit
- [ ] `ReviewStatusBadge.tsx` — pending / submitted / finalised badge
- [ ] `ScoreChart.tsx` — line chart showing score trend across cycles (recharts or simple SVG)

---

## Acceptance Criteria
- [ ] HR can create and close performance cycles
- [ ] Employees can set goals and update progress (0–100%)
- [ ] Self-assessment form saves per-criteria ratings and comments
- [ ] Manager can submit review after self-review is submitted
- [ ] Final score is calculated and labelled correctly
- [ ] Employee can view their full performance history across cycles

---

## Notes & Issues
- No 360° peer feedback in v1 — add in v2 as optional extension
- Chart library: use recharts (already available) or simple inline SVG bars to avoid new dependencies
