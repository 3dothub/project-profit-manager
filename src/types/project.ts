export type ProjectStatus = "Active" | "Completed" | "On Hold";

export interface IProject {
  _id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  budget: number;
  totalExpenses: number;
  totalSalary: number;
  totalSpent: number;
  remainingBudget: number;
  profit: number;
  profitPercentage: number;
}

export interface ProjectWithSummary extends IProject {
  summary: ProjectSummary;
}
