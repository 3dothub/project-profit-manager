import mongoose, { Schema, models, model } from "mongoose";

export interface ExpenseDocument extends mongoose.Document {
  projectId: mongoose.Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
}

export const EXPENSE_CATEGORIES = [
  "Materials",
  "Transport",
  "Equipment",
  "Food",
  "Electricity",
  "Rent",
  "Tools",
  "Other",
] as const;

export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "UPI", "Card", "Other"] as const;

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    date: { type: Date, required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ExpenseSchema.index({ projectId: 1, date: -1 });

export default models.Expense || model<ExpenseDocument>("Expense", ExpenseSchema);
