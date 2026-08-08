export type ExpenseCategory =
  | "Materials"
  | "Transport"
  | "Equipment"
  | "Food"
  | "Electricity"
  | "Rent"
  | "Tools"
  | "Other";

export type PaymentMethod = "Cash" | "Bank Transfer" | "UPI" | "Card" | "Other";

export interface IExpense {
  _id: string;
  projectId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}
