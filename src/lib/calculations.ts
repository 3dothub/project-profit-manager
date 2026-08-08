import { AttendanceStatus } from "@/types/attendance";
import { ProjectSummary } from "@/types/project";

/**
 * Centralized financial calculation utilities.
 * Every profit/spend figure in the app must be derived through these
 * functions so calculations stay consistent everywhere they're used.
 */

/** Salary owed for a single attendance record based on status. */
export function calculateAttendanceSalary(
  status: AttendanceStatus,
  dailySalary: number
): number {
  switch (status) {
    case "Present":
      return dailySalary;
    case "Half Day":
      return dailySalary / 2;
    case "Absent":
    default:
      return 0;
  }
}

/** Sum of a list of numeric amounts. */
export function sum(values: number[]): number {
  return values.reduce((total, v) => total + (Number.isFinite(v) ? v : 0), 0);
}

/**
 * Builds the full financial summary for a project given its raw expense
 * amounts and attendance salary amounts. This is the single source of
 * truth for the profit formula used across the dashboard, project list,
 * and summary API.
 */
export function buildProjectSummary(
  budget: number,
  expenseAmounts: number[],
  salaryAmounts: number[]
): ProjectSummary {
  const totalExpenses = sum(expenseAmounts);
  const totalSalary = sum(salaryAmounts);
  const totalSpent = totalExpenses + totalSalary;
  const remainingBudget = budget - totalSpent;
  const profit = budget - totalSpent;
  const profitPercentage = budget > 0 ? (profit / budget) * 100 : 0;

  return {
    budget,
    totalExpenses,
    totalSalary,
    totalSpent,
    remainingBudget,
    profit,
    profitPercentage,
  };
}

/** Formats a number as Indian Rupees, e.g. ₹10,00,000 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatPercentage(value: number): string {
  return `${(value || 0).toFixed(1)}%`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
