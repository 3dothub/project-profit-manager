"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Wallet,
  Receipt,
  Users,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Pencil,
} from "lucide-react";
import SummaryCard from "@/components/dashboard/SummaryCard";
import {
  ExpenseVsSalaryChart,
  DailySpendingChart,
  ExpenseCategoryChart,
  BudgetUsageChart,
} from "@/components/dashboard/ProjectChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AddProjectModal from "@/components/projects/AddProjectModal";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/calculations";
import { IProject, ProjectSummary } from "@/types/project";

interface SummaryResponse {
  project: IProject;
  summary: ProjectSummary;
  charts: {
    expenseVsSalary: { name: string; value: number }[];
    dailySpending: { date: string; expenses: number; salary: number; total: number }[];
    expenseByCategory: { category: string; amount: number }[];
    budgetUsage: { name: string; value: number }[];
  };
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${id}/summary`);
    const json = await res.json();
    if (json.success) setData(json.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchSummary();
  }, [id, fetchSummary]);

  if (loading || !data) return <LoadingSpinner label="Loading project dashboard..." />;

  const { project, summary, charts } = data;
  const profitPositive = summary.profit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatDate(project.startDate)}
            {project.endDate ? ` – ${formatDate(project.endDate)}` : ""} · {project.status}
          </p>
          {project.description && <p className="mt-2 max-w-2xl text-sm text-gray-600">{project.description}</p>}
        </div>
        <button className="btn-secondary" onClick={() => setShowEdit(true)}>
          <Pencil className="h-4 w-4" /> Edit Project
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryCard label="Project Budget" value={formatCurrency(summary.budget)} icon={Wallet} tone="brand" />
        <SummaryCard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={Receipt} />
        <SummaryCard label="Employee Salary" value={formatCurrency(summary.totalSalary)} icon={Users} />
        <SummaryCard label="Total Spent" value={formatCurrency(summary.totalSpent)} icon={PiggyBank} />
        <SummaryCard
          label="Remaining Budget"
          value={formatCurrency(summary.remainingBudget)}
          icon={summary.remainingBudget >= 0 ? TrendingUp : TrendingDown}
          tone={summary.remainingBudget >= 0 ? "positive" : "negative"}
        />
        <SummaryCard
          label="Profit"
          value={formatCurrency(summary.profit)}
          icon={profitPositive ? TrendingUp : TrendingDown}
          tone={profitPositive ? "positive" : "negative"}
        />
        <SummaryCard
          label="Profit %"
          value={formatPercentage(summary.profitPercentage)}
          icon={Percent}
          tone={profitPositive ? "positive" : "negative"}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Expense vs Salary</h3>
          <ExpenseVsSalaryChart data={charts.expenseVsSalary} />
        </div>
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Budget Usage</h3>
          <BudgetUsageChart data={charts.budgetUsage} />
        </div>
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Daily Spending</h3>
          <DailySpendingChart data={charts.dailySpending} />
        </div>
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Expense by Category</h3>
          <ExpenseCategoryChart data={charts.expenseByCategory} />
        </div>
      </div>

      {showEdit && (
        <AddProjectModal
          editingProject={project}
          onClose={() => setShowEdit(false)}
          onCreated={() => fetchSummary()}
        />
      )}
    </div>
  );
}
