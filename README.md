# Project Maintenance & Profit Manager

A full-stack Next.js application for tracking construction/project expenses,
employee salaries, attendance, client payments, and profit — on desktop and
mobile.

## Stack
Next.js 16 (App Router) · TypeScript · MongoDB + Mongoose · Tailwind CSS · Recharts

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env.local` file in the project root (see `.env.example`):
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/project_profit_db?retryWrites=true&w=majority
   ```
   You can use a free MongoDB Atlas cluster, or a local MongoDB instance
   (`mongodb://localhost:27017/project_profit_db`).

3. Run the dev server:
   ```
   npm run dev
   ```
   Open http://localhost:3000 — it redirects to `/projects`.

## How money is calculated

All financial math lives in one place: `src/lib/calculations.ts`.
Every API route and page calls `buildProjectSummary()` so the numbers are
always consistent.

Two distinct figures are surfaced on purpose — they answer different
questions:

```
Total Expenses = SUM(expenses.amount) for the project
Total Salary   = SUM(attendance.salary) for the project
Total Spent    = Total Expenses + Total Salary

Profit         = Project Budget - Total Spent          (cost-accounting view —
                                                          assumes the full budget
                                                          will eventually be collected)
Profit %       = (Profit / Project Budget) * 100

Total Received      = SUM(payments.amount) for the project
Outstanding Balance = Project Budget - Total Received  (what the client still owes)
Collection %         = (Total Received / Project Budget) * 100
Cash Position        = Total Received - Total Spent     (real cash-in-hand view —
                                                           what matters day-to-day,
                                                           especially early in a
                                                           project when collections
                                                           lag spending)
```

Attendance salary itself is derived from status:
`Present -> dailySalary`, `Half Day -> dailySalary / 2`, `Absent -> 0`.

A project's **budget health** badge (On Track / Near Budget / Over Budget) is
driven by `totalSpent / budget`: under 80% is on track, 80–100% is near
budget, over 100% is over budget.

Nothing is cached or hardcoded — every dashboard, card, and chart reads
live from MongoDB on each request.

## Folder structure

```
src/
  app/
    projects/                 # Projects list (dashboard/home) page — includes
                               # a cross-project totals strip (budget/spent/
                               # profit/outstanding across every project)
      [id]/                   # Project detail layout (tabs)
        page.tsx              # Project dashboard + charts
        expenses/page.tsx     # + CSV export
        payments/page.tsx     # Client payments received + CSV export
        employees/page.tsx
        attendance/page.tsx   # Daily attendance + daily summary
    api/
      projects/route.ts               # GET (list+search+filter+sort), POST
      projects/[id]/route.ts          # GET, PUT, DELETE (cascades expenses,
                                       #   employees, attendance, payments)
      projects/[id]/expenses/route.ts # GET, POST
      projects/[id]/payments/route.ts # GET, POST
      projects/[id]/employees/route.ts# GET, POST
      projects/[id]/attendance/route.ts # GET (by date or range), POST (upsert)
      projects/[id]/summary/route.ts  # GET — dashboard + chart data
      expenses/[id]/route.ts          # PUT, DELETE
      payments/[id]/route.ts          # PUT, DELETE
      employees/[id]/route.ts         # PUT, DELETE
      attendance/[id]/route.ts        # PUT, DELETE
  components/
    projects/  expenses/  payments/  employees/  attendance/  dashboard/  ui/
  lib/
    mongodb.ts        # cached connection
    calculations.ts   # single source of truth for all money math
    csv.ts             # client-side CSV export helper
  models/
    Project.ts  Employee.ts  Expense.ts  Attendance.ts  Payment.ts
  types/
    project.ts  employee.ts  expense.ts  attendance.ts  payment.ts
```

## Mobile

Every data table (Expenses, Payments, Attendance, Daily Summary) renders as
a stacked card list below the `sm` breakpoint and a full table from `sm` up,
rather than a horizontally-scrolling table on phones. The Projects list
view toggle (grid/table) is desktop-only — phones always get the card grid.
Modal forms stack to a single column on narrow screens.

## Notes

- Attendance uses a unique compound index (`employeeId + date`) and an
  upsert on POST, so marking the same employee twice on the same day
  updates the existing record instead of creating a duplicate.
- Deleting a project cascades to its expenses, employees, attendance, and
  payments (with a confirmation modal that says so). Deleting an employee
  cascades to their attendance records.
- All amounts are formatted as INR (₹) via `Intl.NumberFormat`.
- Chart colors follow a validated colorblind-safe categorical palette;
  status colors (on-track/near-budget/over-budget) are fixed and always
  paired with an icon + label, never color alone.

## Suggested next steps (not yet implemented)

- Authentication / multi-user roles (currently single-tenant, no login).
- Budget revision history (editing budget currently overwrites with no audit trail).
- File attachments on expenses (receipts) and employees (ID proof).
- Employees shared across projects instead of scoped to one project.
- PDF export of the project summary for sharing with a client.
