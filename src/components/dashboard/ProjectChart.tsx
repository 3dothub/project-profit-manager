"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { formatCurrency } from "@/lib/calculations";

const COLORS = ["#2563eb", "#f97316", "#16a34a", "#dc2626", "#9333ea", "#0891b2", "#ca8a04", "#64748b"];

interface NamedValue {
  name: string;
  value: number;
}

interface CategoryValue {
  category: string;
  amount: number;
}

interface DailyPoint {
  date: string;
  expenses: number;
  salary: number;
  total: number;
}
console.log("Test");
// 1. Expense vs Salary — bar chart
export function ExpenseVsSalaryChart({ data }: { data: NamedValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} width={90} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// 2. Daily Spending — line chart
export function DailySpendingChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} width={90} />
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend />
        <Line type="monotone" dataKey="total" name="Total Spent" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// 3. Expense by Category — pie chart
export function ExpenseCategoryChart({ data }: { data: CategoryValue[] }) {
  if (!data.length) {
    return <p className="py-10 text-center text-sm text-gray-400">No expenses recorded yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry.category}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 4. Budget Usage — pie chart (used vs remaining)
export function BudgetUsageChart({ data }: { data: NamedValue[] }) {
  const colors = ["#dc2626", "#16a34a"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.name}>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCurrency(v)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
