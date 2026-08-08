"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { IExpense } from "@/types/expense";

const CATEGORIES = ["Materials", "Transport", "Equipment", "Food", "Electricity", "Rent", "Tools", "Other"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "UPI", "Card", "Other"];

interface ExpenseModalProps {
  projectId: string;
  editingExpense?: IExpense | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ExpenseModal({ projectId, editingExpense, onClose, onSaved }: ExpenseModalProps) {
  const [form, setForm] = useState({
    date: editingExpense?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    category: editingExpense?.category ?? "Materials",
    description: editingExpense?.description ?? "",
    amount: editingExpense?.amount?.toString() ?? "",
    paymentMethod: editingExpense?.paymentMethod ?? "Cash",
    notes: editingExpense?.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.description.trim()) return setError("Description is required");
    if (!form.amount || Number(form.amount) <= 0) return setError("Amount must be greater than 0");

    setSubmitting(true);
    try {
      const url = editingExpense
        ? `/api/expenses/${editingExpense._id}`
        : `/api/projects/${projectId}/expenses`;
      const method = editingExpense ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Something went wrong");
        return;
      }

      toast.success(editingExpense ? "Expense updated" : "Expense added");
      onSaved();
      onClose();
    } catch {
      setError("Failed to reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={editingExpense ? "Edit Expense" : "Add Expense"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Expense Date</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-field">Description</label>
          <input
            className="input-field"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="e.g. Cement bags purchase"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Amount (₹)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="input-field"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Payment Method</label>
            <select
              className="input-field"
              value={form.paymentMethod}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-field">Notes (optional)</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : editingExpense ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
